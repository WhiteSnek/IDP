# Identity Provider (IdP) – OAuth 2.0 & Identity Documentation

This document describes the architecture, APIs, authentication flows, security measures, and best practices of the custom Identity Provider (IdP).

---

# 1. High-Level Architecture

## Components

* **IdP Backend** – Manages users, authentication, OAuth, tokens, and identity.
* **IdP Frontend** – Login and registration interface.
* **Services (Clients)** – Applications that authenticate users through the IdP.

## Trust Boundaries

| Boundary          | Description                                                 |
| ----------------- | ----------------------------------------------------------- |
| **IdP Internal**  | Uses HS256 tokens, cookies, and server-side authentication. |
| **OAuth Clients** | Uses RS256 access tokens verified through JWKS.             |

---

# 2. Authentication vs Authorization

| Concept        | Purpose                                     | Managed By   |
| -------------- | ------------------------------------------- | ------------ |
| Authentication | Verifies user identity                      | IdP          |
| Authorization  | Grants client access to user resources      | IdP + Client |
| Identity       | Stores and manages user profile information | IdP          |

---

# 3. Token Strategy

## Internal Tokens

* **Algorithm:** HS256
* **Used For:** IdP UI and internal APIs
* **Storage:** HTTP-only cookies
* **Verification:** Shared secret

## OAuth Access Tokens

* **Algorithm:** RS256
* **Used For:** External services
* **Verification:** JWKS
* **Storage:** Client application

---

# 4. OAuth 2.0 Authorization Code Flow

1. Client redirects user to **`/authorize`**
2. User authenticates with the IdP
3. IdP returns an authorization code
4. Client exchanges the code at **`/token`**
5. Client verifies the access token using JWKS
6. Client retrieves user information from **`/userinfo`**

---

# 5. API Documentation

## `/authorize`

**Method:** `GET`

Initiates the OAuth Authorization Code flow.

### Query Parameters

* `response_type=code`
* `client_id`
* `redirect_uri`
* `scope`
* `state`

### Security

* Validates client and redirect URI
* Requires authenticated user
* Uses `state` for CSRF protection

---

## `/token`

**Method:** `POST`

Exchanges an authorization code for OAuth tokens.

### Request

```json
{
  "grant_type": "authorization_code",
  "code": "...",
  "client_id": "...",
  "client_secret": "...",
  "redirect_uri": "..."
}
```

### Security

* One-time authorization codes
* Authorization code expiration
* Client authentication
* RS256 token signing

### Response

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

---

## `/.well-known/jwks.json`

**Method:** `GET`

Publishes RSA public keys used by client applications to verify access tokens.

### Security

* Only public keys are exposed
* Private keys never leave the IdP

---

## `/userinfo`

**Method:** `GET`

Returns the authenticated user's profile.

### Header

```http
Authorization: Bearer ACCESS_TOKEN
```

### Response

```json
{
  "sub": "userId",
  "email": "user@email.com",
  "name": "First Last"
}
```

### Security

* OAuth access token required
* Token verified using JWKS
* Returns data based on granted scopes

---

# 6. Service-Side Token Verification

Client applications validate access tokens using:

* JWKS
* `issuer` = IdP URL
* `audience` = Client ID

No signing secrets are shared with client applications.

---

# 7. Middleware Separation

## IdP Authentication Middleware

* HS256 verification
* Cookie-based authentication
* Redirects unauthenticated users to login

## OAuth Middleware

* RS256 verification
* Returns JSON responses
* Used by OAuth APIs such as `/userinfo`

---

# 8. Security Measures

* CSRF protection using `state`
* RS256 asymmetric token signing
* JWKS-based verification
* Strict redirect URI validation
* HTTP-only cookies for internal authentication
* Minimal access token payload
* No sensitive data in URLs

---

# 9. Best Practices

* IdP as the single source of truth
* OAuth 2.0 Authorization Code flow
* Clear trust boundaries
* Small, purpose-specific tokens
* No shared signing secrets with clients

---

# 10. User Synchronization (Webhooks)

## Purpose

Keeps client applications synchronized with user profile changes while maintaining the IdP as the single source of truth.

## Flow

1. User updates their profile.
2. IdP stores the changes.
3. IdP sends a signed webhook to each registered client.
4. Client verifies the signature and updates its local user record.

### Example Payload

```json
{
  "id": "cmf7x9z8d0000abc123xyz456",
  "email": "john.doe@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "profile": "https://idp.example.com/images/profiles/john/abc123",
  "phone": "+919876543210",
  "is_email_verified": true,
  "is_phone_verified": false
}
```

### Security

* HMAC SHA-256 signed webhooks
* HTTPS-only delivery
* Minimal user data
* Retry mechanism for failed deliveries

### Benefits

* Near real-time synchronization
* Fewer `/userinfo` requests
* Consistent user data across services

---

# 11. Out of Scope

The following features are intentionally excluded from the current implementation:

* Refresh token rotation
* Consent screen
* Single Logout (SLO)
* Key rotation
* Multi-factor authentication (MFA)
* Passwordless authentication

---

# 12. Summary

This Identity Provider provides a solid OAuth 2.0 and identity foundation with:

* OAuth 2.0 Authorization Code Flow
* HS256 internal authentication
* RS256 access tokens
* JWKS-based verification
* Secure `/userinfo` endpoint
* User synchronization via signed webhooks
* Strong security practices and clear trust boundaries

The architecture is modular, scalable, and designed to support multiple client applications while keeping the IdP as the single source of truth.
