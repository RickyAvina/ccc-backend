// Create clients and set shared const values outside of the handler.

// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
const fetch = require('node-fetch');

const docClient = new dynamodb.DocumentClient();

// sam local invoke -e events/event-post-item putItemFunction
// sam local invoke -e events/event-create-user.json createUserFunction --env-vars env.json
// putItemFunction

// Get the DynamoDB table name from environment variables
// const tableName = 'ccc-creator-studio-UserTable-JPN3IAVP0MY0'

const tableName = process.env.USER_TABLE
console.log("tableName: " + tableName);
/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */




function addUserDynamoDB(id, name, email, phone_number, bio = "") {
  return new Promise((resolve, reject) => async () => {
    try {
      const params = {
        TableName: tableName,
        Item: { id: id, name: name, email, phone_number, bio }
      };

      const result = await docClient.put(params).promise();
      console.log("Success", result);

      // response = {
      //     statusCode: 200,
      //     body: JSON.stringify({
      //       id,
      //       name,
      //       email,
      //       phone_number,
      //       bio
      //     })
      // };

      resolve()
    } catch (ResourceNotFoundException) {
      // response = {
      //     statusCode: 404,
      //     body: "Unable to call DynamoDB. Table resource not found."
      // };

      reject("Unable to call DynamoDB. Table resource not found.")
    }
  });

  // let response = {};


  // All log statements are written to CloudWatch
  // console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
}

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

  const { client_id, email, password, connection, name, phone_number } = body;

  const auth0ReqBody = {
    client_id,
    email,
    password,
    connection,
    name,
    user_metadata: {
      phone_number
    }
  }

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