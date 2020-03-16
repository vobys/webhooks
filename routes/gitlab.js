const express = require("express");
const request = require("request");
// eslint-disable-next-line new-cap
const router = express.Router();

const config = require("../config.json");

const rateMeasure = ["-", "A", "B", "C", "D", "E"];

const measures = {
  // eslint-disable-next-line camelcase
  reliability_rating: {
    label: "Reliability Rating",
    icon: "spider",
    value: num => rateMeasure[num]
  },
  // eslint-disable-next-line camelcase
  security_rating: {
    label: "Security Rating",
    icon: "unlock",
    value: num => rateMeasure[num]
  },
  // eslint-disable-next-line camelcase
  sqale_rating: {
    label: "Maintainability Rating",
    icon: "radioactive",
    value: num => rateMeasure[num]
  },
  coverage: {
    label: "Coverage",
    icon: "thermometer",
    value: num => num + "%"
  },
  // eslint-disable-next-line camelcase
  duplicated_lines_density: {
    label: "Duplicated lines",
    icon: "page_facing_up",
    value: num => num + "%"
  },
  // eslint-disable-next-line camelcase
  test_success_density: {
    label: "Unit test success density",
    icon: "eye",
    value: num => num + "%"
  }
};

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

// eslint-disable-next-line max-params
function createMergeNote(project, ref, qualityGate, projectKey, serverUrl) {
  const options = {
    method: "GET",
    url:
      "https://gitlab.com/api/v4/projects/" +
      project +
      "/merge_requests?target_branch=master&source_branch=" +
      ref,
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
    if (body.length > 0 && body[0].iid) {
      createNote(
        extractNote(qualityGate, projectKey, serverUrl),
        project,
        body[0].iid
      );
    }
  });
}

function createNote(note, project, merge) {
  const options = {
    method: "POST",
    url:
      "https://gitlab.com/api/v4/projects/" +
      project +
      "/merge_requests/" +
      merge +
      "/notes",
    headers: {
      "User-Agent": "WebHooks-App",
      "cache-control": "no-cache",
      "PRIVATE-TOKEN": config.gitlab.token,
      "Content-Type": "application/json"
    },
    body: { body: note },
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

function extractNote(qualityGate, project, serverUrl) {
  let note =
    "### SonarQube\n" +
    ":construction_worker: Continuous Code Quality (" +
    qualityGate.name +
    ")\n";
  qualityGate.conditions
    .filter(condition => measures[condition.metric])
    .forEach(condition => {
      note += `>\n> ${
        condition.status === "OK" ? ":green_heart:" : ":heart:"
      } ${measures[condition.metric].label} :${
        measures[condition.metric].icon
      }: \`${measures[condition.metric].value(condition.value)}\`\n`;
    });
  note += `\n[![Quality Gate Status](${serverUrl}/api/project_badges/measure?project=${project.key}&metric=alert_status)](${project.url})`;
  return note;
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
  createMergeNote(
    config.gitlab.namespace + "%2F" + sonar.project.key,
    extractBranch(sonar),
    sonar.qualityGate,
    sonar.project,
    sonar.serverUrl
  );
  res.send({ status: status });
});

module.exports = router;
