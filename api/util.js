// started in 12-201 Creating the boilerplate Lambda Functions
// continued in 12-202 Writing the Lambda handlers #1

// fish out specific content of HTTP Requests' headers 12-202 Writing the Lambda handlers #1
const getUserId = (headers) => {
    return headers.app_user_id;
}

const getUserName = (headers) => {
    return headers.app_user_name;
}

// 14-233 Authorising against Cognito identity pool using this Lambda Function
// this function is to get the JWT token for use in temporary authorisation from AWS
const getIdToken = (headers) => {
    return headers.Authorization;
}


// CORS-friendly header content with which to make HTTP Response
const getResponseHeaders = () => {
    return {
        'Access-Control-Allow-Origin': '*'
    }
}



module.exports = {
    getUserId,
    getUserName,
    getResponseHeaders
}

// The module's/file's exports are an object containing (what happened to be the function) getResponseHeaders