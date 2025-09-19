// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

router.get("/type/:classificationId", invController.buildByClassificationId);

//details for a single vehicle
router.get("/detail/:inv_id", invController.buildDetailView);

module.exports = router;