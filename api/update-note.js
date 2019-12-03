// started in 12-201 Creating the boilerplate Lambda Functions


/**
 * ROUTE: PATCH /note/n/{note_id} - the endpoint (node_id?)
 * Update a specific note
 */

const AWS = require('aws-sdk');
AWS.config.update({region: 'eu-west-2'});

const moment = require('moment');       // check package.json to see if these npm modules are yet installed
const util = require('./util.js');      // get our own utility functions

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.NOTES_TABLE      // NOTES_TABLE environment variable in serverless.yml template

exports.handler = async(event) =>
{
    try {
        // function's main logic to go here
        // Assemble the data to store
        let item = JSON.parse(event.body).Item;
        item.user_id = util.getUserId(event.headers);
        item.user_name = util.getUserName(event.headers);

        item.expires = moment().add(90, 'days'), unix();

        let data = await dynamodb.put({
            TableName: tableName,
            Item: item,
            ConditionExpression: '#t = :t',      // cf DynamoDB notes (4-83)
            ExpressionAttributeNames: {
                '#t' : 'timestamp'      // clarifying what's what - the variable name (from the Request's endpoint/URL query string parameters)
            },
            ExpressionAttributeValues:
            {
                ':t': item.timestamp    // this field must be in the DyamoDB table, exactly thus
            }
        }).promise();

        return {       // properly-formed HTTP response (status code and headers/body response)
           statusCode: 200,
           headers: util.getResponseHeaders(),
           body: JSON.stringify(item)      // body content dependent on Lambda Function type and result
        }

    } catch (err) {
       console.log("Error",err);       // console.log will go to CloudWatch log in a Lambda Function
       return {                        // NB 'return' d'expect opening brace on same line
           statusCode: err.statusCode ? err.statusCode : 500,  // default 500 "internal server error"
           headers: util.getResponseHeaders(),                 // use our utility file for header content
           body: JSON.stringify({error: err.name ? err.name : "Exception occurred",
           message: err.message ? err.message : "Unknown error"
           })
       };
    }
}