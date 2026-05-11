# My-GPT

A clean, Claude-inspired AI chat interface powered by OpenRouter. Built with React, Vite, Firebase, and deployed on Vercel.

## Features

- **Claude-inspired UI** — warm light theme, minimal sidebar, full-width conversational messages
- **Multiple AI Models** — Claude 3.5 Sonnet, GPT-4o, Gemini Pro 1.5, Llama 3 70B
- **Custom API Key** — use your own OpenRouter API key via Settings
- **Image Generation** — free AI image generation via Pollinations.ai
- **File Upload** — upload `.txt`, `.csv`, `.json`, `.md` files for AI analysis
- **Export Tools** — export chat as TXT, CSV, Excel, or PowerPoint
- **Firestore Persistence** — chat history auto-saves and restores per user
- **Firebase Auth** — secure email/password authentication

## Local Development

```bash
npm install
npm run dev
```

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
```

## Vercel Auto-Deploy Setup

To enable automatic deployment on every Git push:

### 1. Install Vercel CLI (optional)
```bash
npm i -g vercel
```

### 2. Link your project
```bash
vercel
```

### 3. Get your Vercel credentials

Run this locally to get your IDs:
```bash
vercel login
vercel teams list
```

Or find them in your Vercel dashboard:
- **Project ID**: Project Settings → General → Project ID
- **Org ID**: Account Settings → General → Team ID (or your personal ID)
- **Token**: Account Settings → Tokens → Create Token

### 4. Add GitHub Secrets

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these 4 secrets:

| Secret Name | Value |
|-------------|-------|
| `VERCEL_TOKEN` | Your Vercel personal access token |
| `VERCEL_ORG_ID` | Your Vercel team/personal ID |
| `VERCEL_PROJECT_ID` | Your Vercel project ID |
| `VITE_OPENROUTER_API_KEY` | Your OpenRouter API key |

### 5. Push to deploy

Once secrets are set, every push to `master` will automatically build and deploy to Vercel.

```bash
git add .
git commit -m "your changes"
git push origin master
```

## Manual Vercel Deploy

```bash
vercel --prod
```

## Tech Stack

- React 19 + Vite
- Firebase Auth + Firestore
- OpenRouter API
- Recharts, XLSX, PptxGenJS
- Lucide React icons
