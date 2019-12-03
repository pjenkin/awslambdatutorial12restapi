// started in 12-201 Creating the boilerplate Lambda Functions


/**
 * ROUTE: GET /note/n/{note_id} - the endpoint (node_id?)
 * Get a specific note
 */
// 12-205 Writing the Lambda Functions #3

const AWS = require('aws-sdk');
AWS.config.update({region: 'eu-west-2'});

const _ = require('underscore');        //  underscore should be present (we can verify this by having a geek at package.json)
const util = require('./util.js');      // get our own utility functions

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.NOTES_TABLE      // NOTES_TABLE environment variable in serverless.yml template

exports.handler = async(event) =>
{
    try {
        // function's main logic to go here
        // Use the GSI  (as defined in serverless.yml) since searching the whole table for 1 record
        let note_id = decodeURIComponent(event.pathParameters.note_id); // get note id from Request URL - to be safe, decode

        let params = {
            TableName: tableName,
            IndexName: "note_id-index",
            KeyConditionExpression: "note_id = :note_id",       // variable/field definitions (or at least field definition) to follow... (why no leading '#'?)
            ExpressionAttributeValues: {
                ":note_id": note_id
            },
            Limit: 1        // should only be 1 record (note) at most
        }
        
        let data = await dynamodb.query(params).promise();
        // Use underscore empty method to check query result (Items property returned by DynamoDB document client) - should be 1 item if the note was found
        if (!_.isEmpty(data.Items))     
        {
            return {       // properly-formed HTTP response (status code and headers/body response)
            statusCode: 200,
            headers: util.getResponseHeaders(),
            body: JSON.stringify(data.Items[0])      // body content dependent on Lambda Function type and result
            }
        }
        else
        {
            return {                                // return 'not found' 404 error if no note record found in DynamoDB table
                statusCode: 404,
                headers: util.getResponseHeaders(),
            }
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