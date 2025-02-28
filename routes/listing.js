const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");


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



/* router .get("/testListing", async (req, res) => {
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

//Index route
router.get("/", wrapAsync(async (req, res) => { // SO FIRST SCHEMA VLAIDATION WILL BE CHECHED
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//CREATE : New & Create Route
//GET => /listings/new => form
//POST => listings 
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});

router.post("/", validateListing, wrapAsync(async (req, res, next) => {
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
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
}));




//UPDATE: edit and update route
//GET => /listings/:id/edit
//PUT =>/listing/:id
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}));

/* router .put("/listings/:id", async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing })////---------destructing******-------//////
    res.redirect(`/listings/${id}`);
}) */
// above is what mam give which was earlier working fine. But there are differences in the dataset provided schema and the schema that we have written for our database
//therefore below is whatc chatgopt gave me and i got it...
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
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
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
}));




// DELETE ROUTE
//delete => /listings/:id
router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let delListing = await Listing.findByIdAndDelete(id);
    console.log(delListing);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
}));


// READ: SHOW ROUTE
//GET => /listings/:id => show specific listing data
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews"); // did populate bcoz we ned it show reviews on page
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}));


module.exports = router;

