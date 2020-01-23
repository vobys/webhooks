var express = require('express');
var request = require("request");
var router = express.Router();

var config = require("../config.json");

function createStatus(status, project, url, sha, ref, coverage) {
    var options = {
        method: 'POST',
        url: 'https://gitlab.com/api/v4/projects/' + project + '/statuses/' + sha
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
    var status = 'failed';
    if (qualityGate.status === 'OK') {
        status = 'success';
    }
    return status;
}

function extractCoverage(qualityGate) {
    var value = null;
    // noinspection JSUnresolvedVariable
    var coverage = qualityGate.conditions.find(condition => condition.metric === 'coverage');
    if (coverage) {
        value = coverage.value;
    }
    return value;
}

function extractBranch(sonar) {
    if (sonar.properties['sonar.analysis.branch']) {
        return sonar.properties['sonar.analysis.branch'];
    }
    // noinspection JSUnresolvedVariable
    return sonar.branch.name;
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
            config.gitlab.namespace + '%2F' + sonar.project.key,
            sonar.project.url,
            sonar.revision,
            extractBranch(sonar),
            extractCoverage(sonar.qualityGate));
    res.send({"status": status});
});

module.exports = router;
