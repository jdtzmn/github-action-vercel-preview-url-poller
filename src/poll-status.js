const core = require("@actions/core");
const axios = require("axios");

/**
 * Polls a Vercel deployment until it reaches a ready or error state
 */
async function pollDeploymentStatus({
  token,
  teamId,
  deploymentId,
  maxTimeout = 300,
  pollingInterval = 5,
  readyStates = ["READY"],
  errorStates = ["ERROR"],
}) {
  const baseUrl = "https://api.vercel.com";
  const startTime = Date.now();
  const timeoutMs = maxTimeout * 1000;
  const intervalMs = pollingInterval * 1000;

  // Set up headers with auth token
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // Build the API URL
  let apiUrl = `${baseUrl}/v13/deployments/${deploymentId}`;
  if (teamId) {
    apiUrl += `?teamId=${teamId}`;
  }

  let currentState = null;

  while (Date.now() - startTime < timeoutMs) {
    core.info(
      `Checking deployment status (${Math.round(
        (Date.now() - startTime) / 1000
      )}s elapsed)...`
    );

    // Make the API request
    const response = await axios.get(apiUrl, { headers });
    currentState = response.data.status;

    core.info(`Current state: ${currentState}`);

    // If the deployment is ready, we're done
    if (readyStates.includes(currentState)) {
      core.info("Deployment is ready!");
      return currentState;
    }

    // If the deployment has an error, fail
    if (errorStates.includes(currentState)) {
      throw new Error(`Deployment failed with state: ${currentState}`);
    }

    // Otherwise, wait and try again
    core.info(`Waiting ${pollingInterval} seconds before next check...`);
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(
    `Timed out after ${maxTimeout} seconds. Final state: ${currentState}`
  );
}

module.exports = { pollDeploymentStatus };
