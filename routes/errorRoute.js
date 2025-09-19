const express = require("express");
const router = new express.Router();

router.get("/trigger-error", (req, res, next) => {
  next(new Error("Intentional 500 error"));
});

module.exports = router;
