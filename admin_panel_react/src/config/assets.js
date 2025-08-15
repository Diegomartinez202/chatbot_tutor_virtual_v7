// Centraliza rutas públicas servidas desde /public
const BASE = import.meta.env?.BASE_URL ?? "/";

const assets = {
    BOT_AVATAR: `${BASE}bot-avatar.png`,
    BOT_LOADING: `${BASE}bot-loading.png`,
    USER_AVATAR: `${BASE}favicon-32x32.png`, // opcional
};

export default assets;