//Requiring all additional modules
const env = require('dotenv').config()
const express = require("express")
const app = express();
const http = require('http')
const mongoose = require("mongoose")
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose");
const { Console } = require('console');


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

app.use(express.urlencoded({extended: true}))
//Inititalising passport session
app.use(passport.initialize())
app.use(passport.session())

//Connecting to mongoose
mongoose.connect("mongodb+srv://admin-dipan:Test123@appcluster.x7nob.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {useNewUrlParser : true, useUnifiedTopology: true})
mongoose.set('useCreateIndex', true)

const studentMarksDB = mongoose.createConnection("mongodb+srv://admin-dipan:Test123@appcluster.x7nob.mongodb.net/studentMarksDB?retryWrites=true&w=majority", {useNewUrlParser : true, useUnifiedTopology: true})

const ROLES = {
    Admin: "Admin",
    User: "User"
}
// Defining User Schema for AUTHENTICATION:
const userSchema = new mongoose.Schema ({
    
    username: String,
    password: String,
    role: {type: String, default: ROLES.User}

})



// Defining student marks schema for result Database
const stduentMarksSchema = mongoose.Schema ({

    Name: String,
    Roll: Number,
    Subject: String,
    Marks: Number
})



//initialisng plugin passportLocalMongoose
userSchema.plugin(passportLocalMongoose)

//Creating new User model from userSchema in DB
const User = new mongoose.model("User", userSchema)




//Creating new studentMarks model from studentMarksSchema in DB:
const Marks = studentMarksDB.model("marks", stduentMarksSchema)

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

// app.get("/list", function(req, res){
    
// })



app.route("/list")
.get(function(req, res){
    if(req.isAuthenticated()){
        Marks.find(function(err, foundMarks){
            if(!err){
                if(foundMarks.length){
                    res.render("list", {Marks: foundMarks})
                }
                else{
                    console.log("No data in database")
                }
            }
            else{
                console.log(err)
            }
        })
        // res.render("list", {Roll: itemsforList})

    }
    else{
        //redirect to login if user not authenticated
        res.redirect("/login")
    }
})

.post(function(req, res){
    

    Marks.find({Roll: req.body.Roll, Subject: req.body.Subject}, function(err, foundMarks){
        if(err){
            console.log(err)
        }
        else if(foundMarks.length){
            var itemforList = req.body.Roll
            itemsforList.push(itemforList)
        }
        else{
            console.log("There are no marks found")
        }
    })
})
// }, function(req, res){
    // Marks.find(function(err, foundMarks){
    //     if(err){
    //         console.log(err)
    //     }
    //     else {
    //         res.send(foundMarks)
    //     }
    // })
//  })


app.get("/dashboard", function(req, res){
    if(req.isAuthenticated()){

        res.render("admin-dashboard")
    }
    else{
        console.log("You ain't authorised")
    }
})

app.get("/student-dashboard", function(req, res){
    if(req.isAuthenticated()){

        res.render("student-dashboard")
    }
    else{
        console.log("You ain't authorised")
    }
})

app.route("/studentCreation")
.get( function(req, res){
    if(req.isAuthenticated()){
        if(req.user.role === "Admin"){
            res.render("studentCreation")
        }
    }
})
.post(function(req, res){

  const newStudent = new Marks({
      Name : req.body.name,
      Roll : req.body.roll,
      Subject : req.body.subject,
      Marks : req.body.marks
  }) 

  newStudent.save(function(err){
      if(err){
          console.log(err)
      }
      else{
          console.log("New Student Created and saved")
      }
  })

})

app.route("/studentUpdate")
.get(function(req, res){
    if(req.isAuthenticated()){
        if(req.user.role === "Admin"){
            res.render("studentUpdate")
        }
    }
})
.post(function(req, res){

    var objForUpdate ={
        Name: "",
        Subject: "",
        Marks: ""
    }
    if(req.body.name){
        objForUpdate.Name = req.body.name
    }

    if(req.body.subject){
        objForUpdate.Subject = req.body.subject
    }

    if(req.body.name){
        objForUpdate.Marks = req.body.marks
    }



    Marks.updateOne({Roll: req.body.roll}, {$set: req.body}, function(err, docs){
        if(err){
            console.log(err)
        }else{
            console.log("Successfully updated docs, :", docs)
        }

    })

})






app.get('/login', function(req, res){
    res.render("signin")
})

app.get("/logout", function(req, res){
    req.logout()
    //redirecting to register(home route) when logging out
    res.redirect("/")
})




//POST METHODS FOR FORMS:
app.post('/', function(req, res){
    // const user = new User({
    //     username: req.body.username,
    //     password: req.body.password,
    //     role: ""
    //   })
    //using passport.register() to register new user in database
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if(err){
            console.log(err)
        }
        else{
                //authenticating users
                passport.authenticate("local")(req, res, function(err){
                if(err){
                    console.log(err)
                }
                else{
                    //directly redirect to search after registration
                    res.redirect("/login")
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
              console.log(req.user.role)
              if(req.user.role === "Admin"){
                res.redirect("/dashboard")
              }
              
          res.redirect("/student-dashboard");
        });
      }
    });
  
  });


  

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
 

app.listen(port, function(){
    console.log("Server started on Successfully")
})
