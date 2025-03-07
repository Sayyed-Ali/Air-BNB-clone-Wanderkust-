const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const { nextTick } = require("process");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const sessionOptions = {
    secret: 'mysupersecretstring', // secret for the signed cookie
    resave: false, // resave to session store even though no chnges are made
    saveUninitialized: true // save the session which is not even initialised
};


// PEOJECT 2 PART C
app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
    res.locals.messages = req.flash("success");
    next();
});

app.get("/register", (req, res) => {
    let { name = "anonymus" } = req.query;
    req.session.name = name;
    req.flash("success", "user registered successfully");
    res.redirect("/hello");
});

app.get("/hello", (req, res) => {
    //res.locals.messages = req.flash("success");
    //res.render("page.ejs", { name: req.session.name, msg: req.flash("success") }); // accessing through key
    res.render("page.ejs", { name: req.session.name });
});

/* app.use(session({
    secret: 'mysupersecretstring', // secret for the signed cookie
    resave: false, // resave to session store even though no chnges are made
    saveUninitialized: true // save the session which is not even initialised
})); */

/* app.get("/requestcount", (req, res) => { // to count how many request came from user in a session
    if (req.session.count) {
        req.session.count++;
    } else {
        req.session.count = 1; // variable
    }
    res.send(`you send a request ${req.session.count} times`);
}); */

/* app.get("/test", (req, res) => {
    res.send("test successful");
}); */




/* // PROJECT 2 PART B
//app.use(cookieParser());
app.use(cookieParser("secretCode"));

app.get("/getsignedcookie", (req, res) => {
    res.cookie("made-in", "India", { signed: true }); //singed cookie
    res.send("signed cookie sent");
});

app.get("/verify", (req, res) => {
    console.log(req.signedCookies);//req.cookies can only read unsigned cookies
    res.send("verfied");
});

app.get("/getcookie", (req, res) => {
    res.cookie("greet", "namaste"); //unsigned cookie
    console.dir(req.cookies);
    res.send("cookie send");
});

 */
app.listen(3000, () => {
    console.log("listening to port 3000");
});

