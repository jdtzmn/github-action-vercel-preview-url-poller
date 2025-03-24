# Vercel Preview URL with Status Polling

This GitHub Action retrieves the preview URL for a Vercel deployment and polls the deployment status until it's ready.

## Features

- Retrieves the Vercel preview URL for the current branch
- Polls for deployment status until it's ready (or times out)
- Provides the preview URL and deployment state as outputs

## Usage

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      # Add your Vercel deployment step here

      - name: Get Vercel Preview URL and wait for deployment
        uses: RoyBkker/github-action-vercel-preview-url-poller@v1
        id: vercel_deployment
        with:
          vercel_token: ${{ secrets.VERCEL_TOKEN }}
          vercel_project_id: "prj_your_project_id"
          max_timeout: 300 # 5 minutes max
          polling_interval: 5 # Check every 5 seconds
          deployment_error_states: "ERROR,CANCELED"

      - name: Use the Preview URL
        run: |
          echo "Preview URL: ${{ steps.vercel_deployment.outputs.preview_url }}"
          echo "Deployment State: ${{ steps.vercel_deployment.outputs.deployment_state }}"

          # You can now use the URL for E2E tests, link checks, etc.
```

## Inputs

| Name                      | Description                                | Required | Default |
| ------------------------- | ------------------------------------------ | -------- | ------- |
| `vercel_token`            | Vercel API token                           | Yes      | -       |
| `vercel_team_id`          | Vercel team ID                             | No       | -       |
| `vercel_project_id`       | Vercel project ID                          | Yes      | -       |
| `max_timeout`             | Maximum timeout in seconds                 | No       | 300     |
| `polling_interval`        | Interval between status checks in seconds  | No       | 5       |
| `deployment_ready_states` | States considered ready (comma-separated)  | No       | 'READY' |
| `deployment_error_states` | States considered errors (comma-separated) | No       | 'ERROR' |

## Outputs

| Name               | Description                              |
| ------------------ | ---------------------------------------- |
| `preview_url`      | The URL of the Vercel preview deployment |
| `deployment_state` | Current state of the deployment          |
| `branch_alias`     | Branch alias URL (if available)          |

## Environment Variables

Your workflow should have access to the following secrets:

- `VERCEL_TOKEN`: A personal access token with access to your Vercel projects

## License

MIT
