/* eslint-disable camelcase */
const express = require("express");
const request = require("request");
// eslint-disable-next-line new-cap
const router = express.Router();

const config = require("../config.json");

function checkStatus(repo, callback) {
  const options = {
    method: "GET",
    url: `https://api.github.com/repos/${config.github.owner}/${repo}/commits/master/check-runs`,
    headers: {
      "User-Agent": "Vobys WebHook Server",
      "Content-Type": "application/json",
      Authorization: `token ${config.github.token}`,
      Accept: "application/vnd.github.antiope-preview+json"
    }
  };

  return request(options, callback);
}

// eslint-disable-next-line max-params
function createDeployment(repo, sha, build, env, callback) {
  const environment = config.github.environments.find(e => e.name === env);
  const options = {
    method: "POST",
    url: `https://api.github.com/repos/${config.github.owner}/${repo}/deployments`,
    headers: {
      "User-Agent": "Vobys WebHook Server",
      "Content-Type": "application/json",
      Authorization: `token ${config.github.token}`,
      Accept: "application/vnd.github.ant-man-preview+json"
    },
    body: JSON.stringify({
      ref: sha,
      task: environment.task,
      auto_merge: false,
      payload: {
        server: environment.server,
        location: environment.location,
        tag: build
      },
      environment: env,
      description: environment.desc,
      required_contexts: [],
      transient_environment: false,
      production_environment: false
    })
  };

  return request(options, callback);
}

router.get("/github/:repo", function(req, res) {
  res.render("deploy", {
    title: "Choose the environment:",
    url: `/deploy/github/${req.params.repo}`,
    envs: config.github.environments
  });
});

router.get("/github/:repo/:environment", function(req, res) {
  let error = "";
  let server = "";
  let url = "";

  checkStatus(req.params.repo, function(err, response) {
    if (err) error = err;
    // eslint-disable-next-line no-negated-condition
    else if (response.statusCode !== 200) error = response.statusMessage;
    else {
      const check = JSON.parse(response.body).check_runs;
      if (
        check.length > 0 &&
        check[0].status === "completed" &&
        check[0].conclusion === "success"
      ) {
        const buildNumber = check[0].output.summary.replace(/\D/g, "");
        server = `Start deploy to ${req.params.environment} now!`;
        url = `/deploy/github/${req.params.repo}/${req.params.environment}/${check[0].head_sha}/${buildNumber}`;
      } else {
        error = "master is not ready";
      }
    }

    res.render("deploy", {
      title: "Deploy to Server",
      error: error,
      server: server,
      url: url,
      envs: []
    });
  });
});

router.get("/github/:repo/:environment/:sha/:build", function(req, res) {
  let error = "";
  let server = "";
  let url = "";

  createDeployment(
    req.params.repo,
    req.params.sha,
    req.params.build,
    req.params.environment,
    function(err, response) {
      if (err) error = err;
      // eslint-disable-next-line no-negated-condition
      else if (response.statusCode !== 201) error = response.statusMessage;
      else {
        server = `Deploy to ${req.params.environment} requested!`;
        url = `https://github.com/${config.github.owner}/${req.params.repo}/deployments`;
      }

      res.render("deploy", {
        title: "Deploy to Server",
        error: error,
        server: server,
        url: url,
        envs: []
      });
    }
  );
});

module.exports = router;
