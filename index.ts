import { APIGatewayProxyHandler } from 'aws-lambda';
import { readStackFromGroup, putStackToGroup } from './database';
import { sendMessage, getChatMember, pinMessage } from './telegram';

const BOT_KEY = process.env.TELEGRAM_TOKEN || "";

const defaultReply = {
  statusCode: 200,
  body: JSON.stringify({
    message: `OK`
  }),
};;

function generateMessageList(stack: number[], id: number, username: string): string {
  let msgs = [];
  let chatPrefix = username ? `https://t.me/${username}/` : `https://t.me/c/${String(id).replace(/^-100/, "")}/`;
  for (const i of stack) {
    msgs.push(`[${i}](${chatPrefix}${i})`);
  }
  return msgs.join(", ");
}

export const handler: APIGatewayProxyHandler = async (event, _context) => {
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Bad JSON: ${e}`
      }),
    };
  }
  if (!body.message) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Not changed`
      }),
    };
  }
  let msg = body.message;

  if (!msg.text) return defaultReply;

  // Other commands only work in groups.
  if (msg.chat.type !== "group" && msg.chat.type !== "supergroup") {
    // SendMsg: Only group or supergroup
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Not changed`
      }),
    };
  }

  // ... and need administrator permissions.
  const chat_id = msg.chat.id;
  const user_id = msg.from.id;
  const perm = await getChatMember(BOT_KEY, chat_id, user_id);
  if (!perm.can_pin_messages && perm.status !== "creator") {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Not changed`
      }),
    };
  }

  if (msg.text.startsWith("/stack")) {
    // Return the stack
    console.log(`Viewing the pin stack for ${chat_id}`);
    let stack = await readStackFromGroup(chat_id);
    if (stack.length === 0) {
      await sendMessage(BOT_KEY, msg.chat.id, `Current pin stack is empty.`, msg.message_id);
    } else {
      await sendMessage(BOT_KEY, msg.chat.id, `Current pin stack: ${generateMessageList(stack, msg.chat.id, msg.chat.username)}`, msg.message_id);
    }
  } else {
    const my_perm = await getChatMember(BOT_KEY, chat_id, 1189170779);
    if (msg.text.startsWith("/pop")) {
      // Return the stack
      if (!my_perm.can_pin_messages) {
        console.log(`Pinning nothing for ${chat_id}`);
        await sendMessage(BOT_KEY, msg.chat.id, "I can't pin messages here. Please check the permissions.", msg.message_id);
        return defaultReply;
      } else {
        // Pin message
        let stack = await readStackFromGroup(chat_id);
        stack.pop();
        let pinId = stack[stack.length - 1];
        console.log(`Pinning ${pinId} for ${chat_id}`);
        await Promise.all([
          putStackToGroup(chat_id, stack),
          pinMessage(BOT_KEY, chat_id, pinId, msg.text.includes("notify"))
        ])
      }
    } else if (msg.text.startsWith("/push")) {
      let pushId;
      if (msg.reply_to_message) {
        pushId = msg.reply_to_message.message_id;
      } else {
        pushId = msg.text.split(" ")[1];
      }
      if (Number(pushId)) {
        console.log(`Pushing ${pushId} for ${chat_id}`);
        let stack = await readStackFromGroup(chat_id);
        if (stack[stack.length - 1] !== pushId) {
          stack.push(pushId);
          await putStackToGroup(chat_id, stack);
        }
        await pinMessage(BOT_KEY, chat_id, pushId, msg.text.includes("notify"));
      } else {
        console.log(`Pushing nothing for ${chat_id}`);
        await sendMessage(BOT_KEY, chat_id, `Which message do you want to push?`, msg.message_id);
      }
    } else if (msg.text.startsWith("/deltop")) {
      let stack = await readStackFromGroup(chat_id);
      stack.pop();
      console.log(`Removing top for ${chat_id}`);
      await Promise.all([
        putStackToGroup(chat_id, stack),
        sendMessage(BOT_KEY, chat_id, `Done.`, msg.message_id)
      ]);
    } else if (msg.text.startsWith("/clear")) {
      console.log(`Cleaning top for ${chat_id}`);
      await Promise.all([
        putStackToGroup(chat_id, []),
        sendMessage(BOT_KEY, chat_id, `Done.`, msg.message_id)
      ]);
    }
  }

  return defaultReply;
}
