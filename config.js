const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({
    path: './config.env'
});

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}






module.exports = {
    LANG: 'si',
    WELCOME: 'true',
    AUTO_VIEW_STATUS: 'true',
    AUTO_VOICE: 'true',
    AUTO_LIKE_STATUS: 'true',
    AUTO_RECORDING: 'false',
    HEROKU_APP_URL: '',
    AUTO_LIKE_EMOJI: ['💥', '👍', '😍', '💗', '🎈', '🎉', '🥳', '😎', '🚀', '🔥'],
    PREFIX: '.',
    MAX_RETRIES: 3,
    GROUP_INVITE_LINK: 'https://chat.whatsapp.com/Hw0JIQgGHco8BL6699CDNn',
    ADMIN_LIST_PATH: './lib/admin.json',
    RCD_IMAGE_PATH: 'https://files.catbox.moe/bkufwo.jpg',
    NEWSLETTER_JID: [
      '120363422638889358@newsletter',
      '120363422731708290@newsletter',
      '120363404947266611@newsletter',
      '120363401788545030@newsletter',
      '120363420304481096@newsletter',
      '120363405821254655@newsletter',
      '120363405157355542@newsletter',
      '120363422984664452@newsletter',
      '120363404192160985@newsletter',
      '120363405849631117@newsletter',
      '120363405957760706@newsletter'
    ],
    NEWSLETTER_MESSAGE_ID: '428',
    OTP_EXPIRY: 300000,
    OWNER_NUMBER: '919046579718',
    CHANNEL_LINK: [
  'https://whatsapp.com/channel/0029VbBQQ6v4Y9lenR8ROD3O',
  'https://whatsapp.com/channel/0029VbBQQ6v4Y9lenR8ROD3O',
  'https://whatsapp.com/channel/0029VbBQQ6v4Y9lenR8ROD3O',
  'https://whatsapp.com/channel/0029VbBQQ6v4Y9lenR8ROD3O',
  'https://whatsapp.com/channel/0029VbBQQ6v4Y9lenR8ROD3O',
  'https://whatsapp.com/channel/0029VbBQQ6v4Y9lenR8ROD3O',
  'https://whatsapp.com/channel/0029VbBQQ6v4Y9lenR8ROD3O',
  'https://whatsapp.com/channel/0029VbBQQ6v4Y9lenR8ROD3O',
  'https://whatsapp.com/channel/0029VbBQQ6v4Y9lenR8ROD3O',
  'https://whatsapp.com/channel/0029VbBQQ6v4Y9lenR8ROD3O',
  'https://whatsapp.com/channel/0029VbBQQ6v4Y9lenR8ROD3O'
]};
