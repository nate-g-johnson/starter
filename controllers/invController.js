const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
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

module.exports = invCont