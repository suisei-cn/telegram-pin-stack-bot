import axios from "axios";

export async function sendMessage(bot, chat_id, text, reply_to_message_id = undefined) {
    return await axios.post(`https://api.telegram.org/bot${bot}/sendMessage`, {
        chat_id,
        text,
        reply_to_message_id,
        parse_mode: "Markdown"
    }).then(x => x.data);
}

export async function getChatMember(bot, chat_id, user_id) {
    return await axios.post(`https://api.telegram.org/bot${bot}/getChatMember`, {
        chat_id,
        user_id
    }).then(x => x.data.result);
}

export async function pinMessage(bot, chat_id, message_id, notification) {
    if (!message_id) {
        return await axios.post(`https://api.telegram.org/bot${bot}/unpinChatMessage`, {
            chat_id,
            message_id,
            disable_notification: !notification
        }).then(x => x.data);
    }
    return await axios.post(`https://api.telegram.org/bot${bot}/pinChatMessage`, {
        chat_id,
        message_id,
        disable_notification: !notification
    }).then(x => x.data);
}