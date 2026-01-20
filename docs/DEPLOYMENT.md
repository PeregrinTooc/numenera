# GitHub Pages Deployment Setup

## First Time Setup

Before the deployment workflow can succeed, you must enable GitHub Pages manually:

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar under "Code and automation")
4. Under **Build and deployment**:
   - **Source**: Select "GitHub Actions"
5. Click **Save**

### Step 2: Trigger Deployment

After enabling Pages, the workflow will automatically deploy on the next push to `main`, or you can:

1. Go to **Actions** tab
2. Select "Build, Test and Deploy to GitHub Pages"
3. Click **Run workflow**
4. Select branch `main`
5. Click **Run workflow**

### Step 3: Access Your Site

Once deployed, your site will be available at:

```
https://[your-username].github.io/numenera/
```

Replace `[your-username]` with your actual GitHub username.

## Automatic Deployments

After initial setup, the site automatically deploys when you push to the `main` branch.

## Troubleshooting

### Workflow Fails with "Resource not accessible"

- Ensure GitHub Pages is enabled in Settings → Pages
- Ensure Source is set to "GitHub Actions"

### Build Fails

- Check the Actions tab for detailed error logs
- Ensure all tests pass locally with `npm test`
- Ensure build works locally with `npm run build`

### 404 After Deployment

- Wait a few minutes for GitHub's CDN to update
- Check if the deployment completed successfully in Actions
- Verify the correct URL: `https://[username].github.io/numenera/`
