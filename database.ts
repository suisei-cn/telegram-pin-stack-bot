const AWS = require('aws-sdk')
const db = new AWS.DynamoDB.DocumentClient({
  api_version: '2012-08-10',
  region: process.env.AWS_DYNAMODB_REGION,
  // accessKeyId -> env.AWS_ACCESS_KEY_ID
  // secretAccessKey -> env.AWS_SECRET_ACCESS_KEY
})

const TABLE_NAME = process.env.AWS_DYNAMODB_NAME

export async function readStackFromGroup(groupid: number): Promise<number[]> {
  const r = await db
    .get({
      TableName: TABLE_NAME,
      Key: {
        groupid: String(groupid),
      },
    })
    .promise()
    .catch((err) => {
      console.error(`Error when readStackFromGroup:${groupid}:`, err)
    })
  return r?.Item?.stack || []
}

export async function putStackToGroup(groupid: number, item: number[] = []) {
  await db
    .put({
      TableName: TABLE_NAME,
      Item: {
        groupid: String(groupid),
        stack: item,
      },
    })
    .promise()
    .catch((err) => {
      console.error(`Error when putStackToGroup:${groupid}:`, err)
    })
}
