import { APIGatewayProxyHandler } from "aws-lambda";
import { getChatMember } from "./telegram";
import { push, deltop, clearmsg, replyWithStack, pinFirst } from "./features";

const BOT_KEY = process.env.TELEGRAM_TOKEN || "";

const defaultReply = {
  statusCode: 200,
  body: JSON.stringify({
    message: `OK`,
  }),
};

export const handler: APIGatewayProxyHandler = async (event, _context) => {
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Bad JSON: ${e}`,
      }),
    };
  }
  if (!body.message) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Not changed`,
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
        message: `Not changed`,
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
        message: `Not changed`,
      }),
    };
  }

  if (msg.text.startsWith("/stack")) {
    // Return the stack
    await replyWithStack(msg, chat_id);
  } else {
    if (msg.text.startsWith("/pop")) {
      await pinFirst(msg, chat_id);
    } else if (msg.text.startsWith("/push")) {
      await push(msg, chat_id);
    } else if (msg.text.startsWith("/deltop")) {
      await deltop(msg, chat_id);
    } else if (msg.text.startsWith("/clear")) {
      await clearmsg(msg, chat_id);
    } else if (msg.text.startsWith("/replacetop")) {
      await deltop(msg, chat_id);
      await push(msg, chat_id);
    } else if (msg.text.startsWith("/update")) {
      await pinFirst(msg, chat_id, false);
    }
  }

  return defaultReply;
};
