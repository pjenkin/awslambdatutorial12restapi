// started in 12-201 Creating the boilerplate Lambda Functions
/**
 * ROUTE: GET /auth
 * Get temporary AWS credentials for this user (using JWT from Google Auth)
 */
// 14-233 Authorising against Cognito identity pool using this Lambda Function

const AWS = require('aws-sdk');
AWS.config.update({region: 'eu-west-2'});

const jwtDeecode = require('jwt-decode');       //  14-233 good ol JWT - must also alter package.json npm install --save jwt-decode to install this on container 
const util = require('./util.js');      // get our own utility functions

const cognitoIdentity = new AWS.CognitoIdentity;
const identityPoolId = process.env.COGNITO_IDENTITY_POOL_ID;    // cf # 14-230 Adding Cognito federated identity authorizer

exports.handler = async(event) =>
{
    try {
        let id_token = util.getIdToken(event.headers);            // get the relevant part of the JWT token to pass on for AWS authorisation (use bespoke utilty function)

        let params = {
            IdentityPoolId: identityPoolId,
            Logins: {
                'accounts.google.com': id_token
            }
        };      // this params to first get an ID for this user

        let data = await cognitoIdentity.getId(params).promise();

        params = {
            IdentityId: data.IdentityId,
            Logins: {
                'accounts.google.com': id_token
            }
        }       // this params to be used with getting this user a temporary identity credentials for AWS from Cognito

        data = await cognitoIdentity.getCredentialsForIdentity(params).promise();
        // the front-end will also need to know the username (currently encoded)
        let decoded = jwtDecode(id_token);
        data.user_name = decoded.name;

        return {
            statusCode: 200,
            headers: util.getResponseHeaders(),
            body: JSON.stringify(data)
        };

    } catch (err)
        {
        console.log("Error", err);
        return {                        // NB 'return' d'expect opening brace on same line
           statusCode: err.statusCode ? err.statusCode : 500,  // default 500 "internal server error"
           headers: util.getResponseHeaders(),                 // use our utility file for header content
           body: JSON.stringify({error: err.name ? err.name : "Exception occurred",
           message: err.message ? err.message : "Unknown error"
           })
        };
    }
}