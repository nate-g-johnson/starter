const express = require("express")
const router = express.Router()
const favController = require("../controllers/favoritesController")
const jwt = require("jsonwebtoken")
require("dotenv").config()

function requireLogin(req, res, next) {
  const token = req.cookies.jwt

  if (!token) {
    req.flash("error", "Please log in to continue.")
    return res.redirect("/account/login")
  }

  try {
    // Verify the token
    const accountData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
    // Optional: store accountData in request for controllers
    req.account = accountData

    next() // user is authenticated
  } catch (err) {
    req.flash("error", "Session expired. Please log in again.")
    return res.redirect("/account/login")
  }
}

router.get("/", requireLogin, favController.showFavorites)
router.post("/add/:inv_id", requireLogin, favController.addFavorite)
router.post("/remove/:inv_id", requireLogin, favController.removeFavorite)

module.exports = router
