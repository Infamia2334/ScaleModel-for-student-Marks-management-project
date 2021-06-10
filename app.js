//Requiring all additional modules
const env = require('dotenv').config()
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

//Creating cookie session with passport
app.use(session({
    //SECRET_KEY is stored as an evironment variable in a hidden .env file
    secret: process.env.SECRET_KEY,             
    resave: false,
    saveUninitialized: false,
    cookie: {}
}))

//Inititalising passport session
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

//initialisng plugin passportLocalMongoose
userSchema.plugin(passportLocalMongoose)

//Creating new User model from userSchema in DB
const User = new mongoose.model("User", userSchema)

//Using passport to create a local login strategy
passport.use(User.createStrategy())
// passport.use(new LocalStrategy(User.authenticate()))
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
        //render home if user authenticated
        res.render("home")
    }
    else{
        //redirect to login if user not authenticated
        res.redirect("/login")
    }
})


app.get('/login', function(req, res){
    res.render("signin")
})

app.get("/logout", function(req, res){
    req.logout()
    //redirecting to register(home route) when logging out
    req.redirect("/")
})

//POST METHODS FOR FORMS:
app.post('/', function(req, res){
    //using passport.register() to register new user in database
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if(err){
            console.log(err)
            res.redirect("/")
        }
        else{
                //authenticating users
                passport.authenticate("local")(req, res, function(err){
                if(err){
                    console.log(err)
                }
                else{
                    //directly redirect to home after registration
                    res.redirect("/home")
                }
            })
        }
    })
})


app.post("/login", function(req, res){
    //creating new User:
    const user = new User({
      username: req.body.username,
      password: req.body.password
    });
  
    req.login(user, function(err){
      if (err) {
        console.log(err);
      } 
      else {
          //authenticating users and redirecting to home page
          passport.authenticate("local")(req, res, function(){
          res.redirect("/home");
        });
      }
    });
  
  });


app.listen(3000, function(){
    console.log("Server started on local port 3000")
})
