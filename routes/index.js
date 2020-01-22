var express = require('express');
var router = express.Router();

/* GET home page. */
// noinspection JSUnresolvedFunction
router.get('/', function(req, res) {
    res.render('index', {title: 'GitLab WebHooks', version: '1.0.0'});
});

module.exports = router;
