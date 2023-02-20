// Create clients and set shared const values outside of the handler.

// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const fetch = require('node-fetch');
// const env = require('../../secret.json');

const docClient = new dynamodb.DocumentClient();

// sam local invoke -e events/event-post-item putItemFunction
// sam build; sam local invoke -e events/event-create-user.json createUserFunction --env-vars env.json
// putItemFunction

// Get the DynamoDB table name from environment variables

const tableName = process.env.USER_TABLE
/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */

const retFailure = (data) => {
  console.error("Error!", data)
  return {
    statusCode: 500,
    body: JSON.stringify(data)
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
  }
  // All log statements are written to CloudWatch
  console.info('received:', event);

  const body = JSON.parse(event.body);
  const { email, password, name, phone_number } = body;

  const auth0ReqBody = {
    client_id: "Gwr6p98ErOSQtJXBqMXGZ8XRzBRsPQY3",
    email,
    password,
    connection: "Username-Password-Authentication",
    name,
    user_metadata: {
      phone_number
    }
  }

  // IiFlcfW3cILDV65BrUepNXygMpAyRJfq

  // Create user in auth0 db
  try {
    let response = await fetch('https://dev-86rvru3cjw5ztru0.us.auth0.com/dbconnections/signup', {
      method: 'POST',
      body: JSON.stringify(auth0ReqBody),
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
    });

    const data = await response.json();
    if (!response.ok || !(response.error == null || response.error == undefined) || data._id == null) {
      return retFailure(data);
    }

    const bio = "";

    // Create user in dynamodb
    const params = {
      TableName: tableName,
      Item: { id: data._id, name, email, phone_number, bio }
    };

    await docClient.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({
        id: data._id,
        name,
        email,
        phone_number
      })
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify(error)
    }
  }
}