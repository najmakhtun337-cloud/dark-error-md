module.exports = {
  command: "owner",
  description: "Show owner contacts, info, and intro video",
  category: "info",

  async execute(sock, msg) {
    const jid = msg.key.remoteJid;

    try {
      // === 1. Send Video Note (Circle Video) from Catbox ===
      const videoNoteUrl = "https://n.uguu.se/cTAnXMGL.mp4"; // Replace with your actual Catbox link

      await sock.sendMessage(jid, {
        video: { url: videoNoteUrl },
        caption: "✨ *Meet the Owner* ✨",
        gifPlayback: false,
        mimetype: "video/mp4",
        ptt: false,
        // This makes it appear as a circle video note
        viewOnce: true,
        // Optional: add waveform for voice-note style
        waveform: new Uint8Array(32).fill(0).map(() => Math.floor(Math.random() * 100)),
      }, { mimetype: "video/mp4" });

      // === 2. Send Owner Contact Card ===
      const contacts = [
        {
          displayName: "Dark Error",
          vcard: `
BEGIN:VCARD
VERSION:3.0
FN:Dark Error 
N:;Dark Error;;;
TEL;type=CELL;waid=919046579718:+919046579718
ITEM1.URL:https://wa.me/919046579718
ITEM1.X-ABLabel:📱 WhatsApp
END:VCARD`.trim(),
        }
      ];

      for (const contact of contacts) {
        await sock.sendMessage(jid, {
          contacts: {
            displayName: contact.displayName,
            contacts: [{ vcard: contact.vcard }],
          },
        });
      }

      // === 3. Send Interactive List Message ===
      await sock.sendMessage(jid, {
        text: "🖲 *Tap below to explore owner details*",
        footer: "© 2025 Darak Error • Quantum CEO",
        title: "👑 𝙾𝚆𝙽𝙴𝚁 𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝚃𝙸𝙾𝙽",
        buttonText: "📋 View Details",
        sections: [
          {
            title: "Dark Error• Tanzania",
            highlight_label: "Founder & Developer",
            rows: [
              {
                title: "👤 Name",
                description: "Dark Error",
                rowId: "owner_name",
              },
              {
                title: "🎂 Age",
                description: "Classified • N/A",
                rowId: "owner_age",
              },
              {
                title: "🌍 Country",
                description: "Tanzania 🇹🇿",
                rowId: "owner_country",
              },
              {
                title: "💼 Role",
                description: "Bot Developer • CEO",
                rowId: "owner_role",
              },
              {
                title: "🔗 WhatsApp",
                description: "Chat with Owner",
                rowId: "owner_chat",
              },
            ],
          },
        ],
      }, {});

      // === Optional: React to user's message ===
      await sock.sendMessage(jid, {
        react: { text: "🌟", key: msg.key },
      });

    } catch (error) {
      console.error("Owner command error:", error);
      await sock.sendMessage(jid, {
        text: "⚠️ Failed to load owner info. Try again later.",
      }, { quoted: msg });
    }
  },
};
