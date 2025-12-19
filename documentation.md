# Identity Provider (IdP) – OAuth 2.0 & Identity Documentation

This document explains the **architecture, APIs, flows, security measures, and best practices** of the custom Identity Provider (IdP) you have built.

---

## 1. High-Level Architecture

### Components

* **IdP Backend**: Manages users, authentication, OAuth, tokens, and identity.
* **IdP Frontend**: Login / Register UI (first-party).
* **Services (Clients)**: External applications relying on the IdP for authentication.

### Trust Boundaries

* **IdP Internal (First-party)**: Uses HS256 tokens, cookies, redirects.
* **OAuth / Services (Third-party)**: Uses RS256 tokens, JWKS, API-style responses.

---

## 2. Authentication vs Authorization

| Concept               | Purpose                                  | Managed By    |
| --------------------- | ---------------------------------------- | ------------- |
| Authentication        | Verifies *who the user is*               | IdP only      |
| Authorization (OAuth) | Allows services to act on behalf of user | IdP + Service |
| Identity              | User profile & attributes                | IdP only      |

---

## 3. Token Strategy

### Token Types

#### IdP Internal Tokens

* Algorithm: **HS256**
* Scope: IdP UI & internal APIs
* Storage: httpOnly cookies
* Verified using shared secret

#### OAuth Access Tokens

* Algorithm: **RS256**
* Scope: External services
* Verified via **JWKS**
* No shared secrets with services

---

## 4. Core OAuth 2.0 Flow (Authorization Code)

### Step-by-Step Flow

1. **Service → IdP (/authorize)**
2. **User authenticates on IdP**
3. **IdP issues authorization code**
4. **Service exchanges code for token (/token)**
5. **Service verifies token using JWKS**
6. **Service fetches user profile from /userinfo**

---

## 5. API Documentation

---

### 5.1 `/authorize`

**Purpose**: Initiates OAuth login and user consent.

**Method**: `GET`

**Protected**: Yes (IdP auth middleware)

**Query Params**:

* `response_type=code`
* `client_id`
* `redirect_uri`
* `scope`
* `state`

**Security Measures**:

* Validates `response_type`
* Validates `client_id` + `redirect_uri`
* Requires logged-in user
* CSRF protection via `state`

**Result**:

* Redirects back to service with `code` and `state`

---

### 5.2 `/token`

**Purpose**: Exchanges authorization code for tokens.

**Method**: `POST`

**Body**:

```json
{
  "grant_type": "authorization_code",
  "code": "...",
  "client_id": "...",
  "client_secret": "...",
  "redirect_uri": "..."
}
```

**Security Measures**:

* One-time authorization codes
* Code expiration
* Client authentication via secret
* RS256 token signing

**Response**:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

---

### 5.3 `/.well-known/jwks.json`

**Purpose**: Publishes public keys for token verification.

**Method**: `GET`

**Public**: Yes

**Returns**:

* RSA public keys in JWK format
* Includes `kid`, `alg`, `use`

**Security Measures**:

* Only public keys exposed
* Private keys never leave IdP

---

### 5.4 `/userinfo` (or `/user`)

**Purpose**: Returns user profile information.

**Method**: `GET`

**Auth**: OAuth Access Token (Bearer)

**Headers**:

```
Authorization: Bearer ACCESS_TOKEN
```

**Response**:

```json
{
  "sub": "userId",
  "email": "user@email.com",
  "name": "First Last"
}
```

**Security Measures**:

* Token verified via JWKS
* Scope-based data exposure
* IdP remains single source of truth

---

## 6. Service-Side Token Verification

Services verify tokens using:

* JWKS
* `audience` = client_id
* `issuer` = IdP URL

No secrets are shared with services.

---

## 7. Middleware Separation

### IdP Auth Middleware

* HS256 verification
* Redirects to login
* Used for IdP UI routes

### OAuth Middleware

* RS256 verification
* JSON error responses
* Used for `/userinfo` and OAuth APIs

---

## 8. Security Measures Implemented

* CSRF protection via `state`
* Asymmetric token signing (RS256)
* JWKS-based verification
* No token exposure in URLs
* Minimal access token payload
* No user data duplication
* Strict redirect URI validation

---

## 9. Best Practices Followed

* IdP as single source of truth
* Small, purpose-specific tokens
* Clear trust boundaries
* No shared secrets across services
* OAuth-compliant endpoints & flows

---

## 10. What Is Intentionally Out of Scope

* Refresh token rotation
* Consent UI
* Logout propagation
* Key rotation
* MFA / Passwordless

These can be added without changing the foundation.

---

## 11. Summary

This IdP implements a **production-grade OAuth 2.0 + Identity core**:

* Correct flows
* Strong cryptography
* Clean architecture
* Scalable to multiple services

The foundation is complete and extensible.

---

**End of Documentation**
