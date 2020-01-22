var express = require('express');
var request = require("request");
var router = express.Router();

var config = require("../config.json");

function createStatus(status, project, url, sha, ref, coverage) {
    var options = {
        method: 'POST',
        url: 'https://gitlab.com/api/v4/projects/' + project + '/statuses/' + sha + '?'
                + '?state=' + status
                + '&ref=' + ref
                + '&name=SonarQube'
                + '&description=Continuous Code Quality'
                + '&coverage=' + coverage
                + '&target_url=' + url,
        headers: {
            'User-Agent': 'WebHooks-App',
            'cache-control': 'no-cache',
            'PRIVATE-TOKEN': config.gitlab.token,
            'Content-Type': 'application/json'
        },
        json: true
    };

    request(options, function(error, response, body) {
        if (error) throw new Error(error);
        console.log(body);
    });
}

function extractStatus(qualityGate) {
    var status = 'failure';
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
