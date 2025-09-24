//Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")

//Routes

//Login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

//register view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

//Export
module.exports = router;