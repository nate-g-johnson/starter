const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")

// server-side validation middleware we'll add
const { validateClassification, validateInventory } = require("../middleware/invValidation")

router.get("/type/:classificationId", invController.buildByClassificationId)

router.get("/detail/:inv_id", invController.buildDetailView)

// New routes
router.get("/", invController.buildManagementView)

router.get("/add-classification", invController.getAddClassificationView)
router.post("/add-classification", validateClassification, invController.postAddClassification)

router.get("/add-inventory", invController.getAddInventoryView)
router.post("/add-inventory", validateInventory, invController.postAddInventory)

module.exports = router
