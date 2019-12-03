// started in 12-201 Creating the boilerplate Lambda Functions


/**
 * ROUTE: GET /notes - the endpoint
 * Get all notes
 */

const AWS = require('aws-sdk');
AWS.config.update({region: 'eu-west-2'});

const util = require('./util.js');      // get our own utility functions

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.NOTES_TABLE      // NOTES_TABLE environment variable in serverless.yml template

exports.handler = async(event) =>
{
    try {
        // function's main logic to go here


        return {       // properly-formed HTTP response (status code and headers/body response)
           statusCode: 200,
           headers: util.getResponseHeaders(),
           body: JSON.stringify('')      // body content dependent on Lambda Function type and result
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