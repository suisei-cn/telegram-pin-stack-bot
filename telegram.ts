import axios from 'axios'

function normalize(id: number): number {
  return Number(String(id).replace(/^-100/, ''))
}

export async function sendMessage(
  bot,
  chat_id,
  text,
  reply_to_message_id = undefined,
  disable_web_page_preview = false
) {
  return await axios
    .post(`https://api.telegram.org/bot${bot}/sendMessage`, {
      chat_id,
      text,
      reply_to_message_id,
      parse_mode: 'Markdown',
      disable_web_page_preview,
    })
    .then((x) => x.data)
}

export async function getChatMember(bot, chat_id, user_id) {
  return await axios
    .post(`https://api.telegram.org/bot${bot}/getChatMember`, {
      chat_id,
      user_id,
    })
    .then((x) => x.data.result)
}

export async function pinMessage(
  bot,
  chat_id,
  message_id,
  notification,
  reply_to_message_id
) {
  if (!message_id) {
    return await axios
      .post(`https://api.telegram.org/bot${bot}/unpinChatMessage`, {
        chat_id,
        disable_notification: !notification,
      })
      .then((x) => x.data)
      .catch((x) => {
        console.log('unpinError', x)
        return x.data
      })
  }
  return await axios
    .post(`https://api.telegram.org/bot${bot}/pinChatMessage`, {
      chat_id,
      message_id,
      disable_notification: !notification,
    })
    .then((x) => x.data)
    .catch(async (x) => {
      console.log('pinError', x)
      if (reply_to_message_id) {
        if (x.response.data.ok === false) {
          const desc = x.response.data.description
          if (!desc.includes('CHAT_NOT_MODIFIED')) {
            await sendMessage(
              bot,
              chat_id,
              `Pin message [#${message_id}](https://t.me/c/${normalize(
                chat_id
              )}/${message_id}) failed: \`${desc}\`. If that message exists, reply to that message with /push (or \`push_notify\`) to remind the bot of this message.`,
              reply_to_message_id
            )
          }
        }
      }
      return x.response.data
    })
}
