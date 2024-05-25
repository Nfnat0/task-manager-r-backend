const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');

module.exports.createTask = async (event) => {
  const body = JSON.parse(event.body);
  const taskId = uuidv4();

  const params = {
    TableName: process.env.TABLE_NAME,
    Item: {
      taskId: taskId,
      title: body.title,
      description: body.description,
    },
  };

  await dynamo.put(params).promise();

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE',
    },
    body: JSON.stringify({ message: 'Task created successfully', taskId: taskId }),
  };
};

module.exports.getTasks = async (event) => {
  const params = {
    TableName: process.env.TABLE_NAME,
  };

  const result = await dynamo.scan(params).promise();

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE',
    },
    body: JSON.stringify(result.Items),
  };
};
