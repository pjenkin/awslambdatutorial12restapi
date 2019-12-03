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
        let query = event.queryStringParameters;
        let limit = query && query.limit ? parseInt : 5;    // quantify pagination from Request's URL or in lieu of that from a default (hard-coded here)
        let user_id = util.getUserId(event.headers);

        let params = {
            TableName: tableName,
            KeyConditionExpression: "user_id = :uid",      // NB KeyCondition Expression (cf notes - 4-85)
            ExpressionAttributeValues: {
                ":uid": user_id
            },
            Limit: limit,               // paginated
            ScanIndexForward: false     // sorted in descending order off of the sort key (timestamp here, cf serverless.yml)
        };

        let startTimeStamp = query && query.start ? parseInt(query.start) : 0;  
        // NB timestamp here is actually a record id, so this is saying "from which record are we starting this time?"

        if(startTimeStamp > 0)  // if non-zero
        {
            params.ExclusiveStartKey = {        // ExclusiveStartKey a Scan/Query API parameter for pagination
                user_id: user_id,
                timestamp: startTimeStamp
            }
        }

        let data = await dynamodb.query(params).promise();  // get the queried data (to return to user in Response HTTP body)

        return {       // properly-formed HTTP response (status code and headers/body response)
           statusCode: 200,
           headers: util.getResponseHeaders(),
           body: JSON.stringify(data)      // body content dependent on Lambda Function type and result
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