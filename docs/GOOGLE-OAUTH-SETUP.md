# Google OAuth Setup Guide

## ✅ Implementation Complete

Google OAuth has been successfully implemented in the application. Follow the steps below to complete the setup.

---

## Step-by-Step: Obtaining Google OAuth Credentials

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click **"New Project"**
4. Name it: `Listly` (or your preferred name)
5. Click **"Create"**

### 2. Enable Required APIs

1. Go to **APIs & Services** → **Library**
2. Search for **"Google+ API"** or **"Google Identity"**
3. Click on it and press **"Enable"**

### 3. Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **"External"** (unless you have Google Workspace)
3. Click **"Create"**
4. Fill in the required fields:
   - **App name**: `Listly`
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click **"Save and Continue"**
6. **Scopes**: Click **"Add or Remove Scopes"**
   - Add: `userinfo.email`
   - Add: `userinfo.profile`
   - Click **"Update"** then **"Save and Continue"**
7. **Test users** (optional): Add your email for testing
8. Click **"Save and Continue"**, then **"Back to Dashboard"**

### 4. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. Choose **"Web application"**
4. Configure:
   - **Name**: `Listly Web Client`
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
5. Click **"Create"**
6. **Copy these credentials:**
   - **Client ID**: (looks like `123456789-abc123.apps.googleusercontent.com`)
   - **Client Secret**: (looks like `GOCSPX-abc123def456`)

### 5. Add Credentials to Environment Variables

Open your `.env` file and update lines 28-29:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-secret-here
```

**⚠️ Important**: Replace the placeholder values with your actual credentials from Step 4.

---

## Testing the Implementation

### 1. Restart the Development Server

After adding the credentials to `.env`, restart your dev server:

```bash
# Stop the current server (Ctrl+C)
pnpm dev
```

### 2. Test Google OAuth Flow

1. Navigate to `http://localhost:3000/login`
2. Click **"Continue with Google"**
3. You should be redirected to Google's sign-in page
4. Select your Google account
5. Grant permissions
6. You'll be redirected back to the app (should land on `/lists`)

### 3. Verify Database

After signing in, check your database:

```bash
# Connect to your database
psql -U postgres -d listly

# Check if the user was created
SELECT id, email, name, provider, "emailVerified" FROM users;
```

You should see a new user record with `provider = 'GOOGLE'`.

---

## What Was Implemented

### ✅ Changes Made

1. **Login Page** (`/login`):
   - Added `signIn('google')` handler to Google OAuth button
   - Added loading state with "Connecting..." text
   - Properly passes `callbackUrl` to redirect after login

2. **Register Page** (`/register`):
   - Same Google OAuth implementation
   - Uses `signIn('google')` for registration (NextAuth handles both)
   - Consistent UX with login page

### How It Works

1. User clicks "Continue with Google"
2. `signIn('google', { callbackUrl })` is called
3. NextAuth redirects to Google's OAuth consent screen
4. User authorizes the app
5. Google redirects back to `/api/auth/callback/google`
6. NextAuth:
   - Receives user data from Google
   - Checks if user exists in database
   - Creates new user if needed (via Prisma adapter)
   - Sets user data in `provider` field as 'GOOGLE'
   - Creates session
   - Redirects to `callbackUrl`

### Database Schema

When a user signs in with Google, the following data is stored:

```typescript
{
  id: "cuid",
  email: "user@gmail.com",
  name: "John Doe",
  avatarUrl: "https://lh3.googleusercontent.com/...",
  provider: "GOOGLE",
  emailVerified: true,
  passwordHash: null, // OAuth users don't have passwords
  isActive: true,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

## Production Setup (Later)

When deploying to production:

1. Add production URLs to Google Cloud Console:
   - **Authorized JavaScript origins**: `https://yourdomain.com`
   - **Authorized redirect URIs**: `https://yourdomain.com/api/auth/callback/google`

2. Update production `.env`:
   ```bash
   NEXTAUTH_URL=https://yourdomain.com
   APP_URL=https://yourdomain.com
   ```

---

## Troubleshooting

### "redirect_uri_mismatch" error

- Verify the redirect URI in Google Cloud Console exactly matches: `http://localhost:3000/api/auth/callback/google`
- No trailing slashes

### "unauthorized_client" error

- Make sure you enabled the Google+ API
- Check that your OAuth consent screen is configured

### User not being created in database

- Check database connection (`DATABASE_URL` in `.env`)
- Verify Prisma schema is migrated: `pnpm prisma migrate dev`

### "This app is not verified" warning

- Normal for apps in testing mode
- Click "Advanced" → "Go to [App Name] (unsafe)" to proceed
- Only affects testing; won't appear once app is verified

---

## Next Steps

1. **Add the credentials** to your `.env` file
2. **Restart the dev server**: `pnpm dev`
3. **Test the flow** at `http://localhost:3000/login`
4. If everything works, you're done! 🎉

## Apple OAuth (Optional - Future)

Apple OAuth requires:

- Apple Developer Account ($99/year)
- App ID configuration
- Services ID configuration
- Private key generation

We can implement this later if needed. The infrastructure is already in place in the NextAuth config.

---

**Questions or issues?** Let me know and I'll help debug!
