const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');

const commonHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE,PUT',
};

module.exports.createTask = async (event) => {
  const body = JSON.parse(event.body);
  const taskId = uuidv4();

  const params = {
    TableName: process.env.TABLE_NAME,
    Item: {
      taskId: taskId,
      title: body.title,
      description: body.description,
      dueDate: body.dueDate,
      completed: false,
    },
  };

  await dynamo.put(params).promise();

  return {
    statusCode: 200,
    headers: commonHeaders,
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
    headers: commonHeaders,
    body: JSON.stringify(result.Items),
  };
};

module.exports.getTaskById = async (event) => {
  const taskId = event.pathParameters.id;

  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      taskId: taskId,
    },
  };

  const result = await dynamo.get(params).promise();

  return {
    statusCode: 200,
    headers: commonHeaders,
    body: JSON.stringify(result.Item),
  };
};

module.exports.updateTask = async (event) => {
  const taskId = event.pathParameters.id;
  const body = JSON.parse(event.body);

  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      taskId: taskId,
    },
    UpdateExpression: 'set title = :title, description = :description, dueDate = :dueDate, completed = :completed',
    ExpressionAttributeValues: {
      ':title': body.title,
      ':description': body.description,
      ':dueDate': body.dueDate,
      ':completed': body.completed,
    },
    ReturnValues: 'UPDATED_NEW',
  };

  const result = await dynamo.update(params).promise();

  return {
    statusCode: 200,
    headers: commonHeaders,
    body: JSON.stringify({ message: 'Task updated successfully', result: result.Attributes }),
  };
};

module.exports.deleteTask = async (event) => {
  const taskId = event.pathParameters.id;

  const params = {
    TableName: process.env.TABLE_NAME,
    Key: {
      taskId: taskId,
    },
  };

  await dynamo.delete(params).promise();

  return {
    statusCode: 200,
    headers: commonHeaders,
    body: JSON.stringify({ message: 'Task deleted successfully' }),
  };
};
