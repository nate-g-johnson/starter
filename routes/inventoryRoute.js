const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const { validateClassification, validateInventory } = require("../middleware/invValidation");

// Public routes
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:inv_id", invController.buildDetailView);

// Admin-only routes
router.get("/", utilities.handleErrors(utilities.checkAdmin), utilities.handleErrors(invController.buildManagementView));

router.get("/add-classification", utilities.checkAdmin, invController.getAddClassificationView);
router.post("/add-classification", utilities.checkAdmin, validateClassification, invController.postAddClassification);

router.get("/add-inventory", utilities.checkAdmin, invController.getAddInventoryView);
router.post("/add-inventory", utilities.checkAdmin, validateInventory, invController.postAddInventory);

router.post("/update", utilities.checkAdmin, utilities.handleErrors(invController.updateInventory));

router.get("/edit/:inv_id", utilities.checkAdmin, utilities.handleErrors(invController.editInventoryView));

router.get("/delete/:inv_id", utilities.checkAdmin, utilities.handleErrors(invController.buildDeleteView));

router.post("/delete", utilities.checkAdmin, utilities.handleErrors(invController.deleteInventory));

module.exports = router;
