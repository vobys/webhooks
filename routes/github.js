var express = require('express');
var request = require("request");
var router = express.Router();

var config = require("../config.json");

function createStatus(status, repo, url, sha) {
    var options = {
        method: 'POST',
        url: 'https://api.github.com/repos/' + config.github.owner + '/' + repo + '/statuses/' + sha,
        headers: {
            'User-Agent': 'Awesome-Octocat-App',
            'cache-control': 'no-cache',
            Authorization: 'token ' + config.github.token,
            'Content-Type': 'application/json'
        },
        body: {
            state: status,
            target_url: url,
            description: 'SonarQube Project Analysis',
            context: 'SonarQube'
        },
        json: true
    };

    request(options, function(error, response, body) {
        if (error) throw new Error(error);
        console.log(body);
    });
}

// noinspection JSUnresolvedFunction
router.post('/sonar/status', function(req, res) {
    var sonar = req.body;
    var status = '';
    if (sonar.status === 'SUCCESS') {
        status = 'success';
    } else if (sonar.status !== undefined) {
        status = 'failure';
    } else {
        status = 'error';
    }
    // noinspection JSUnresolvedVariable
    createStatus(status,
            sonar.project.key.split(':')[0],
            sonar.project.url,
            sonar.properties['sonar.analysis.scmRevision']);
    res.send({"status": status});
});

module.exports = router;
