import { getIdList, generateMessageList } from './utils'
import { readStackFromGroup, putStackToGroup } from './database'
import { sendMessage, pinMessage, getChatMember } from './telegram'

const BOT_KEY = process.env.TELEGRAM_TOKEN || ''

async function validateState(msg: any, chat_id: number): Promise<boolean> {
  const my_perm = await getChatMember(BOT_KEY, chat_id, 1189170779)
  if (!my_perm.can_pin_messages) {
    console.log(`Pinning nothing for ${chat_id}`)
    await sendMessage(
      BOT_KEY,
      msg.chat.id,
      "I can't pin messages here. Please check the permissions.",
      msg.message_id
    )
    return false
  }
  return true
}

export async function replyWithStack(msg: any, chat_id: number) {
  console.log(`Viewing the pin stack for ${chat_id}`)
  let stack = await readStackFromGroup(chat_id)
  if (stack.length === 0) {
    await sendMessage(
      BOT_KEY,
      msg.chat.id,
      `Current pin stack is empty.`,
      msg.message_id
    )
  } else {
    await sendMessage(
      BOT_KEY,
      msg.chat.id,
      `Current pin stack: ${generateMessageList(
        stack,
        msg.chat.id,
        msg.chat.username
      )}.`,
      msg.message_id,
      true
    )
  }
}

export async function pinFirst(
  msg: any,
  chat_id: number,
  deleteTop: boolean = true
) {
  if ((await validateState(msg, chat_id)) === false) {
    return
  }
  let stack = await readStackFromGroup(chat_id)
  if (stack.length === 0) {
    await sendMessage(BOT_KEY, chat_id, `The stack is empty`, msg.message_id)
    return
  }
  stack.pop()
  let pinId = stack[stack.length - 1]
  console.log(`Pinning ${pinId} for ${chat_id}`)
  await pinMessage(
    BOT_KEY,
    chat_id,
    pinId,
    msg.text.includes('notify'),
    msg.message_id
  )
  if (deleteTop) {
    await putStackToGroup(chat_id, stack)
  }
}

export async function clearmsg(msg: any, chat_id: number) {
  console.log(`Cleaning for ${chat_id}`)
  await Promise.all([
    putStackToGroup(chat_id, []),
    sendMessage(BOT_KEY, chat_id, `Done.`, msg.message_id),
  ])
}

export async function deltop(msg: any, chat_id: number) {
  let stack = await readStackFromGroup(chat_id)
  stack.pop()
  console.log(`Removing top for ${chat_id}`)
  await Promise.all([
    putStackToGroup(chat_id, stack),
    sendMessage(BOT_KEY, chat_id, `Done.`, msg.message_id),
  ])
}

export async function push(msg: any, chat_id: number) {
  if ((await validateState(msg, chat_id)) === false) {
    return
  }
  let pushIdList
  let finalPinMessage = -1
  if (msg.reply_to_message) {
    pushIdList = [msg.reply_to_message.message_id]
  } else {
    pushIdList = getIdList(msg.text)
  }
  for (const pushId of pushIdList) {
    console.log(`Pushing ${pushId} for ${chat_id}`)
    let stack = await readStackFromGroup(chat_id)
    if (stack[stack.length - 1] !== pushId) {
      stack.push(pushId)
      await putStackToGroup(chat_id, stack)
    }
    finalPinMessage = pushId
  }
  if (pushIdList.length === 0) {
    console.log(`Pushing nothing for ${chat_id}`)
    await sendMessage(
      BOT_KEY,
      chat_id,
      `No valid message id found :(`,
      msg.message_id
    )
  } else {
    await pinMessage(
      BOT_KEY,
      chat_id,
      finalPinMessage,
      msg.text.includes('notify'),
      msg.message_id
    )
  }
}
