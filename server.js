/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const session = require("express-session")
const pool = require("./database/")
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const bodyParser = require("body-parser")
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const favoritesRoute = require("./routes/favoritesRoute")
const utilities = require("./utilities/")
const errorRoute = require("./routes/errorRoute")
const cookieParser = require("cookie-parser")

/* ***********************
 * Middleware
 *************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Flash Middleware
app.use(require('connect-flash')())
app.use((req, res, next) => {
  res.locals.success = req.flash("success")
  res.locals.error = req.flash("error")
  next()
})

// Body Parser Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Cookie Parser Middleware
app.use(cookieParser())

// JWT Middleware: parse JWT and attach account info
app.use(utilities.checkJWTToken)

// Make loggedin and accountData available in all views
app.use((req, res, next) => {
  res.locals.accountData = res.locals.accountData || {};
  res.locals.loggedin = !!res.locals.accountData.account_id;
  next();
});

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Routes
 *************************/
app.use(static)

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)

// Account routes
app.use("/account", accountRoute)

// Favorites routes (must come after JWT middleware)
app.use("/account/favorites", favoritesRoute)

// File not found route
app.use(async (req, res, next) => {
  next({ status: 404, message: 'Sorry, we appear to have lost that page.' })
})

// Error handler route
app.use(errorRoute)

/* ***********************
 * Express Error Handler
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  let message = err.status === 404 ? err.message : 'Oh no! There was a crash. Maybe try a different route?'
  res.status(err.status || 500).render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})

/* ***********************
 * Local Server Information
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Start server
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})