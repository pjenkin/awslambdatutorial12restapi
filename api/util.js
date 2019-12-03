// started in 12-201 Creating the boilerplate Lambda Functions

// CORS-friendly header content
const getResponseHeaders = () => {
    return {
        'Access-Control-Allow-Origin': '*'
    }
}

module.exports = {
    getResponseHeaders
}

// The module's/file's exports are an object containing (what happened to be the function) getResponseHeaders