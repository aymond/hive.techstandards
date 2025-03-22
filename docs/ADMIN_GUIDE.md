# Technology Lifecycle Manager - Administrator Guide

This guide is intended for administrators of the Technology Lifecycle Manager platform. It covers tenant management, user management, technology administration, and the change request workflow.

## Table of Contents

1. [Administrator Roles](#administrator-roles)
   - [System Administrator](#system-administrator)
   - [Tenant Administrator](#tenant-administrator)
2. [Tenant Management](#tenant-management)
   - [Creating a New Tenant](#creating-a-new-tenant)
   - [Managing Tenant Settings](#managing-tenant-settings)
   - [Tenant Keys](#tenant-keys)
3. [User Management](#user-management)
   - [Viewing Users](#viewing-users)
   - [Changing User Roles](#changing-user-roles)
   - [Inviting Users](#inviting-users)
4. [Technology Management](#technology-management)
   - [Adding Technologies](#adding-technologies)
   - [Editing Technologies](#editing-technologies)
   - [Deleting Technologies](#deleting-technologies)
5. [Change Request Workflow](#change-request-workflow)
   - [Reviewing Change Requests](#reviewing-change-requests)
   - [Approving Requests](#approving-requests)
   - [Rejecting Requests](#rejecting-requests)
6. [Security Best Practices](#security-best-practices)
7. [Troubleshooting](#troubleshooting)

## Administrator Roles

The platform has two types of administrator roles:

### System Administrator

A system administrator has global access and can:
- Create and manage tenants
- Assign the first tenant administrator
- Access system-wide settings

The system administrator is identified by the email address specified in the `SYSTEM_ADMIN_EMAIL` environment variable.

### Tenant Administrator

A tenant administrator can:
- Manage technologies within their tenant
- Manage users within their tenant
- Approve or reject change requests
- Update tenant settings

## Tenant Management

### Creating a New Tenant

Only a system administrator can create new tenants.

1. Log in as the system administrator
2. Navigate to "Tenant Management" from the admin panel
3. Click "Create New Tenant"
4. Fill in the required information:
   - Tenant Name: The display name for the tenant
   - Domain (optional): Associated email domain
   - Admin Email: Email address for the initial tenant administrator
5. Click "Create Tenant"

The system will automatically generate a unique tenant key and create the tenant. If an admin email is provided, that user will be assigned the admin role for the new tenant.

### Managing Tenant Settings

As a tenant administrator:

1. Navigate to "Tenant Settings" from the admin panel
2. You can update:
   - Tenant Name
   - Domain (optional)
   - Custom settings

### Tenant Keys

Tenant keys are used to allow users to join a specific tenant.

To view your tenant key:
1. Go to "Tenant Settings"
2. The tenant key is displayed in the "Tenant Key" field

To regenerate a tenant key (if the current one is compromised):
1. Go to "Tenant Settings"
2. Click "Regenerate Key"
3. Confirm the action

**Important**: Regenerating the key will invalidate the old key. Any users attempting to join with the old key will not be able to do so.

## User Management

### Viewing Users

To view all users in your tenant:

1. Navigate to "User Management" from the admin panel
2. You'll see a list of all users with:
   - Name
   - Email
   - Role
   - Last login timestamp

### Changing User Roles

To change a user's role:

1. Navigate to "User Management"
2. Find the user in the list
3. Click the "Edit" button
4. Change the role from the dropdown (User or Admin)
5. Click "Save"

### Inviting Users

The platform doesn't currently have a direct invitation system, but you can invite users by:

1. Navigate to "Tenant Settings" to view your tenant key
2. Share the tenant key with the users you want to invite
3. Instruct them to:
   - Register an account
   - Use the "Join Tenant" feature with your tenant key

## Technology Management

### Adding Technologies

To add a new technology:

1. From the technology dashboard, click "Add New Technology"
2. Fill in all required fields:
   - Name
   - Description
   - Vendor
   - Capability
   - Lifecycle Status
   - Start Date
   - End Date (if applicable)
3. Click "Save"

### Editing Technologies

To edit an existing technology:

1. Find the technology in the dashboard
2. Click on it to view details
3. Click the "Edit" button
4. Update the desired fields
5. Click "Save"

### Deleting Technologies

To delete a technology:

1. Find the technology in the dashboard
2. Click on it to view details
3. Click the "Delete" button
4. Confirm the deletion

**Note**: Deletion is permanent and cannot be undone. Consider changing the lifecycle status to "Retired" instead of deleting if you want to maintain historical records.

## Change Request Workflow

Regular users can submit requests to add, modify, or delete technologies. Administrators need to review these requests.

### Reviewing Change Requests

To view pending change requests:

1. Navigate to "Change Requests" from the admin panel
2. You'll see a list of all requests with:
   - Requester name
   - Technology affected
   - Request type (Create, Update, Delete)
   - Submission date

### Approving Requests

To approve a change request:

1. Click on the request to view details
2. Review the requested changes
3. If satisfactory, click "Approve"
4. Add comments if needed
5. Click "Submit"

The system will automatically implement the approved changes.

### Rejecting Requests

To reject a change request:

1. Click on the request to view details
2. If the request should not be implemented, click "Reject"
3. Add comments explaining the reason for rejection
4. Click "Submit"

The requester will be notified that their request was rejected along with your comments.

## Security Best Practices

1. **Tenant Keys**: Treat tenant keys as sensitive information and only share them with trusted individuals.

2. **Role Assignment**: Be cautious when assigning the Admin role. Admins have full control over all technologies and users within a tenant.

3. **Regular Audits**: Periodically review the list of users and their roles to ensure appropriate access.

4. **Password Security**: Encourage users to use strong passwords or Google OAuth for improved security.

5. **Tenant Key Rotation**: Consider regenerating your tenant key periodically, especially after major organizational changes.

## Troubleshooting

**Issue**: Can't create a new tenant
- Verify you're logged in as the system administrator
- Check that all required fields are completed correctly

**Issue**: User can't join using the tenant key
- Verify the correct tenant key is being used
- Ensure the user is entering the key exactly as shown
- Check if the tenant key has been recently regenerated

**Issue**: Changes to technologies are not showing up
- Clear your browser cache
- Reload the page
- Check if your changes were properly saved

**Issue**: Unable to approve a change request
- Verify you have admin privileges for the tenant
- Try logging out and back in

For system-level issues, please refer to server logs and contact the system administrator or IT support. 