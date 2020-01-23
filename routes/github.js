var express = require('express');
var request = require("request");
var router = express.Router();

var config = require("../config.json");

function createStatus(status, repo, url, sha) {
    var options = {
        method: 'POST',
        url: 'https://api.github.com/repos/' + config.github.owner + '/' + repo + '/statuses/' + sha,
        headers: {
            'User-Agent': 'WebHooks-App',
            'cache-control': 'no-cache',
            Authorization: 'token ' + config.github.token,
            'Content-Type': 'application/json'
        },
        body: {
            state: status,
            target_url: url,
            description: 'Continuous Code Quality',
            context: 'SonarQube'
        },
        json: true
    };

    request(options, function(error, response, body) {
        if (error) throw new Error(error);
        console.log(body);
    });
}

function extractStatus(qualityGate) {
    var status = 'failed';
    if (qualityGate.status === 'OK') {
        status = 'success';
    }
    return status;
}

// noinspection JSUnresolvedFunction
router.post('/sonar/status', function(req, res) {
    var sonar = req.body;
    var status;
    if (sonar.status === 'SUCCESS') {
        // noinspection JSUnresolvedVariable
        status = extractStatus(sonar.qualityGate);
    } else {
        status = 'canceled';
    }
    // noinspection JSUnresolvedVariable
    createStatus(status,
            sonar.project.key.split(':')[0],
            sonar.project.url,
            sonar.revision);
    res.send({"status": status});
});

module.exports = router;
