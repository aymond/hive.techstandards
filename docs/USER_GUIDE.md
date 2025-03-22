# Technology Lifecycle Manager - User Guide

This guide is intended for standard users of the Technology Lifecycle Manager platform. It covers authentication, navigation, viewing technologies, and submitting change requests.

## Table of Contents

1. [Getting Started](#getting-started)
   - [Account Creation](#account-creation)
   - [Login](#login)
   - [Joining a Tenant](#joining-a-tenant)
2. [Navigating the Platform](#navigating-the-platform)
3. [Viewing Technologies](#viewing-technologies)
   - [Filtering Technologies](#filtering-technologies)
   - [Technology Details](#technology-details)
4. [Change Requests](#change-requests)
   - [Submitting a Change Request](#submitting-a-change-request)
   - [Tracking Your Change Requests](#tracking-your-change-requests)
5. [Account Management](#account-management)
   - [Profile Settings](#profile-settings)
   - [Changing Tenants](#changing-tenants)
6. [Troubleshooting](#troubleshooting)

## Getting Started

### Account Creation

You can create an account in two ways:

1. **Google OAuth (Recommended)**:
   - Click the "Login with Google" button on the login page
   - Grant the necessary permissions
   - You'll be automatically registered and logged in

2. **Email Registration**:
   - Click "Register" on the login page
   - Fill in your name, email, and password
   - Click "Create Account"

### Login

1. Navigate to the login page
2. Choose one of the following methods:
   - Enter your email and password, then click "Login"
   - Click "Login with Google" to use your Google account

### Joining a Tenant

If your organization is already using the Technology Lifecycle Manager:

1. Ask your administrator for your tenant key
2. After logging in, click "Join Tenant" in the account dropdown
3. Enter the tenant key in the provided field
4. Click "Join"
5. You will now have access to your organization's technology data

## Navigating the Platform

The platform has a simple navigation structure:

- **Header**: Contains the application title, your account menu, and navigation links
- **Main Content**: Displays the technology list or details depending on your current view
- **Footer**: Contains copyright information and additional links

## Viewing Technologies

The main dashboard displays all technologies available in your tenant. Each technology is represented as a card showing:

- Name
- Vendor
- Capability category
- Lifecycle status with a color indicator

### Filtering Technologies

To find specific technologies:

1. Use the filter panel at the top of the dashboard
2. You can filter by:
   - Capability (e.g., Frontend Framework, Database, Cloud Service)
   - Vendor (e.g., Google, Microsoft, Amazon)
   - Lifecycle Status (e.g., Active, Deprecated, Retired)
3. The technology list updates automatically as you apply filters
4. The count of displayed technologies is shown above the list

### Technology Details

To view more details about a technology:

1. Click on a technology card in the list
2. The card will expand to show:
   - Full description
   - Start date (when the technology was adopted)
   - End date (if applicable)
   - Additional technical details

## Change Requests

As a standard user, you cannot directly modify technology data. Instead, you can submit change requests that administrators will review.

### Submitting a Change Request

To suggest a change to an existing technology:

1. Open the technology details by clicking on its card
2. Click "Request Change" button
3. Select the type of change:
   - Update (modify existing information)
   - Delete (suggest removing the technology)
4. For updates, fill in the fields you'd like to change
5. Add comments explaining the reason for your change request
6. Click "Submit Request"

To suggest adding a new technology:

1. Click the "Request New Technology" button in the dashboard
2. Fill in all required fields for the new technology
3. Add comments explaining why this technology should be added
4. Click "Submit Request"

### Tracking Your Change Requests

To view the status of your submitted change requests:

1. Click on your account name in the top right
2. Select "My Change Requests"
3. You'll see a list of all your submitted requests with their current status:
   - Pending: Not yet reviewed
   - Approved: Accepted and implemented
   - Rejected: Declined with comments

Click on any request to view its details and any feedback from administrators.

## Account Management

### Profile Settings

To update your account information:

1. Click on your account name in the top right
2. Select "Profile Settings"
3. You can update:
   - Your display name
   - Profile picture
   - Password (if not using Google login)
4. Click "Save Changes" when done

### Changing Tenants

If you need to switch to another tenant:

1. Click on your account name in the top right
2. Select "Join Tenant"
3. Enter the new tenant key
4. Click "Join"

Note that you'll still retain access to your previous tenant and can switch back at any time.

## Troubleshooting

**Issue**: Unable to log in with email/password
- Verify you're using the correct email address
- Reset your password if you've forgotten it
- Contact your administrator if the problem persists

**Issue**: Cannot see any technologies after login
- Verify you've joined the correct tenant
- Check with your administrator that your account has been properly set up

**Issue**: Change request seems to be stuck in "Pending" status
- Change requests are reviewed manually by administrators
- This process may take some time depending on your organization
- You can contact your administrator for updates

For any other issues, please contact your tenant administrator. 