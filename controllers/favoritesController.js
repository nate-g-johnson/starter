const favModel = require("../models/favorites-model")
const utilities = require("../utilities/")

const favCont = {}

favCont.showFavorites = async function (req, res, next) {
  try {
    const account = res.locals.accountData
    if (!account) {
      req.flash("error", "Please log in to view favorites.")
      return res.redirect("/account/login")
    }

    const nav = await utilities.getNav()
    const favorites = await favModel.getFavoritesByAccount(account.account_id)

    res.render("account/favorites", {
      title: "My Favorites",
      nav,
      favorites,
    })
  } catch (error) {
    next(error)
  }
}

favCont.addFavorite = async function (req, res, next) {
  try {
    const account = res.locals.accountData
    if (!account) {
      req.flash("error", "Please log in to favorite vehicles.")
      return res.redirect("/account/login")
    }

    const inv_id = parseInt(req.params.inv_id || req.body.inv_id)
    if (!inv_id) {
      req.flash("error", "Missing vehicle id.")
      return res.redirect("back")
    }

    // Prevent duplicates: check first
    const existing = await favModel.checkFavorite(account.account_id, inv_id)
    if (existing) {
      req.flash("success", "That vehicle is already in your favorites.")
      return res.redirect(`/inv/detail/${inv_id}`)
    }

    const result = await favModel.addFavorite(account.account_id, inv_id)
    if (result) {
      req.flash("success", "Vehicle added to your favorites.")
    } else {
      // null means unique violation or duplicate
      req.flash("success", "Vehicle is already in your favorites.")
    }
    return res.redirect(`/inv/detail/${inv_id}`)
  } catch (error) {
    next(error)
  }
}

favCont.removeFavorite = async function (req, res, next) {
  try {
    const account = res.locals.accountData
    if (!account) {
      req.flash("error", "Please log in to remove favorites.")
      return res.redirect("/account/login")
    }

    const inv_id = parseInt(req.params.inv_id || req.body.inv_id)
    if (!inv_id) {
      req.flash("error", "Missing vehicle id.")
      return res.redirect("back")
    }

    const removed = await favModel.removeFavorite(account.account_id, inv_id)
    if (removed) {
      req.flash("success", "Vehicle removed from your favorites.")
    } else {
      req.flash("error", "Unable to remove favorite.")
    }
    return res.redirect(`/inv/detail/${inv_id}`)
  } catch (error) {
    next(error)
  }
}

module.exports = favCont
