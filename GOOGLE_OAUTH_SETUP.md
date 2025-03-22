# Google OAuth Setup Guide

This guide will walk you through setting up Google OAuth for your Tech Standards application.

## 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID - you'll need it later

## 2. Enable the Google+ API

1. Go to "APIs & Services" > "Library" in your project
2. Search for "Google+ API" and enable it
3. Also enable the "Google OAuth2 API" if it's not already enabled

## 3. Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create credentials" and select "OAuth client ID"
3. Configure the consent screen if prompted (External is fine for testing)
4. For application type, select "Web application"
5. Set a name like "Tech Standards Application"
6. Add the following Authorized JavaScript origins:
   - `http://192.168.178.140:5080`
   - `http://192.168.178.140:5081`
   - `http://localhost:5080` (for local development)
   - Any other domains where your application will be hosted

7. Add the following Authorized redirect URIs:
   - `http://192.168.178.140:5081/api/auth/google/callback`
   - `http://localhost:5081/api/auth/google/callback` (for local development)
   - Any other domains where your application will be hosted + `/api/auth/google/callback`

8. Click "Create"
9. Note your Client ID and Client Secret

## 4. Update Your .env File

Add your Google OAuth credentials to your `.env` file:

```
GOOGLE_CLIENT_ID=your-client-id-from-google-console
GOOGLE_CLIENT_SECRET=your-client-secret-from-google-console
CALLBACK_URL=http://192.168.178.140:5081/api/auth/google/callback
CLIENT_URL=http://192.168.178.140:5080
```

## 5. Restart Your Application

Run:
```
docker-compose down
docker-compose up --build
```

## 6. Testing Google OAuth

1. Open your browser to: http://192.168.178.140:5080/test-api.html
2. Click the "Sign in with Google" button
3. You should be redirected to Google's login page
4. After signing in, you should be redirected back to your application

## Troubleshooting

If Google OAuth isn't working:

1. **Check the server logs** for any error messages related to Google OAuth
2. **Verify your credentials** in the `.env` file match those in the Google Cloud Console
3. **Ensure the callback URL** in your Google Cloud Console exactly matches the one in your `.env` file
4. **Check for cookie issues** - make sure your browser accepts cookies from your domain
5. **Look for CORS errors** in the browser console - these may indicate issues with cross-domain requests

## Common Errors

### "Error: redirect_uri_mismatch"

This means the callback URL in your Google Cloud Console doesn't exactly match the one your application is using. Double-check both URLs and ensure they are identical.

### "Error: invalid_client"

This typically means your Client ID or Client Secret is incorrect. Verify these values in your `.env` file.

### "Error: access_denied"

The user denied permission to your application. Check your OAuth consent screen settings in the Google Cloud Console.

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport Google OAuth 2.0 Strategy](http://www.passportjs.org/packages/passport-google-oauth20/) 