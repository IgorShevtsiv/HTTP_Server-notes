const AWS = require("aws-sdk");

const dynamo = new AWS.DynamoDB.DocumentClient();

function getCurrentDateString() {
    var today = new Date();
    var time = today.getHours() + ":" +        today.getMinutes() + ":" + today.getSeconds();
    return time;   
}




exports.handler = async (event, context) => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json"
  };

  try {
    switch (event.routeKey) {
      case "DELETE /items/{title}":
        await dynamo
          .delete({
            TableName: "Table_notes",
            Key: {
              id: event.pathParameters.title
            }
          })
          .promise();
        body = `Deleted item ${event.pathParameters.title}`;
        break;
      case "GET /items/{title}":
        body = await dynamo
          .get({
            TableName: "Table_notes",
            Key: {
              id: event.pathParameters.title
            }
          })
          .promise();
        break;
      case "GET /items":
        body = await dynamo.scan({ TableName: "Table_notes" }).promise();
        break;
      case "PUT /items":
        let requestJSON = JSON.parse(event.body);
        await dynamo
          .put({
            TableName: "Table_notes",
            Item: {
              id: requestJSON.id,
              author: requestJSON.author,
              date: getCurrentDateString(),
              title: requestJSON.title,
              content: requestJSON.content
            }
          })
          .promise();
        body = `Put item ${requestJSON.id}`;
        break;
      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers
  };
};
