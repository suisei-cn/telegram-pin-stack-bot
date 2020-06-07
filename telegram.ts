import axios from "axios";

function normalize(id: number) :number {
        return Number(
            String(id).replace(/^-100/,"")
        );
}

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

export async function pinMessage(bot, chat_id, message_id, notification, reply_to_message_id) {
    if (!message_id) {
        return await axios.post(`https://api.telegram.org/bot${bot}/unpinChatMessage`, {
            chat_id,
            disable_notification: !notification
        }).then(x => x.data).catch(x => {
            console.log("unpinError", x);
            return x.data;
        });
    }
    return await axios.post(`https://api.telegram.org/bot${bot}/pinChatMessage`, {
        chat_id,
        message_id,
        disable_notification: !notification
    }).then(x => x.data).catch(async x => {
        console.log("pinError", x);
        if (reply_to_message_id) {
            if (x.data.ok === false) {
                await sendMessage(bot, chat_id, `Pin message [#${message_id}](https://t.me/c/${normalize(chat_id)}/${message_id}) failed: \`${x.data.description}\``, reply_to_message_id);
            }
        }
        return x.data;
    });
}