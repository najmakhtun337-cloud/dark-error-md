// db.js
const { Octokit } = require("@octokit/rest");
const fetch = require("node-fetch");

// ==================== CONFIG ====================
const config = {
    AUTO_VIEW_STATUS: 'true',
    AUTO_LIKE_STATUS: 'true',
    AUTO_RECORDING: 'true',
    AUTO_LIKE_EMOJI: ['💥', '👍', '😍', '💗', '🎈', '🎉', '🥳', '😎', '🚀', '🔥'],
    PREFIX: '.',
    MAX_RETRIES: 3,
    GROUP_INVITE_LINK: 'https://chat.whatsapp.com/G3ChQEjwrdVBTBUQHWSNHF?mode=wwt',
    ADMIN_LIST_PATH: './lib/admin.json',
    RCD_IMAGE_PATH: './lod-x-free.jpg',
    NEWSLETTER_JID: '1@newsletter',
    NEWSLETTER_MESSAGE_ID: '428',
    OTP_EXPIRY: 300000,
    OWNER_NUMBER: '255778018545',
    CHANNEL_LINK: 'https://whatsapp.com/channel/0029VbBDVEEHLHQdjvSGpU1q',

    // Will be synced from GitHub
    LANG: 'EN',
    ANTI_BAD: [],
    MAX_SIZE: 100,
    ONLY_GROUP: false,
    ANTI_LINK: [],
    ANTI_BOT: [],
    ALIVE: 'default',
    FOOTER: 'Loft Free Bot',
    LOGO: 'https://files.catbox.moe/deeo6l.jpg'
};

// ==================== OCTOKIT ====================
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const owner = process.env.GITHUB_REPO_OWNER;
const repo = process.env.GITHUB_REPO_NAME;

// ==================== HELPERS ====================
async function githubApiRequest(method, url, data = {}) {
    const opts = { owner, repo, ...data };
    try {
        const res = await octokit.request(`${method} ${url}`, opts);
        return res.data;
    } catch (e) {
        throw new Error(`GitHub API: ${e.message}`);
    }
}

async function getFile(path, fileName) {
    try {
        const { data } = await octokit.repos.getContent({
            owner, repo, path: `${path}/${fileName}`, ref: 'main'
        });
        return data;
    } catch (e) {
        if (e.status === 404) return null;
        throw e;
    }
}

// ==================== REPO CHECK & CREATE ====================
async function checkRepoAvailability() {
    try {
        await octokit.repos.get({ owner, repo });
        return true;
    } catch (e) {
        return e.status === 404 ? false : Promise.reject(e);
    }
}

async function connectdb() {
    const exists = await checkRepoAvailability();

    if (!exists) {
        await octokit.repos.createForAuthenticatedUser({
            name: repo,
            private: true,
            auto_init: true
        });

        const defaultSettings = {
            LANG: 'EN',
            ANTI_BAD: [],
            MAX_SIZE: 100,
            ONLY_GROUP: false,
            ANTI_LINK: [],
            ANTI_BOT: [],
            ALIVE: `default`,
            FOOTER: 'Loft Free Bot',
            LOGO: `https://files.catbox.moe/deeo6l.jpg`
        };

        await githubCreateFile("settings", "settings.json", JSON.stringify(defaultSettings, null, 2));
        console.log(`Database repo "${repo}" created 🛢️`);
    } else {
        console.log("Database connected 🛢️");
    }

    await updb(); // sync config
}

// ==================== FILE OPERATIONS ====================
async function githubCreateFile(path, fileName, content) {
    return githubApiRequest('PUT', '/repos/{owner}/{repo}/contents/{path}', {
        path: `${path}/${fileName}`,
        message: `Create ${fileName}`,
        content: Buffer.from(content).toString('base64'),
        branch: 'main'
    });
}

async function githubUpdateFile(path, fileName, content, sha) {
    return githubApiRequest('PUT', '/repos/{owner}/{repo}/contents/{path}', {
        path: `${path}/${fileName}`,
        message: `Update ${fileName}`,
        content: Buffer.from(content).toString('base64'),
        sha,
        branch: 'main'
    });
}

