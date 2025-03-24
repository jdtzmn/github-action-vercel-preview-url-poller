const core = require("@actions/core");
const github = require("@actions/github");
const axios = require("axios");

/**
 * Retrieves the preview URL from Vercel for the current branch
 */
async function retrievePreviewUrl({ token, teamId, projectId }) {
  const baseUrl = "https://api.vercel.com";

  // Get the current branch name from the GitHub context
  const branchName = github.context.ref.replace("refs/heads/", "");
  core.info(`Looking for deployments for branch: ${branchName}`);

  // Set up headers with auth token
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // Build the API URL
  let apiUrl = `${baseUrl}/v6/deployments`;
  const params = new URLSearchParams({
    projectId: projectId,
    state: "BUILDING,READY,ERROR",
    limit: "100",
  });

  if (teamId) {
    params.append("teamId", teamId);
  }

  apiUrl = `${apiUrl}?${params.toString()}`;

  // Make the API request
  const response = await axios.get(apiUrl, { headers });

  if (!response.data || !response.data.deployments) {
    throw new Error("No deployments found in Vercel response");
  }

  // Filter deployments by branch name (meta.githubCommitRef)
  const deployments = response.data.deployments.filter((deployment) => {
    return deployment.meta && deployment.meta.githubCommitRef === branchName;
  });

  if (deployments.length === 0) {
    throw new Error(`No deployments found for branch: ${branchName}`);
  }

  // Sort by createdAt to get the most recent deployment
  deployments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const latestDeployment = deployments[0];

  return {
    url: latestDeployment.url,
    deploymentId: latestDeployment.id,
    state: latestDeployment.state,
    branchAlias: latestDeployment.meta?.githubCommitRef
      ? `${latestDeployment.meta.githubCommitRef}.${
          latestDeployment.url.split(".")[1]
        }.vercel.app`
      : null,
  };
}

module.exports = { retrievePreviewUrl };
