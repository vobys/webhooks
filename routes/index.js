var express = require('express');
var router = express.Router();

/* GET home page. */
// noinspection JSUnresolvedFunction
router.get('/', function(req, res) {
    res.render('index', {title: 'WebHooks do Vobys', version: '0.1.0'});
});

module.exports = router;
