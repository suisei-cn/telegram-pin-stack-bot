**Announcement: [Telegram added a feature to pin multi messages recently](https://telegram.org/blog/pinned-messages-locations-playlists#multiple-pinned-messages), deprecating the bot.**

## Pin Stack Bot📍

Manage a stack of pinned messages for Telegram groups.

### Deployment

This project involves AWS Lambda, AWS API Gateway as well as AWS DynamoDB, which all have "always free" tiers.

1. Register a bot on Telegram. Now you have a token for the bot.
2. Create an AWS Lambda function.
3. Add an AWS API Gateway endpoint to this function. Now you have an endpoint address for your Lambda function.
4. Create an AWS DynamoDB, and give full access of this to the role AWS just created for the Lambda function. You might need o add a policy to the role.
5. Fill in the environment variables for the Lambda function:

```
AWS_DYNAMODB_NAME - Name of your DynamoDB
AWS_DYNAMODB_REGION - Region of your DynamoDB
TELEGRAM_TOKEN - Telegram bot token
```

6. `npm install`
7. `serverless package`
8. Deploy the zip package in `.serverless/` to AWS Lambda.
9. Set the webhook of your bot at your API endpoint. You might need to visit `https://api.telegram.org/bot<YOUR TELEGRAM BOT TOKEN>/setWebhook?url=<YOUR API ENDPOINT>`.
10. Test if the bot is working.
