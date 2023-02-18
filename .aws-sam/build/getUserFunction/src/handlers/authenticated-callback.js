
exports.authenticatedUserCallbackHandler = async (event) => {
  if (event.httpMethod !== 'GET') {
      throw new Error(`getAllItems only accept GET method, you tried: ${event.httpMethod}`);
  }
  // All log statements are written to CloudWatch
  console.info('received:', event);

  let response = {};

  response = {
    statusCode: 200,
    body: 'success!'
  }

  // All log statements are written to CloudWatch
  console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
  return response;
}