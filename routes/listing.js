const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");

//Index route
router.get("/", wrapAsync(listingController.index));


//CREATE : New & Create Route
router.get("/new", isLoggedIn, listingController.renderNewForm);
router.post("/",
    isLoggedIn,
    validateListing,
    wrapAsync(listingController.createListing)
);


// READ: SHOW ROUTE
// /listings/:id
router.get("/:id", wrapAsync(listingController.showListing));


//UPDATE: edit and update route
//GET => /listings/:id/edit
//PUT =>/listing/:id
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm)
);

router.put("/:id",
    isLoggedIn,
    isOwner,
    validateListing,
    wrapAsync(listingController.updateListing)
);


// DELETE ROUTE
//delete => /listings/:id
router.delete("/:id",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing)
);


module.exports = router;

