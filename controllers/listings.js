const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    return res.render("listings/new.ejs");
};
module.exports.createListing = async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
};


module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ // populate nesting
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner"); // did populate bcoz we ned it show reviews on page
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};


module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
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
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let delListing = await Listing.findByIdAndDelete(id);
    console.log(delListing);
    req.flash("success", "Listing Deleted"); 1
    res.redirect("/listings");
};