# Weather Warning System

A map-based warning system for creating and displaying weather warnings with radar overlays.

## Features

- Interactive map with drawing tools to create custom warnings
- Weather radar overlays (RainViewer on main page, MRMS with advanced products on admin page)
- Warning management system with severity levels and expiration times
- Mobile-responsive design

## Local Development

1. Clone the repository
2. Install dependencies:
   ```
   cd warning-system
   npm install
   ```
3. Create a `.env.local` file with your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://your-connection-string
   ```
4. Run the development server:
   ```
   npm run dev
   ```

## Deploying to Netlify

### Prerequisites

1. A MongoDB Atlas account (or other MongoDB provider)
2. A Netlify account

### Deployment Steps

1. Push your code to a Git repository (GitHub, GitLab, etc.)

2. Log in to Netlify and click "New site from Git"

3. Connect to your Git provider and select your repository

4. Configure the build settings:
   - Build command: `NEXT_SKIP_TYPE_CHECK=true npm run build`
   - Publish directory: `.next`

5. Add the following environment variables in Netlify:
   - `MONGODB_URI`: Your MongoDB connection string
   - `NEXT_SKIP_TYPE_CHECK`: `true`

6. Deploy the site

7. Install the Netlify Next.js plugin:
   ```
   netlify plugins:install @netlify/plugin-nextjs
   ```

8. For serverless functions to work properly (handling API routes), make sure to enable the Next.js Runtime:
   - Go to Site settings > Build & deploy > Environment > Environment variables
   - Add `NEXT_RUNTIME=nodejs18.x`

### Known Issues and Workarounds

When deploying to Netlify, you might encounter TypeScript errors related to the `react-datepicker` library. To work around this:

1. We've set up the build command to skip type checking using the `NEXT_SKIP_TYPE_CHECK=true` environment variable
2. This is already configured in the `netlify.toml` file
3. If you're using Windows locally, use the `npm run build:win` command instead, which sets the environment variable correctly for PowerShell

### Using Netlify CLI for Local Testing

1. Install the Netlify CLI:
   ```
   npm install netlify-cli -g
   ```

2. Link your local project to your Netlify site:
   ```
   netlify link
   ```

3. Test your site locally:
   ```
   netlify dev
   ```

## Important Notes

- Ensure your MongoDB database is accessible from Netlify's IP addresses
- The database must be configured to accept connections from any IP or from Netlify's IP range
- Consider adding authentication to the admin page for a production deployment 