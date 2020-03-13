const express = require("express");
const request = require("request");
// eslint-disable-next-line new-cap
const router = express.Router();

const config = require("../config.json");

// eslint-disable-next-line max-params
function createStatus(status, project, url, sha, ref, coverage) {
  const options = {
    method: "POST",
    url:
      "https://gitlab.com/api/v4/projects/" +
      project +
      "/statuses/" +
      sha +
      "?state=" +
      status +
      "&ref=" +
      ref +
      "&name=SonarQube" +
      "&description=Continuous Code Quality" +
      "&coverage=" +
      coverage +
      "&target_url=" +
      url,
    headers: {
      "User-Agent": "WebHooks-App",
      "cache-control": "no-cache",
      "PRIVATE-TOKEN": config.gitlab.token,
      "Content-Type": "application/json"
    },
    json: true
  };

  request(options, function(error, response, body) {
    if (error) throw new Error(error);
    console.log(body);
  });
}

function extractStatus(qualityGate) {
  let status = "failed";
  if (qualityGate.status === "OK") {
    status = "success";
  }

  return status;
}

function extractCoverage(qualityGate) {
  let value = null;
  const coverage = qualityGate.conditions.find(
    condition => condition.metric === "coverage"
  );
  if (coverage) {
    value = coverage.value;
  }

  return value;
}

function extractBranch(sonar) {
  if (sonar.properties["sonar.analysis.branch"]) {
    return sonar.properties["sonar.analysis.branch"];
  }

  return sonar.branch.name;
}

router.post("/sonar/status", function(req, res) {
  const sonar = req.body;
  let status;
  if (sonar.status === "SUCCESS") {
    status = extractStatus(sonar.qualityGate);
  } else {
    status = "canceled";
  }

  createStatus(
    status,
    config.gitlab.namespace + "%2F" + sonar.project.key,
    sonar.project.url,
    sonar.revision,
    extractBranch(sonar),
    extractCoverage(sonar.qualityGate)
  );
  res.send({ status: status });
});

module.exports = router;
