const Joi = require('joi');

const { request } = require("express");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        price: Joi.number().required().min(0), // non negative number only
        image: Joi.string().allow("", null), //allowing empty string and null values
        country: Joi.string().required()
    }).required(),
})