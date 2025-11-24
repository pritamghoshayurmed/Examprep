<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally and deploy it to Vercel.

View your app in AI Studio: https://ai.studio/apps/drive/10HNpjmyR6OJzNGpwMWJQY40V36Fb8Mf2

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Vercel

This app is configured for easy deployment to Vercel:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Add the `GEMINI_API_KEY` environment variable in Vercel project settings
4. Deploy!

Vercel will automatically detect the Vite framework and use the settings in `vercel.json`.

Alternatively, use the Vercel CLI:
```bash
npm install -g vercel
vercel
```
