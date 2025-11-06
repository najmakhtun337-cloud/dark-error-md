const axios = require('axios');
const yts = require('yt-search');
const ddownr = require('denethdev-ytmp3');
const sharp = require('sharp');

const activeReplyHandlers = new Map(); // ✅ Prevent duplicate replies per message

module.exports = {
  command: "song",
  description: "Download a YouTube song in voice note, document, or normal format",
  react: "🎵",
  category: "download",

  execute: async (socket, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || from;
    const input = args.join(" ").trim();

    const getThumbnailBuffer = async (url) => {
      try {
        const { data } = await axios.get(url, { responseType: 'arraybuffer' });
        return await sharp(data).resize(300, 300).jpeg({ quality: 80 }).toBuffer();
      } catch (err) {
        console.error("Thumbnail Error:", err);
        return null;
      }
    };

    const extractYouTubeId = (url) => {
      const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = url.match(regex);
      return match ? match[1] : null;
    };

    const convertToYoutubeLink = (query) => {
      const id = extractYouTubeId(query);
      return id ? `https://www.youtube.com/watch?v=${id}` : query;
    };

    if (!input) {
      return await socket.sendMessage(from, {
        text: "❌ *Please provide a YouTube title or link!*\n\nExample: *.song Faded Alan Walker*",
      }, { quoted: msg });
    }

    try {
      const fixedQuery = convertToYoutubeLink(input);
      const search = await yts(fixedQuery);
      const data = search.videos[0];

      if (!data) {
        return await socket.sendMessage(from, {
          text: "❌ No matching result found.",
        }, { quoted: msg });
      }

      const result = await ddownr.download(data.url, 'mp3');
      const downloadLink = result.downloadUrl;

      
      const caption =
`
╭───────────────⭓  
│  
│  🎼 *${data.title}*
│  📅 ᴜᴘʟᴏᴀᴅᴇᴅ: ${data.ago}
│  ⏱️ ᴅᴜʀᴀᴛɪᴏɴ: ${data.timestamp}
│  👁️ ᴠɪᴇᴡꜱ: ${data.views}
│  🔗 ᴜʀʟ: ${data.url}
│  
│  🔢 *ʀᴇᴘʟʏ ᴡɪᴛʜ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ:*
│  
│  ╭─────────────●●►
│  ├ 🔊 *1* ᴠᴏɪᴄᴇ ɴᴏᴛᴇ
│  ├ 📁 *2* ᴅᴏᴄᴜᴍᴇɴᴛ ꜰɪʟᴇ
│  ├ 🎵 *3* ɴᴏʀᴍᴀʟ ᴀᴜᴅɪᴏ
│  ╰─────────────●●►
│  
╰───────────────⭓
𝚙𝚘𝚠𝚎𝚛𝚎𝚍 𝚋𝚢 𝚂𝚒𝚛 𝙻𝙾𝙵𝚃
`;

      const sentMsg = await socket.sendMessage(from, {
        image: { url: data.thumbnail },
        caption
      }, { quoted: msg });

      const msgId = sentMsg.key.id;
      if (activeReplyHandlers.has(msgId)) return; // already handled

      const messageListener = async (messageUpdate) => {
        try {
          const mek = messageUpdate.messages?.[0];
          if (!mek?.message) return;

          const replyTo = mek.message.extendedTextMessage?.contextInfo?.stanzaId;
          if (replyTo !== msgId) return;

          const text = mek.message.conversation || mek.message.extendedTextMessage?.text;
          if (!text) return;

          await socket.sendMessage(from, { react: { text: "✅", key: mek.key } });

          switch (text.trim()) {
            case "1": // Voice Note
              await socket.sendMessage(from, {
                audio: { url: downloadLink },
                mimetype: "audio/mpeg",
                ptt: true
              }, { quoted: mek });
              break;

            case "2": // Document
              await socket.sendMessage(from, {
                document: { url: downloadLink },
                mimetype: "audio/mpeg",
                jpegThumbnail: await getThumbnailBuffer(data.thumbnail),
                fileName: `${data.title}.mp3`,
                caption: `${data.title}\n\n> 𝙻𝚘𝚏𝚝 𝙵𝚛𝚎𝚎 𝙱𝚘𝚝`
              }, { quoted: mek });
              break;

            case "3": // Normal Audio
              await socket.sendMessage(from, {
                audio: { url: downloadLink },
                mimetype: "audio/mpeg",
                ptt: false
              }, { quoted: mek });
              break;

            default:
              await socket.sendMessage(from, {
                text: "❌ Invalid option. Please reply with *1*, *2*, or *3*.",
              }, { quoted: mek });
          }

        } catch (err) {
          console.error("Listener Error:", err);
        }
      };

      socket.ev.on("messages.upsert", messageListener);
      activeReplyHandlers.set(msgId, true);

    } catch (e) {
      console.error("Song Error:", e);
      await socket.sendMessage(from, {
        text: `⚠️ *Error occurred:* ${e.message || "Unknown error"}`,
      }, { quoted: msg });
    }
  }
};
    
