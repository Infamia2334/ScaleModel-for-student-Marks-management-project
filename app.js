const express = require("express")
const app = express();
const http = require('http')
const mongoose = require("mongoose")



//Serving static styles:
app.use(express.static("public"))                                                                   
app.use("/css", express.static(__dirname  + "public/styles"))
app.use("/img", express.static(__dirname + "public/images"))

//Connecting to mongoose
mongoose.connect("mongodb://localhost:27017/studentMarks", {useNewUrlParser : true, useUnifiedTopology: true})




//Setting Views for ejs:
app.set("views", "./views")
app.set("view engine", "ejs" )

//Rendering pages:
app.get('/', function(req, res){
    res.render("register",{link:"/login"})
})
app.get('/login', function(req, res){
    res.render("signin")
})



// app.get('/', function(req, res){
//     res.sendFile(__dirname + "/views/register.html")
// })


app.listen(3000, function(){
    console.log("Server started on local port 3000")
})
