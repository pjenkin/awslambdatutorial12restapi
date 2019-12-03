// started in 12-201 Creating the boilerplate Lambda Functions
// carried on in 12-202 Writing the Lambda Handlers #1


/**
 * ROUTE: POST /note - the endpoint
 */

 const AWS = require('aws-sdk');
 AWS.config.update({region: 'eu-west-2'});

const moment = require('moment');       // check package.json to see if these npm modules are yet installed
const uuidv4 = require('uuid/v4');
const util = require('./util.js');      // get our own utility functions

 const dynamodb = new AWS.DynamoDB.DocumentClient();
 const tableName = process.env.NOTES_TABLE      // NOTES_TABLE environment variable in serverless.yml template

 exports.handler = async(event) =>
 {
     try {
         // function's main logic to go here
        let item = JSON.parse(event.body).Item;
        item.user_id = util.getUserId(event.headers);
        item.user_name = util.getUserName(event.headers);

        item.note_id = item.user_id + ':' + uuidv4();   // UUID'd string for partition key value (cf )
        item.timestamp = moment.unix();
        item.expires = moment.add(90, 'days'), unix();

        let data = await dynamodb.put({
            TableName: tableName,
            Item: item
        }).promise();       // Add this note as a record to the dynamodb table

         return {       // Properly-formed HTTP response (status code and headers/body response)
            statusCode: 200,
            headers: util.getResponseHeaders(),
            body: JSON.stringify(item)      // Body content dependent on Lambda Function type and result
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