async function githubDeleteFile(path, fileName, sha) {
    return githubApiRequest('DELETE', '/repos/{owner}/{repo}/contents/{path}', {
        path: `${path}/${fileName}`,
        message: `Delete ${fileName}`,
        sha,
        branch: 'main'
    });
}

async function githubGetFileContent(path, fileName) {
    const file = await getFile(path, fileName);
    if (!file) throw new Error(`${path}/${fileName} not found`);
    const res = await fetch(file.download_url);
    return res.text();
}

async function githubClearAndWriteFile(path, fileName, content) {
    const file = await getFile(path, fileName);
    if (!file) return githubCreateFile(path, fileName, content);
    return githubUpdateFile(path, fileName, content, file.sha);
}

// ==================== CMD STORE (Non-Btn/data.json) ====================
async function ensureDataFile() {
    try {
        await githubGetFileContent("Non-Btn", "data.json");
    } catch {
        await githubCreateFile("Non-Btn", "data.json", "[]");
    }
}

async function updateCMDStore(MsgID, CmdID) {
    try {
        await ensureDataFile();
        const raw = await githubGetFileContent("Non-Btn", "data.json");
        const data = JSON.parse(raw);
        data.push({ [MsgID]: CmdID });
        await githubClearAndWriteFile("Non-Btn", "data.json", JSON.stringify(data, null, 2));
        return true;
    } catch (e) {
        console.error("updateCMDStore:", e);
        return false;
    }
}

async function isbtnID(MsgID) {
    try {
        await ensureDataFile();
        const raw = await githubGetFileContent("Non-Btn", "data.json");
        const data = JSON.parse(raw);
        return data.some(item => item[MsgID] !== undefined);
    } catch {
        return false;
    }
}

async function getCMDStore(MsgID) {
    try {
        await ensureDataFile();
        const raw = await githubGetFileContent("Non-Btn", "data.json");
        const data = JSON.parse(raw);
        const entry = data.find(item => item[MsgID] !== undefined);
        return entry ? entry[MsgID] : null;
    } catch (e) {
        console.error("getCMDStore:", e);
        return null;
    }
}

function getCmdForCmdId(CMD_ID_MAP, cmdId) {
    const entry = CMD_ID_MAP.find(e => e.cmdId === cmdId);
    return entry ? entry.cmd : null;
}

// ==================== SETTINGS INPUT / GET ====================
async function input(setting, value) {
    try {
        const raw = await githubGetFileContent("settings", "settings.json");
        const settings = JSON.parse(raw);
        if (!(setting in settings)) throw new Error(`Invalid setting: ${setting}`);

        settings[setting] = value;
        config[setting] = value;

        await githubClearAndWriteFile("settings", "settings.json", JSON.stringify(settings, null, 2));
        return true;
    } catch (e) {
        console.error("input():", e);
        return false;
    }
}

async function get(setting) {
    try {
        const raw = await githubGetFileContent("settings", "settings.json");
        const settings = JSON.parse(raw);
        return settings[setting] ?? null;
    } catch {
        return null;
    }
}

async function updb() {
    try {
        const raw = await githubGetFileContent("settings", "settings.json");
        const settings = JSON.parse(raw);
        Object.keys(config).forEach(k => {
            if (k in settings) {
                config[k] = (k === 'MAX_SIZE') ? Number(settings[k]) : settings[k];
            }
        });
        console.log("Config synced from GitHub ✅");
    } catch (e) {
        console.error("updb():", e);
    }
}

async function updfb() {
    const defaults = {
        LANG: 'EN',
        ANTI_BAD: [],
        MAX_SIZE: 100,
        ONLY_GROUP: false,
        ANTI_LINK: [],
        ANTI_BOT: [],
        ALIVE: `default`,
        FOOTER: 'Mr Loft',
        LOGO: `https://files.catbox.moe/deeo6l.jpg`
    };
    await githubClearAndWriteFile("settings", "settings.json", JSON.stringify(defaults, null, 2));
    Object.assign(config, defaults);
    config.MAX_SIZE = 100;
    console.log("Database reset to defaults ✅");
}

// ==================== EXPORTS ====================
module.exports = {
    config,
    connectdb,
    input,
    get,
    updb,
    updfb,
    updateCMDStore,
    isbtnID,
    getCMDStore,
    getCmdForCmdId,
    githubClearAndWriteFile,
    githubGetFileContent
};