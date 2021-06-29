const express = require("express");
const request = require("request");
// eslint-disable-next-line new-cap
const router = express.Router();

const config = require("../config.json");

// eslint-disable-next-line max-params
function sendMessage(
  payload,
  environment,
  description,
  url,
  server,
  team,
  channel,
  hook
) {
  const options = {
    method: "POST",
    url: `https://${server}.webhook.office.com/webhookb2/${team}/IncomingWebhook/${channel}/${hook}`,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      themeColor: "3CD357",
      summary: "notification",
      title: "Deployments",
      sections: [
        {
          activityTitle: "**New Deployment**",
          activitySubtitle: `Deployed to ${payload.location}`,
          activityImage:
            "https://github.githubassets.com/images/modules/logos_page/Octocat.png",
          activityText: `Build ${payload.tag} was deployed to ${environment}`
        },
        {
          title: "Details",
          facts: [
            { name: "Server", value: `${payload.server}` },
            { name: "Description", value: `${description}` }
          ]
        },
        {
          title: "Notification Source",
          images: [
            {
              image:
                "https://github.githubassets.com/images/modules/logos_page/GitHub-Logo.png"
            }
          ]
        }
      ],
      potentialAction: [
        {
          "@context": "http://schema.org",
          "@type": "ViewAction",
          name: "Full log...",
          target: [`${url}`]
        }
      ]
    })
  };

  request(options, function(error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
  });
}

router.post("/github/deployments/:team/:channel/:hook", function(req, res) {
  const deploymentStatus = req.body.payload ? JSON.parse(req.body.payload) : {};
  if (
    deploymentStatus.deployment_status &&
    deploymentStatus.deployment_status.state === "success"
  ) {
    sendMessage(
      deploymentStatus.deployment.payload,
      deploymentStatus.deployment.environment,
      deploymentStatus.deployment.description,
      deploymentStatus.deployment.repository_url
        .replace(/api\./, "")
        .replace(/repos\//, "")
        .concat("/deployments"),
      config.teams.owner,
      req.params.team,
      req.params.channel,
      req.params.hook
    );
  }

  res.send({
    team: req.params.team,
    channel: req.params.channel,
    hook: req.params.hook
  });
});

module.exports = router;
