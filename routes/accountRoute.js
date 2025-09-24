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

//registration route (POST)
router.post("/register", utilities.handleErrors(accountController.registerAccount))

//Export
module.exports = router;