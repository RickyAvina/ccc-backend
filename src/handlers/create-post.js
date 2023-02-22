/**
 * Creates a post given a 
 */

const dynamodb = require('aws-sdk/clients/dynamodb');
const docClient = new dynamodb.DocumentClient();
const tableName = process.env.USER_TABLE


exports.handler = async (event) => {
  /*
   * Create a new post
   * sam build; sam local invoke -e events/event-create-post.json createPostFunction --env-vars env.json
   */

  if (event.httpMethod !== 'POST') {
    throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
  }

  
  console.info('received:', event);

  // const { Client } = require('pg');
  // const client = new Client({
  //                  user: process.env.DB_USER,
  //                  host: process.env.DB_HOST,
  //                  database: process.env.DB_DATABASE,
  //                  password: process.env.DB_PASSWORD,
  //                  port: 5432
  //                });
  // await client.connect();
  // // Your other interactions with RDS...
  // client.end();

  const body = JSON.parse(event.body);
  const { user_id, fileKey, questions: {insight, meaning, location} } = body;

  return { statusCode: 200, body: JSON.stringify("Success!") };
  // const { email, password, name, phone_number } = body;
}
