const express = require("express");
const axios = require("axios");
// eslint-disable-next-line new-cap
const router = express.Router();

const config = require("../config.json");

function createStatus(status, repo, url, sha) {
  const options = {
    method: "POST",
    url:
      "https://api.github.com/repos/" +
      config.github.owner +
      "/" +
      repo +
      "/statuses/" +
      sha,
    headers: {
      "User-Agent": "WebHooks-App",
      "cache-control": "no-cache",
      Authorization: "token " + config.github.token,
      "Content-Type": "application/json"
    },
    data: {
      state: status,
      // eslint-disable-next-line camelcase
      target_url: url,
      description: "Continuous Code Quality",
      context: "SonarQube"
    }
  };

  axios(options)
    .then(function(response) {
      console.log(response.data);
    })
    .catch(function(err) {
      if (err && err.response) throw new Error(err.response.data);
    });
}

function extractStatus(qualityGate) {
  let status = "failed";
  if (qualityGate.status === "OK") {
    status = "success";
  }

  return status;
}

router.post("/sonar/status", function(req, res) {
  const sonar = req.body;
  let status;
  if (sonar.status === "SUCCESS") {
    status = extractStatus(sonar.qualityGate);
  } else {
    status = "canceled";
  }

  createStatus(status, sonar.project.key, sonar.project.url, sonar.revision);
  res.send({ status: status });
});

module.exports = router;
