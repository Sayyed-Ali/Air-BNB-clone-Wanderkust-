const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const { register } = require("module");
const userRouter = require("./routes/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("connected to db");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);// use ejs-locals for all ejs templates:
app.use(express.static(path.join(__dirname, "/public")));


const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // miliseconds
        nmaxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true, //for security purpose(cross scripting attacks)
    },
};


app.get("/", (req, res) => {
    res.send("hi im root");
});


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize()); // we need to initialze before use it
app.use(passport.session()); // so that a user dont have to sign in multiple times in the same session
passport.use(new LocalStrategy(User.authenticate()));// to authenticate new user through lcoal strategy useing authenticate method

passport.serializeUser(User.serializeUser()); // to serialize user into the session
passport.deserializeUser(User.deserializeUser()); // to deserialize user into the session

// middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user; // to use user info in ejs file like for login buttons
    next();
});

/* app.get("/demouser", async (req, res) => {
    let fakeUser = new User({
        email: "student@gmail.oom",
        username: "delta-student",
    });

    let registeredUser = await User.register(fakeUser, "helloworld"); // register is a static method and here helloworld is our pasword for the fakeuser
    // this method will save register a new user instance and it will also check that username is unique or not
    res.send(registeredUser);
}); */


app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("", userRouter);


app.all("*", (req, res, next) => {
    throw (new ExpressError(404, "Page Not Found"));
})

//ERROE HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
    //res.status(statusCode).send(message);
});


app.listen(8080, () => {
    console.log("listening to pport 8080");
});