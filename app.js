const env = require('dotenv').config()

const express = require("express")
const app = express();
const http = require('http')
const mongoose = require("mongoose")
const session = require("express-session")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const passportLocalMongoose = require("passport-local-mongoose")




//Serving static styles and images:
app.use(express.static("public"))                                                                   
app.use("/css", express.static(__dirname  + "public/styles"))
app.use("/img", express.static(__dirname + "public/images"))

app.use(express.urlencoded({extended:false}))

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {}
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
passport.use(new LocalStrategy(User.authenticate()))
//Serializing & deserializing current passport session
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())



//Setting Views for ejs:
app.set("views", "./views")
app.set("view engine", "ejs" )

//Rendering pages:
app.get('/', function(req, res){
    res.render("register")
})

app.get("/home", function(req, res){
    if(req.isAuthenticated()){
        // console.log(req)
        res.render("home")
    }
    else{
        res.redirect("/login")
    }
})


app.get('/login', function(req, res){
    res.render("signin")
})


//POST METHODS FOR FORMS:
app.post('/', function(req, res){
    
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if(err){
            console.log(err)
            res.redirect("/")
        }
        else{
                passport.authenticate("local")(req, res, function(err){
                if(err){
                    console.log(err)
                }
                else{
                    res.redirect("/home")
                }
            })
        }
    })
})

// app.post("/login", function(req, res){})



app.listen(3000, function(){
    console.log("Server started on local port 3000")
})
