const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    let nav = await utilities.getNav()

    if (!data || data.length === 0) {
      return res.status(404).render("errors/error", {
        title: "Not Found",
        nav,
        message: "Sorry, that classification does not exist."
      })
    }

    const grid = await utilities.buildClassificationGrid(data)
    const className = data[0].classification_name

    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    })
  } catch (err) {
    next(err)
  }
}

/* ***************************
 *  Build detail view for a specific vehicle
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  try {
    // Make sure the route parameter matches here
    const inv_id = parseInt(req.params.inv_id)
    const vehicle = await invModel.getVehicleById(inv_id)

    if (!vehicle) {
      return next({ status: 404, message: "Vehicle not found" })
    }

    let nav = await utilities.getNav()

    // Pass the vehicle object directly to EJS
    res.render("./inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicle
    })
  } catch (error) {
    next(error)
  }
}

// Management View
invCont.buildManagementView = async function(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const message = req.flash("notice")
    res.render("inventory/management", { title: "Inventory Management", nav, message })
  } catch (err) { next(err) }
}

// Add Classification
invCont.getAddClassificationView = async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    const errors = req.flash("errors")
    const values = req.flash("formData")[0] || {}
    const message = req.flash("notice")
    res.render("inventory/add-classification", { title: "Add Classification", nav, errors, values, message })
  } catch (err) { next(err) }
}

invCont.postAddClassification = async (req, res, next) => {
  try {
    const { classification_name } = req.body
    const result = await require("../models/inventory-model").addClassification(classification_name)
    if(result.rowCount) {
      req.flash("notice", `Classification "${classification_name}" added successfully.`)
      res.redirect("/inv")
    } else {
      req.flash("errors", ["Failed to add classification."])
      res.redirect("/inv/add-classification")
    }
  } catch (err) { next(err) }
}

// Add Inventory
invCont.getAddInventoryView = async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()
    const errors = req.flash("errors")
    const values = req.flash("formData")[0] || {}
    res.render("inventory/add-inventory", { title: "Add Inventory", nav, classificationList, errors, values, message: req.flash("notice") })
  } catch (err) { next(err) }
}

invCont.postAddInventory = async (req, res, next) => {
  try {
    const invData = req.body
    const result = await require("../models/inventory-model").addInventory(invData)
    if(result.rowCount) {
      req.flash("notice", `Inventory item "${invData.inv_make} ${invData.inv_model}" added.`)
      res.redirect("/inv")
    } else {
      req.flash("errors", ["Failed to add inventory item."])
      req.flash("formData", invData)
      res.redirect("/inv/add-inventory")
    }
  } catch (err) { next(err) }
}


module.exports = invCont