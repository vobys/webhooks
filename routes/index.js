const express = require("express");
// eslint-disable-next-line new-cap
const router = express.Router();

/* GET home page. */
router.get("/", function(req, res) {
  res.render("index", { title: "WebHooks Server", version: "0.4.1" });
});

module.exports = router;
