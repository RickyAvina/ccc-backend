// Create clients and set shared const values outside of the handler.
const fetch = require('node-fetch');

// Get the DynamoDB table name from environment variables
const userTable = process.env.USER_TABLE
// const userTable = 'ccc-creator-studio-UserTable-JPN3IAVP0MY0'


// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();

// sam local invoke -e events/event-get-by-id.json getUserFunction
// sam build; sam local invoke -e events/event-get-by-email.json loginFunction --env-vars env.json

/**
 * A simple example includes a HTTP get method to get one item by id from a DynamoDB table.
 */
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    throw new Error(`getMethod only accept POST method, you tried: ${event.httpMethod}`);
  }
  // All log statements are written to CloudWatch
  console.info('received:', event);
  const body = JSON.parse(event.body);
  const {username: email, password } = body;
 
  // get oauth token
  let response = {};

  try {
    let { access_token } = await getOauthToken(email, password)
    var params = {
      TableName: userTable,
      IndexName: "Email-index",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ':email': email
      }
    }

    await docClient.query(params).promise()
      .then((data) => {
        if (data.Items.length != 1) {
          throw new Error("Expected 1 item, got " + data.Items.length);
        }
        const user = data.Items[0]  // {"phone_number":143490349023,"email":"john@doe.com","id":"dfkjdksfj3kfekfd","name":"John Doe","bio":""}
        user.access_token = access_token;
        response = {statusCode: 200, body: JSON.stringify(user)};
      })
      .catch((error) => { throw new Error(error)});
  } catch (e) {
    console.error(e)
    response = {statusCode: 500, body: JSON.stringify(e)}
  } finally {
    return response;
  }
}

async function getOauthToken(username, password) {
  // throws errors

  const params = new URLSearchParams({
    grant_type: "password",
    username,
    password,
    audience: "https://dev-86rvru3cjw5ztru0.us.auth0.com/api/v2/",
    scope: "email",
    client_id: "Gwr6p98ErOSQtJXBqMXGZ8XRzBRsPQY3",
    client_secret: "ARxNu23OgnnISH_5Yl6BrAS6ouX2zrwbITDbgaACd3lnjmP2heV4TRjiMObyyYIE"
  })

  const response = await fetch('https://dev-86rvru3cjw5ztru0.us.auth0.com/oauth/token', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: params
  });

  const data = await response.json()

  if (!response.ok || response.error != null) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}