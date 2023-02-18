// Create clients and set shared const values outside of the handler.

// Get the DynamoDB table name from environment variables
const userTable = process.env.USER_TABLE
console.log("USER TALBE", process.env)
// const userTable = 'ccc-creator-studio-UserTable-JPN3IAVP0MY0'


// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

// sam local invoke -e events/event-get-by-id.json getUserFunction

/**
 * A simple example includes a HTTP get method to get one item by id from a DynamoDB table.
 */
exports.getUserByIdHandler = async (event) => {
  if (event.httpMethod !== 'GET') {
    throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
  }
  // All log statements are written to CloudWatch
  console.info('received:', event);

  // Get id from pathParameters from APIGateway because of `/{id}` at template.yaml
  const id = event.pathParameters.id;
 
  // Get the item from the table
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#get-property
  let response = {};

  try {
    const params = {
      TableName : userTable,
      Key: { id: id },
    };
    console.log(params);
    
    const data = await docClient.get(params).promise();
    const item = data.Item;
   
    response = {
      statusCode: 200,
      body: JSON.stringify(item)
    };
  } catch (ResourceNotFoundException) {
    response = {
        statusCode: 404,
        body: "Unable to call DynamoDB. Table resource not found."
    };
  }
 
  // All log statements are written to CloudWatch
  console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
}
