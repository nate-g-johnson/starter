//resources
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
      nav,
    message: null,
    errorMessage: null,
    errors: null,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
      nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash the password before storing
    let hashedPassword
    try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.")
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    const notice = req.flash("notice")
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      message: req.flash()
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Deliver account management view
 * *************************************** */
async function buildAccountManagement(req, res) {
  let nav = await utilities.getNav()
  const error = req.flash("error")
  const success = req.flash("success")
  const accountData = res.locals.accountData

  res.render("account/management", {
    title: "Account Management",
    nav,
    error,
    success,
    accountData,
  })
}

// Deliver the update view
async function buildAccountUpdate(req, res) {
  const nav = await utilities.getNav();
  const errors = req.flash("errors");
  const notice = req.flash("notice");
  const accountData = res.locals.accountData; // from JWT

  res.render("account/update", {
    title: "Update Account",
    nav,
    errors,
    notice,
    accountData
  });
}

// Handle account info update
async function updateAccountInfo(req, res) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;

  // reuse validation rules
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array().map(e => e.msg));
    return res.redirect("/account/update");
  }

  await accountModel.updateAccountInfo(account_id, account_firstname, account_lastname, account_email);
  req.flash("success", "Account information updated successfully.");
  res.redirect("/account/");
}

// Handle password update
async function updatePassword(req, res) {
  const { account_id, account_password } = req.body;

  // reuse password validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array().map(e => e.msg));
    return res.redirect("/account/update");
  }

  const hashedPassword = await bcrypt.hash(account_password, 10);
  await accountModel.updatePassword(account_id, hashedPassword);
  req.flash("success", "Password updated successfully.");
  res.redirect("/account/");
}

// Logout user
async function accountLogout(req, res) {
  res.clearCookie("jwt"); // remove JWT cookie
  req.flash("success", "You have been logged out.");
  res.redirect("/"); // redirect to home page
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, buildAccountUpdate, updateAccountInfo, updatePassword, accountLogout }