const express = require("express")

const app = express();
const http = require('http')


app.use(express.static("public"))
app.use("/css", express.static(__dirname  + "public/styles"))

app.get('/', function(req, res){
    res.sendFile(__dirname + "/views/register.html")
})

app.listen(3000, function(){
    console.log("Server started on local port 3000")
})