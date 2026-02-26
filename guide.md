# Deployment Guide for Non-Technical Users

> **A complete step-by-step guide to deploy the Goals app from scratch.**
> No coding experience needed — just follow each step carefully.

---

## Table of Contents

1. [What You Need Before Starting](#1-what-you-need-before-starting)
2. [Step 1 — Create a GitHub Account & Repository](#2-step-1--create-a-github-account--repository)
3. [Step 2 — Create a Vercel Account](#3-step-2--create-a-vercel-account)
4. [Step 3 — Create a Supabase Project (Database)](#4-step-3--create-a-supabase-project-database)
5. [Step 4 — Enable Google Sign-In (via Supabase)](#5-step-4--enable-google-sign-in-via-supabase)
6. [Step 5 — Create a Firebase Project (Push Notifications)](#6-step-5--create-a-firebase-project-push-notifications)
7. [Step 6 — Get an OpenAI API Key (AI Features)](#7-step-6--get-an-openai-api-key-ai-features)
8. [Step 7 — Create a Stripe Account (Payments)](#8-step-7--create-a-stripe-account-payments)
9. [Step 8 — Deploy to Vercel & Set Environment Variables](#9-step-8--deploy-to-vercel--set-environment-variables)
10. [Step 9 — Final Configuration (Redirects & Webhooks)](#10-step-9--final-configuration-redirects--webhooks)
11. [Troubleshooting](#11-troubleshooting)
12. [Production Deployment — Command-Line Steps (Git Push → Vercel)](#12-production-deployment--command-line-steps-git-push--vercel)
13. [Environment Variable Reference](#13-environment-variable-reference)

---

## 1. What You Need Before Starting

- A computer with a web browser (Chrome, Edge, Firefox, etc.)
- An email address
- A credit/debit card (for Stripe & OpenAI — you won't be charged unless you use paid tiers)
- About 1–2 hours of time

You will create free accounts on these services:

| Service    | What It Does                    | Cost         |
| ---------- | ------------------------------- | ------------ |
| GitHub     | Stores your project code        | Free         |
| Vercel     | Hosts & runs your website       | Free tier    |
| Supabase   | Database & user login           | Free tier    |
| Google     | "Sign in with Google" for users | Free         |
| Firebase   | Push notifications              | Free tier    |
| OpenAI     | AI-powered features             | Pay-as-you-go (or use free Gemini instead) |
| Stripe     | Payment processing              | Free until you process payments |

---

## 2. Step 1 — Create a GitHub Account & Repository

GitHub is where your project code lives. Vercel will read from GitHub to build your website.

### Create a GitHub Account

1. Go to **[github.com](https://github.com)**
2. Click **"Sign up"** in the top right
3. Enter your email, create a password, and choose a username
4. Complete the verification puzzle
5. Check your email and enter the verification code
6. You now have a GitHub account!

### Create a New Repository

1. Once logged in, click the **"+"** icon in the top right corner and choose **"New repository"**
2. Fill in the details:
   - **Repository name:** `goals-app` (or whatever you like)
   - **Description:** `My Authenticity & Purpose App` (optional)
   - **Visibility:** Choose **Private** (recommended) or **Public**
   - Do **NOT** check "Add a README file" (we already have one)
3. Click **"Create repository"**
4. You will see a page with instructions — keep this page open, you'll need the URL shown

### Upload Your Project Code to GitHub

**Option A — Using GitHub Desktop (easiest for beginners):**

1. Download **[GitHub Desktop](https://desktop.github.com/)** and install it
2. Sign in with your GitHub account
3. Click **File → Add Local Repository**
4. Browse to your project folder (the folder containing this guide)
5. If it says "this is not a Git repository," click **"Create a Repository"** and then **"Create Repository"**
6. If it already detects the repo, you'll see your files listed
7. In the bottom left, type a summary like `Initial commit` and click **"Commit to main"**
8. Click **"Publish repository"** at the top
   - Uncheck "Keep this code private" if you want it public
   - Click **"Publish Repository"**

**Option B — Using the command line (if you have Git installed):**

Open a terminal/command prompt in your project folder and run these commands one by one:

```
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/goals-app.git
git push -u origin main
```

> Replace `YOUR_USERNAME/goals-app` with your actual GitHub username and repository name.

---

## 3. Step 2 — Create a Vercel Account

Vercel is the service that hosts your website and makes it available on the internet.

### Create an Account

1. Go to **[vercel.com](https://vercel.com)**
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"** (this is the easiest way)
4. Authorize Vercel to access your GitHub account
5. You now have a Vercel account!

> **Don't import your project yet** — we need to set up the other services first so we can configure the environment variables during deployment.

---

## 4. Step 3 — Create a Supabase Project (Database)

Supabase is your database — it stores all user data, goals, habits, journal entries, etc. It also handles user sign-up and login.

### Create an Account & Project

1. Go to **[supabase.com](https://supabase.com)**
2. Click **"Start your project"**
3. Sign in with your **GitHub account** (click "Continue with GitHub")
4. Click **"New Project"**
5. Fill in:
   - **Organization:** Select your organization (or create one — it's free)
   - **Name:** `goals-app` (or any name you like)
   - **Database Password:** Click **"Generate a password"** and **save this password somewhere safe** (you won't need it often, but keep it)
   - **Region:** Pick the region closest to your users (e.g., East US, West EU)
6. Click **"Create new project"**
7. Wait 1–2 minutes while Supabase sets up your project

### Get Your Supabase Keys

1. Once the project is ready, go to **Settings** (gear icon in the left sidebar) → **API**
2. You will see:
   - **Project URL** — copy this (it looks like `https://abcdefg.supabase.co`)
   - **anon / public key** — copy this (starts with `eyJ...`)
   - **service_role / secret key** — click "Reveal" and copy this (starts with `eyJ...`)

> **Write these down!** You'll need them later:

| What To Copy                | Environment Variable         |
| --------------------------- | ---------------------------- |
| Project URL                 | `VITE_SUPABASE_URL`          |
| anon public key             | `VITE_SUPABASE_ANON_KEY`     |
| service_role key            | `SUPABASE_SERVICE_ROLE_KEY`  |

### Set Up the Database Tables

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `supabase/schema.sql` from your project folder in a text editor (like Notepad)
4. **Copy the entire contents** of that file
5. **Paste** it into the SQL Editor in Supabase
6. Click **"Run"** (or press Ctrl+Enter)
7. You should see a success message — your database tables are now created!

### Create Storage Buckets

1. In the left sidebar, click **"Storage"**
2. Click **"New bucket"**
3. Name it exactly: `progress-photos`
4. Toggle **"Public bucket"** to **ON**
5. Click **"Create bucket"**
6. (Optional) Repeat to create a bucket named `construction-receipts`

---

## 5. Step 4 — Enable Google Sign-In (via Supabase)

This lets your users click "Sign in with Google" instead of creating a password.

### Part A — Create Google OAuth Credentials

1. Go to **[console.cloud.google.com](https://console.cloud.google.com/)**
2. Sign in with your Google account
3. At the top, click the project dropdown → **"New Project"**
   - Name: `Goals App`
   - Click **"Create"**
4. Make sure your new project is selected in the dropdown at the top
5. In the left sidebar, go to **"APIs & Services" → "OAuth consent screen"**
6. Choose **"External"** and click **"Create"**
7. Fill in:
   - **App name:** `Goals App`
   - **User support email:** Your email
   - **Developer contact email:** Your email
8. Click **"Save and Continue"** through the remaining steps (Scopes, Test users) — you can leave them as defaults
9. Click **"Back to Dashboard"**

Now create the credentials:

10. In the left sidebar, go to **"APIs & Services" → "Credentials"**
11. Click **"+ Create Credentials"** → **"OAuth client ID"**
12. **Application type:** Web application
13. **Name:** `Goals App Web`
14. Under **"Authorized redirect URIs"**, click **"+ Add URI"** and enter:
    ```
    https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
    ```
    > Replace `YOUR_SUPABASE_PROJECT_REF` with the part from your Supabase URL. For example, if your URL is `https://abcdefg.supabase.co`, enter:
    > `https://abcdefg.supabase.co/auth/v1/callback`
15. Click **"Create"**
16. A popup will show your **Client ID** and **Client Secret** — **copy both and save them!**

### Part B — Enable Google in Supabase

1. Go back to your **Supabase Dashboard**
2. Go to **Authentication** (left sidebar) → **Providers**
3. Find **Google** in the list and click to expand it
4. Toggle it **ON** (Enable)
5. Paste your **Client ID** and **Client Secret** from the Google step above
6. Click **"Save"**

That's it — Google Sign-In is now enabled!

---

## 6. Step 5 — Create a Firebase Project (Push Notifications)

Firebase handles push notifications so your app can send reminders to users' browsers/phones.

### Create a Firebase Project

1. Go to **[console.firebase.google.com](https://console.firebase.google.com/)**
2. Click **"Create a project"** (or "Add project")
3. **Project name:** `goals-and-development` (or any name)
4. Google Analytics: You can leave it ON or turn it OFF (optional)
5. Click **"Create project"**
6. Wait for it to finish, then click **"Continue"**

### Add a Web App

1. On the project overview page, click the **web icon** (`</>`) to add a web app
2. **App nickname:** `Goals Web`
3. Do **NOT** check "Firebase Hosting" — we're using Vercel
4. Click **"Register app"**
5. You will see a code block with your Firebase config. **Copy these values:**

```
apiKey: "AIzaSy..."
authDomain: "your-project.firebaseapp.com"
projectId: "your-project-id"
storageBucket: "your-project.appspot.com"
messagingSenderId: "123456789"
appId: "1:123456789:web:abc123"
measurementId: "G-XXXXXXX"
```

> **Map these to environment variables:**

| Firebase Config           | Environment Variable                    |
| ------------------------- | --------------------------------------- |
| apiKey                    | `VITE_FIREBASE_API_KEY`                 |
| authDomain                | `VITE_FIREBASE_AUTH_DOMAIN`             |
| projectId                 | `VITE_FIREBASE_PROJECT_ID`              |
| storageBucket             | `VITE_FIREBASE_STORAGE_BUCKET`          |
| messagingSenderId         | `VITE_FIREBASE_MESSAGING_SENDER_ID`     |
| appId                     | `VITE_FIREBASE_APP_ID`                  |
| measurementId             | `VITE_FIREBASE_MEASUREMENT_ID`          |

### Enable Cloud Messaging & Get VAPID Key

1. In the Firebase console, click the **gear icon** (⚙️) next to "Project Overview" → **"Project settings"**
2. Go to the **"Cloud Messaging"** tab
3. Under **"Web Push certificates"**, click **"Generate key pair"**
4. **Copy** the key that appears — this is your `VITE_FIREBASE_VAPID_KEY`

### Get the Firebase Service Account JSON (for server-side notifications)

1. Still in **Project settings**, go to the **"Service accounts"** tab
2. Click **"Generate new private key"**
3. A JSON file will download — **open it in Notepad**
4. **Copy the entire contents** — you'll paste this as the `FIREBASE_SERVICE_ACCOUNT_JSON` environment variable in Vercel later

> **Important:** Keep this JSON file secret! It has admin access to your Firebase project.

---

## 7. Step 6 — Get an OpenAI API Key (AI Features)

OpenAI powers the AI features in the app (smart suggestions, progress analysis, etc.).

> **Free Alternative:** You can skip OpenAI and use **Google Gemini** instead (free tier: 15 requests/minute). See the note at the end of this section.

### Create an OpenAI Account & Key

1. Go to **[platform.openai.com](https://platform.openai.com/)**
2. Click **"Sign up"** and create an account
3. Once logged in, go to **[platform.openai.com/api-keys](https://platform.openai.com/api-keys)**
4. Click **"+ Create new secret key"**
5. **Name:** `Goals App`
6. Click **"Create secret key"**
7. **Copy the key immediately** — it starts with `sk-` and you won't be able to see it again!
8. Save it as `VITE_OPENAI_API_KEY`

### Add Billing (Required)

1. Go to **[platform.openai.com/account/billing](https://platform.openai.com/settings/organization/billing/overview)**
2. Click **"Add payment method"**
3. Add your credit/debit card
4. Set a monthly usage limit (e.g., $5–$10) so you don't get surprised

> **Cost:** Typical usage costs $0.01–$0.10 per request. A $5 budget is plenty for personal use.

### Free Alternative — Google Gemini

If you don't want to pay for OpenAI:

1. Go to **[aistudio.google.com/apikey](https://aistudio.google.com/apikey)**
2. Click **"Create API key"**
3. Copy the key and save it as `VITE_GEMINI_API_KEY`
4. Leave `VITE_OPENAI_API_KEY` empty

The app will automatically use whichever key is available (OpenAI first, then Gemini).

---

## 8. Step 7 — Create a Stripe Account (Payments)

Stripe handles subscription payments if you want to offer a premium plan.

### Create a Stripe Account

1. Go to **[stripe.com](https://stripe.com)**
2. Click **"Start now"** or **"Sign up"**
3. Enter your email and create a password
4. Complete the account setup (you can skip business details for now if you're just testing)

### Get Your API Keys

1. Once logged in, go to your **[Stripe Dashboard](https://dashboard.stripe.com)**
2. Make sure you are in **Test mode** (toggle at the top should say "Test mode" with an orange badge)
3. Go to **Developers** → **API keys** (or visit [dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys))
4. You will see:
   - **Publishable key** — starts with `pk_test_` — copy this
   - **Secret key** — click "Reveal test key" — starts with `sk_test_` — copy this

| What To Copy       | Environment Variable             |
| ------------------- | -------------------------------- |
| Publishable key     | `VITE_STRIPE_PUBLISHABLE_KEY`    |
| Secret key          | `VITE_STRIPE_SECRET_KEY`         |

### Create Subscription Products & Prices

1. In Stripe Dashboard, go to **Products** → **"+ Add product"**
2. Create a **Monthly plan:**
   - **Name:** `Goals Pro Monthly`
   - **Price:** Enter your monthly price (e.g., `$9.99`)
   - **Billing period:** Monthly
   - Click **"Save product"**
   - On the product page, find the **Price ID** (starts with `price_`) — copy it
3. Create an **Annual plan:**
   - Click **"+ Add another price"** on the same product (or create a new product)
   - **Price:** Enter your annual price (e.g., `$99.99`)
   - **Billing period:** Yearly
   - Click **"Save"**
   - Copy the **Price ID**

| What To Copy              | Environment Variable              |
| ------------------------- | --------------------------------- |
| Monthly Price ID          | `VITE_STRIPE_PRICE_ID_MONTHLY`    |
| Annual Price ID           | `VITE_STRIPE_PRICE_ID_ANNUAL`     |

> **Note:** The webhook secret (`VITE_STRIPE_WEBHOOK_SECRET`) will be created in Step 9 after deployment.

---

## 9. Step 8 — Deploy to Vercel & Set Environment Variables

Now it's time to put everything together and launch your website!

### Import Your Project

1. Go to **[vercel.com/dashboard](https://vercel.com/dashboard)**
2. Click **"Add New…"** → **"Project"**
3. Find your GitHub repository (`goals-app`) in the list and click **"Import"**
   - If you don't see it, click **"Adjust GitHub App Permissions"** and grant access to the repository
4. **Configure the project:**
   - **Framework Preset:** Vite (should be auto-detected)
   - **Root Directory:** Leave as `.` (the default)
   - **Build Command:** Leave as default (`npm run build`)
   - **Output Directory:** Leave as default (`dist`)

### Add Environment Variables

5. **Before clicking "Deploy"**, scroll down to **"Environment Variables"**
6. Add each variable one at a time. For each row, type the **Name** on the left and paste the **Value** on the right:

| Name                                 | Value (paste what you copied earlier)                |
| ------------------------------------ | ---------------------------------------------------- |
| `VITE_SUPABASE_URL`                  | Your Supabase project URL                            |
| `VITE_SUPABASE_ANON_KEY`             | Your Supabase anon key                               |
| `SUPABASE_SERVICE_ROLE_KEY`          | Your Supabase service_role key                       |
| `VITE_STRIPE_PUBLISHABLE_KEY`        | Your Stripe publishable key (`pk_test_...`)          |
| `VITE_STRIPE_SECRET_KEY`             | Your Stripe secret key (`sk_test_...`)               |
| `VITE_STRIPE_PRICE_ID_MONTHLY`       | Your monthly price ID (`price_...`)                  |
| `VITE_STRIPE_PRICE_ID_ANNUAL`        | Your annual price ID (`price_...`)                   |
| `VITE_OPENAI_API_KEY`                | Your OpenAI key (`sk-...`) — or leave empty          |
| `VITE_GEMINI_API_KEY`                | Your Gemini key — or leave empty                     |
| `VITE_FIREBASE_API_KEY`              | Your Firebase API key                                |
| `VITE_FIREBASE_AUTH_DOMAIN`          | e.g., `your-project.firebaseapp.com`                 |
| `VITE_FIREBASE_PROJECT_ID`           | e.g., `goals-and-development`                        |
| `VITE_FIREBASE_STORAGE_BUCKET`       | e.g., `goals-and-development.appspot.com`            |
| `VITE_FIREBASE_MESSAGING_SENDER_ID`  | e.g., `22247220733`                                  |
| `VITE_FIREBASE_APP_ID`               | e.g., `1:22247220733:web:abc123`                     |
| `VITE_FIREBASE_MEASUREMENT_ID`       | e.g., `G-XXXXXXX`                                    |
| `VITE_FIREBASE_VAPID_KEY`            | Your VAPID key from Firebase Cloud Messaging         |
| `FIREBASE_SERVICE_ACCOUNT_JSON`      | Entire JSON content from the service account file    |
| `VITE_APP_URL`                       | Leave empty for now (we'll update after deploy)      |

7. Click **"Deploy"**!
8. Wait 2–5 minutes for the build to complete
9. Vercel will give you a URL like `https://goals-app-abc123.vercel.app` — **this is your live website!**

### Update the App URL

1. Copy your Vercel deployment URL (e.g., `https://goals-app.vercel.app`)
2. In Vercel, go to **Settings** → **Environment Variables**
3. Find `VITE_APP_URL` and update its value to your Vercel URL
4. Go to **Deployments** → click the three dots (⋯) on the latest deployment → **"Redeploy"**

---

## 10. Step 9 — Final Configuration (Redirects & Webhooks)

### Update Supabase Redirect URLs

Your app needs to know where to send users after they sign in with Google.

1. Go to your **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Set the **Site URL** to your Vercel URL:
   ```
   https://your-app-name.vercel.app
   ```
3. Under **Redirect URLs**, click **"Add URL"** and add:
   ```
   https://your-app-name.vercel.app/**
   ```
4. Click **"Save"**

### Update Google OAuth Redirect URI

1. Go back to **[Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)**
2. Click on your OAuth client (`Goals App Web`)
3. Under **"Authorized redirect URIs"**, make sure this URI is listed:
   ```
   https://YOUR_SUPABASE_REF.supabase.co/auth/v1/callback
   ```
4. Under **"Authorized JavaScript origins"**, add:
   ```
   https://your-app-name.vercel.app
   ```
5. Click **"Save"**

### Set Up the Stripe Webhook

The webhook tells your app when a payment succeeds or a subscription changes.

1. Go to **[Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)**
   - Make sure you're in **Test mode**
2. Click **"+ Add endpoint"**
3. **Endpoint URL:** Enter your Vercel URL followed by `/api/webhooks`:
   ```
   https://your-app-name.vercel.app/api/webhooks
   ```
4. **Events to listen to:** Click **"+ Select events"** and add these:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. On the webhook page, click **"Reveal"** under **Signing secret**
7. Copy the secret (starts with `whsec_`)
8. Go to **Vercel Dashboard** → **Settings** → **Environment Variables**
9. Add a new variable:
   - **Name:** `VITE_STRIPE_WEBHOOK_SECRET`
   - **Value:** Paste the webhook signing secret
10. **Redeploy** your project: Deployments → ⋯ → Redeploy

### Going Live with Stripe (When Ready for Real Payments)

When you're ready to accept real payments:

1. Complete Stripe account verification (ID, bank details, etc.)
2. Toggle **off** Test mode in Stripe Dashboard
3. Get your **live** API keys (they start with `pk_live_` and `sk_live_`)
4. Create new products/prices in live mode
5. Create a new webhook endpoint for live mode
6. Update all Stripe environment variables in Vercel with the live values
7. Redeploy

---

## 11. Troubleshooting

### "Page not found" or blank page after deploy
- Make sure all environment variables are set correctly (no extra spaces)
- Check that the **Framework Preset** is set to **Vite** in Vercel
- Go to Vercel → Deployments → click the latest → check the **Build Logs** for errors

### "Sign in with Google" doesn't work
- Verify the redirect URI in Google Cloud Console matches **exactly**: `https://YOUR_SUPABASE_REF.supabase.co/auth/v1/callback`
- Make sure Google provider is **enabled** in Supabase → Authentication → Providers
- Check that Client ID and Client Secret are pasted correctly (no extra spaces)

### Push notifications don't work
- Notifications only work on **HTTPS** (your Vercel URL), not `localhost`
- Make sure the VAPID key is correct
- Users must **allow** notifications when prompted by the browser

### Payments don't work
- Make sure you're in **Test mode** on Stripe for testing
- Use Stripe's test card: `4242 4242 4242 4242`, any future date, any CVC
- Check the webhook is receiving events: Stripe Dashboard → Webhooks → click your endpoint → check "Attempts"

### AI features don't work
- Verify your OpenAI key is valid and has billing enabled
- Or make sure your Gemini key is set if using the free alternative
- Check Vercel logs: Deployments → click latest → **Function Logs**

### How to update your app after making changes
1. Make your changes to the code
2. Push to GitHub (GitHub Desktop: Commit → Push, or `git push` in terminal)
3. Vercel will **automatically** detect the push and redeploy — no manual steps needed!

---

## 12. Production Deployment — Command-Line Steps (Git Push → Vercel)

Once your Vercel project is linked to your GitHub repository (see Step 8), **every push to `main` automatically triggers a production deployment**. Here are the exact commands:

### First-Time Setup (only do this once)

```bash
# 1. Make sure you are in the project folder
cd H:/Goals

# 2. Initialize git (skip if already a git repo)
git init

# 3. Connect to your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 4. Stage all files
git add .

# 5. Create the first commit
git commit -m "Initial commit"

# 6. Push to GitHub (this triggers the first Vercel deployment)
git push -u origin main
```

> Replace `YOUR_USERNAME/YOUR_REPO_NAME` with your actual GitHub username and repository name.

### Every Time You Want to Deploy Changes

After making code changes, run these 3 commands:

```bash
# 1. Stage all changed files
git add .

# 2. Commit with a descriptive message
git commit -m "describe what you changed"

# 3. Push to GitHub → Vercel auto-deploys
git push
```

That's it — **3 commands** and your changes are live within 2–5 minutes.

### What Happens Behind the Scenes

```
You run "git push"
        ↓
GitHub receives your code
        ↓
Vercel detects the push automatically
        ↓
Vercel runs "npm install" (installs dependencies)
        ↓
Vercel runs "npm run build" (builds the Vite app → dist/ folder)
        ↓
Vercel deploys the built frontend (dist/) as static files
        ↓
Vercel deploys each file in api/ as a serverless function
        ↓
Your site is live at https://your-app.vercel.app
```

### Checking Deployment Status

- Go to **[vercel.com/dashboard](https://vercel.com/dashboard)** → click your project
- Under **Deployments**, you'll see the build in progress or completed
- Click any deployment to see **Build Logs** (useful if something goes wrong)
- Click **Functions** tab to see your serverless API function logs

### Quick Reference

| Action                              | Command                                  |
| ----------------------------------- | ---------------------------------------- |
| Stage all changes                   | `git add .`                              |
| Commit changes                      | `git commit -m "your message"`           |
| Deploy to production                | `git push`                               |
| Check current status                | `git status`                             |
| See recent commits                  | `git log --oneline -5`                   |
| Undo last commit (keep changes)     | `git reset --soft HEAD~1`                |
| Pull latest from GitHub             | `git pull`                               |

### Important Notes

- **Only the `main` branch** deploys to production. Other branches create preview deployments.
- **Environment variables** are NOT in your code — they are set in the Vercel Dashboard (Settings → Environment Variables). If you add a new env var, you need to **redeploy** for it to take effect.
- **Serverless functions** (`api/` folder) are deployed automatically alongside the frontend — no extra steps needed.
- **Cron jobs** (like `api/cron-reminders.ts`) only run on **production** deployments, not on preview deployments.
- You do **NOT** need to run `npm run build` locally — Vercel runs it for you during deployment.

---

## 13. Environment Variable Reference

Here is the complete list of all environment variables and where to get each one:

```
# ─── Supabase (Database & Auth) ───
VITE_SUPABASE_URL=              # Supabase → Settings → API → Project URL
VITE_SUPABASE_ANON_KEY=         # Supabase → Settings → API → anon public key
SUPABASE_SERVICE_ROLE_KEY=      # Supabase → Settings → API → service_role key (click Reveal)

# ─── Stripe (Payments) ───
VITE_STRIPE_PUBLISHABLE_KEY=    # Stripe → Developers → API keys → Publishable key
VITE_STRIPE_SECRET_KEY=         # Stripe → Developers → API keys → Secret key
VITE_STRIPE_WEBHOOK_SECRET=     # Stripe → Developers → Webhooks → Signing secret
VITE_STRIPE_PRICE_ID_MONTHLY=   # Stripe → Products → your product → Monthly Price ID
VITE_STRIPE_PRICE_ID_ANNUAL=    # Stripe → Products → your product → Annual Price ID

# ─── AI (choose one or both) ───
VITE_OPENAI_API_KEY=            # platform.openai.com → API keys
VITE_GEMINI_API_KEY=            # aistudio.google.com/apikey (free)

# ─── Firebase (Push Notifications) ───
VITE_FIREBASE_API_KEY=              # Firebase Console → Project settings → General → Web app config
VITE_FIREBASE_AUTH_DOMAIN=          # Firebase Console → Project settings → General → Web app config
VITE_FIREBASE_PROJECT_ID=           # Firebase Console → Project settings → General → Web app config
VITE_FIREBASE_STORAGE_BUCKET=       # Firebase Console → Project settings → General → Web app config
VITE_FIREBASE_MESSAGING_SENDER_ID=  # Firebase Console → Project settings → General → Web app config
VITE_FIREBASE_APP_ID=               # Firebase Console → Project settings → General → Web app config
VITE_FIREBASE_MEASUREMENT_ID=       # Firebase Console → Project settings → General → Web app config
VITE_FIREBASE_VAPID_KEY=            # Firebase Console → Project settings → Cloud Messaging → Web Push certificates
FIREBASE_SERVICE_ACCOUNT_JSON=      # Firebase Console → Project settings → Service accounts → Generate new private key

# ─── App URL ───
VITE_APP_URL=                   # Your Vercel deployment URL (e.g., https://goals-app.vercel.app)
```

---

## Congratulations!

Your Goals app is now live on the internet. Here's a summary of what you set up:

- **GitHub** — stores your code and lets you update the app
- **Vercel** — hosts your website and auto-deploys when you push code
- **Supabase** — manages your database, user accounts, and Google Sign-In
- **Firebase** — sends push notification reminders
- **OpenAI / Gemini** — powers AI features like smart suggestions
- **Stripe** — handles subscription payments

Share your Vercel URL with anyone and they can start using your app!

> **Tip:** Bookmark your dashboards — you'll come back to them:
> - [github.com](https://github.com)
> - [vercel.com/dashboard](https://vercel.com/dashboard)
> - [supabase.com/dashboard](https://supabase.com/dashboard)
> - [console.firebase.google.com](https://console.firebase.google.com)
> - [dashboard.stripe.com](https://dashboard.stripe.com)
> - [platform.openai.com](https://platform.openai.com)
