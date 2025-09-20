const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/");

router.get("/trigger-error", (req, res, next) => {
  next(new Error("Intentional 500 error"));
});

//error link in nav
router.get("/error", async (req, res, next) => {
  try {
    let nav = await utilities.getNav()
    res.render("errors/error", {
      title: "Error Page",
      nav,
      message: "Sorry, an error occurred."
    })
  } catch (err) {
    next(err)
  }
});

module.exports = router;
