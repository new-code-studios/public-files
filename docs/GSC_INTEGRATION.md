# Google Search Console Integration

## Overview
This document outlines the GSC integration architecture and workflow.

## OAuth2 Flow

### 1. Authorization
- User clicks "Connect Google Search Console"
- Redirects to Google OAuth consent screen
- User grants permissions
- Callback returns authorization code

### 2. Token Exchange
```
POST /auth/gsc/callback
Body: { code, state }
Response: { access_token, refresh_token }
```

### 3. API Integration
- Store tokens securely in database
- Use refresh tokens for automatic renewal
- Make authenticated requests to GSC API

## Verification Methods

### Auto-Verification Flow
1. **DNS Verification**: Add TXT record to domain
2. **Meta Tag Verification**: Insert meta tag in HTML
3. **File Upload**: Upload verification file to root
4. **HTML Tag in GSC**: Use GSC's built-in verification

## API Endpoints

### Connect GSC
```
GET /api/gsc/connect
Response: { authorization_url }
```

### Get Verified Properties
```
GET /api/gsc/properties
Response: { properties: [...] }
```

### Trigger Verification
```
POST /api/gsc/verify
Body: { property_url, method }
Response: { verification_code, status }
```

### Get Performance Data
```
GET /api/gsc/performance?property={url}&days=30
Response: { clicks, impressions, ctr, position }
```
