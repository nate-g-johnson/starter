// Needed Resources
const express = require("express");
const router = express.Router();
const utilities = require("../utilities/");
const accountController = require("../controllers/accountController");
const validate = require("../utilities/account-validation");

// Account Routes

// Login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Register view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Account management view
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
);

// Process registration
router.post(
  "/register",
  validate.registrationRules(),
  validate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process login attempt
router.post(
  "/login",
  validate.loginRules(),
  validate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// Update account info (all users)
router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountUpdate)
);

// POST update info (first name, last name, email)
router.post(
  "/update-info",
  utilities.checkLogin,
  validate.registrationRules(),
  validate.checkRegData,
  utilities.handleErrors(accountController.updateAccountInfo)
);

// POST update password
router.post(
  "/update-password",
  utilities.checkLogin,
  validate.passwordRules(),
  validate.checkData, // <- fixed: use existing checkData
  utilities.handleErrors(accountController.updatePassword)
);

// Logout route
router.get(
  "/logout",
  utilities.checkLogin,
  utilities.handleErrors(accountController.accountLogout)
);

// Export
module.exports = router;
