const express = require('express')
var app = express()
const port = 5000

app.get('/',function(req,res) {
    res.send('Get request to home page')
})

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
})

