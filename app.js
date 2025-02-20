const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const { render } = require("ejs");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { stat } = require("fs/promises");
const { listingSchema } = require("./schema.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);// use ejs-locals for all ejs templates:
app.use(express.static(path.join(__dirname, "/public")));

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

//THIS IS A SCHEMA VALIDATION MIDDLEWARE
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}
//Model: Listing
// title, description, image, price, loaction, country


app.get("/", (req, res) => {
    res.send("hi im root");
});

/* app.get("/testListing", async (req, res) => {
    let sampleListing = new Listing({
        title: "My New Villa",
        description: "By the beach",
        price: 1200,
        loaction: "Calangute, Goa",
        country: "India"
    });
    await sampleListing.save();
    console.log("sample is saved");
    res.send("succesful testing");
}); */

app.get("/listings", wrapAsync(async (req, res) => { // SO FIRST SCHEMA VLAIDATION WILL BE CHECHED
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//CREATE : New & Create Route
//GET => /listings/new => form
//POST => listings 
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

app.post("/listings", validateListing, wrapAsync(async (req, res, next) => {
    //let {title, description, image, price, location, country} = req.body;
    /* if (!req.body.listing) {
        throw new ExpressError(400, "send some valid data for listing");
    } */

    /* let result = listingSchema.validate(req.body);
    console.log(result);
    if (result.error) { // if error exist
        throw new ExpressError(400, result.error);
    } */
    // we ahve made  a validation function above

    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));




//UPDATE: edit and update route
//GET => /listings/:id/edit
//PUT =>/listing/:id
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

/* app.put("/listings/:id", async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing })////---------destructing******-------//////
    res.redirect(`/listings/${id}`);
}) */
// above is what mam give which was earlier working fine. But there are differences in the dataset provided schema and the schema that we have written for our database
//therefore below is whatc chatgopt gave me and i got it...
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    /*  if (!req.body.listing) {
         throw new ExpressError(400, "send some valid data for listing");
     } */
    let { image, ...updatedData } = req.body.listing; // Extract image field separately

    // If user provides a new image URL, update it; otherwise, keep the existing one
    if (image && image.trim() !== "") {
        updatedData.image = { filename: "listingimage", url: image };
    } else {
        updatedData.image = listing.image; // Preserve the old image if none is provided
    }

    await Listing.findByIdAndUpdate(id, updatedData, { new: true });

    res.redirect(`/listings/${id}`);
}));




// DELETE ROUTE
//delete => /listings/:id
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let delListing = await Listing.findByIdAndDelete(id);
    console.log(delListing);
    res.redirect("/listings");
}));


// READ: SHOW ROUTE
//GET => /listings/:id => show specific listing data
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
}));



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