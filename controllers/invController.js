const { parse } = require("dotenv")
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
    const classificationSelect = await utilities.buildClassificationList()
    const success = req.flash("success")
    const error = req.flash("error")

    // Render the management view with flash messages
    res.render("inventory/management", { 
      title: "Inventory Management", 
      nav, 
      classificationSelect,
      success,
      error
    })
  } catch (err) { 
    next(err) 
  }
}


// Add Classification
invCont.getAddClassificationView = async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    const values = req.flash("formData")[0] || {}
    const success = req.flash("success")
    const error = req.flash("error")

    res.render("inventory/add-classification", { title: "Add Classification", nav, values, success, error })
  } catch (err) { next(err) }
}

invCont.postAddClassification = async (req, res, next) => {
  try {
    const { classification_name } = req.body
    const result = await require("../models/inventory-model").addClassification(classification_name)
    if(result.rowCount) {
      req.flash("success", `Classification "${classification_name}" added successfully.`)
      res.redirect("/inv")
    } else {
      req.flash("error", ["Failed to add classification."])
      res.redirect("/inv/add-classification")
    }
  } catch (err) { next(err) }
}

// Add Inventory
invCont.getAddInventoryView = async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()
    const values = req.flash("formData")[0] || {}
    const success = req.flash("success")
    const error = req.flash("error")
    res.render("inventory/add-inventory", { title: "Add Inventory", nav, classificationList, values, success, error })
  } catch (err) { next(err) }
}

invCont.postAddInventory = async (req, res, next) => {
  try {
    const invData = req.body
    const result = await require("../models/inventory-model").addInventory(invData)
    if(result.rowCount) {
      req.flash("success", `Inventory item "${invData.inv_make} ${invData.inv_model}" added.`)
      res.redirect("/inv")
    } else {
      req.flash("error", ["Failed to add inventory item."])
      req.flash("formData", invData)
      res.redirect("/inv/add-inventory")
    }
  } catch (err) { next(err) }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getVehicleById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  const success = req.flash("success")
  const error = req.flash("error")
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    success,
    error,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    const {
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body

    const updateResult = await invModel.updateInventory(
      parseInt(inv_id),
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    )

    if (updateResult) {
      const itemName = updateResult.inv_make + " " + updateResult.inv_model
      req.flash("success", `The ${itemName} was successfully updated.`)
      return res.redirect("/inv/")
    } else {
      const classificationSelect = await utilities.buildClassificationList(classification_id)
      const itemName = `${inv_make} ${inv_model}`
      req.flash("error", "Sorry, the update failed.")
      const success = req.flash("success")
      const error = req.flash("error")
      return res.status(501).render("inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationSelect: classificationSelect,
        errors: null,
        success,
        error,
        inv_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
      })
    }
  } catch (err) {
    console.error("Error updating inventory: ", err)
    next(err)
  }
}

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    const vehicle = await invModel.getVehicleById(inv_id)

    if (!vehicle) {
      return next({ status: 404, message: "Vehicle not found" })
    }

    const nav = await utilities.getNav()

    // Determine if current user has this favorited
    let isFavorited = false
    const account = req.session && req.session.account
    if (account) {
      const favModel = require("../models/favorites-model")
      const fav = await favModel.checkFavorite(account.account_id, inv_id)
      isFavorited = !!fav
    }

    res.render("./inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicle,
      isFavorited, // NEW
    })
  } catch (error) {
    next(error)
  }
}


/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.body.inv_id)

    // Get the item first so we can show a friendly name in the flash message
    const itemData = await invModel.getVehicleById(inv_id)
    if (!itemData) {
      req.flash("error", "Vehicle not found.")
      return res.redirect("/inv")
    }
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    const deleteResult = await invModel.deleteInventory(inv_id)

    if (deleteResult) {
      req.flash("success", `The ${itemName} was successfully deleted.`)
      return res.redirect("/inv/")
    } else {
      req.flash("error", "Sorry, the delete failed.")
      return res.redirect(`/inv/delete/${inv_id}`)
    }
  } catch (err) {
    console.error("Error deleting inventory: ", err)
    next(err)
  }
}


module.exports = invCont
