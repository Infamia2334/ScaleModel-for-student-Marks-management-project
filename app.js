const env = require('dotenv').config()
const { timeStamp } = require("console")
const express = require("express")
const app = express();
const http = require('http')
const mongoose = require("mongoose")
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")




//Serving static styles and images:
app.use(express.static("public"))                                                                   
app.use("/css", express.static(__dirname  + "public/styles"))
app.use("/img", express.static(__dirname + "public/images"))

app.use(express.urlencoded({extended:false}))

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
}))

//Inititalising passport
app.use(passport.initialize())
app.use(passport.session())
//Connecting to mongoose
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser : true, useUnifiedTopology: true})

 mongoose.set('useCreateIndex', true)

// Making Schemas for db:
const userSchema = new mongoose.Schema ({
    
    username: String,
    password: String

})


userSchema.plugin(passportLocalMongoose)

const User = new mongoose.model("User", userSchema)

//Using passport to create a local login strategy
passport.use(User.createStrategy())

//Serializing & deserializing current passport session
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// //Creating Method for setting User password using pbkdf2 hashing algorithm
// userSchema.methods.setPassword = function(password){
//     this.salt = crypto.randomBytes(16).toString("hex")
//     this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex")
// }

// //Creating method to validate password:
// userSchema.methods.validPassword = function(password){
//     var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex")
//     return this.hash === hash
// }
            
// userSchema.plugin(uniqueValidator, {message: "is already taken"})
// mongoose.model("user", userSchema);

//Setting Views for ejs:
app.set("views", "./views")
app.set("view engine", "ejs" )

//Rendering pages:
app.get('/', function(req, res){
    res.render("register")
})
app.get('/login', function(req, res){
    res.render("signin")
})

app.get("/home", function(req, res){
    if(req.isAuthenticated()){
        res.render("home")
    }
    else{
        res.redirect("/login")
    }
})

//POST METHODS FOR FORMS:
app.post('/', function(req, res){
    
    User.register({username: req.body.email}, req.body.password, function(err, user){
        if(err){
            console.log(err)
            res.redirect("/")
        }
        else{
                passport.authenticate("local")(req, res, function(){
                res.redirect("/home")
            })
        }
    })
})

// app.post("/login", function(req, res){})



app.listen(3000, function(){
    console.log("Server started on local port 3000")
})
