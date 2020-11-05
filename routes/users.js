const express = require("express");
// eslint-disable-next-line new-cap
const router = express.Router();

/* GET users listing. */
router.get("/", function(req, res) {
  res.send("NYI");
});

module.exports = router;
