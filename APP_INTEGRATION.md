# App Integration Guide: Auto-Logout on Session End

## Overview
When an admin ends a user session from the dashboard, the user should be automatically logged out in your application. This document explains how to implement this feature.

---

## Implementation Steps

### Step 1: Backend API Endpoint

**Endpoint:** `GET /api/sessions/validate/:sessionId`

**Purpose:** Check if a session is still active

**Request:**
```http
GET /api/sessions/validate/{sessionId}
```

**Response Examples:**

**Active Session:**
```json
{
  "valid": true,
  "sessionId": "abc123...",
  "userId": "user123",
  "loginAt": "2026-02-08T10:00:00.000Z"
}
```

**Ended Session:**
```json
{
  "valid": false,
  "reason": "Session ended by admin",
  "endedAt": "2026-02-08T11:30:00.000Z",
  "endReason": "Terminated by admin"
}
```

**Session Not Found:**
```json
{
  "valid": false,
  "reason": "Session not found"
}
```

---

### Step 2: App Implementation

#### Option A: Polling Method (Recommended)

Periodically check session validity in your app:

**For Electron/Desktop App:**
```javascript
// In your main app process or renderer
let sessionCheckInterval;

function startSessionMonitoring(sessionId) {
    // Check every 30 seconds
    sessionCheckInterval = setInterval(async () => {
        const isValid = await checkSessionStatus(sessionId);
        if (!isValid) {
            // Force logout
            handleForceLogout();
        }
    }, 30000); // 30 seconds
}

async function checkSessionStatus(sessionId) {
    try {
        const response = await fetch(`${API_URL}/api/sessions/validate/${sessionId}`);
        const data = await response.json();
        
        if (!data.valid) {
            console.log('Session invalidated:', data.reason);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Session check failed:', error);
        return true; // Don't logout on network errors
    }
}

function handleForceLogout() {
    // Clear local storage
    localStorage.clear();
    
    // Show notification to user
    showNotification({
        title: 'Session Ended',
        message: 'Your session has been ended by an administrator. Please login again.',
        type: 'warning'
    });
    
    // Redirect to login
    window.location.href = '/login';
    
    // Clear interval
    clearInterval(sessionCheckInterval);
}

function stopSessionMonitoring() {
    if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
    }
}

// Start monitoring after successful login
// Call this in your login success handler
startSessionMonitoring(sessionId);

// Stop monitoring on logout
// Call this in your logout handler
stopSessionMonitoring();
```

**For React Native/Mobile App:**
```javascript
import { AppState } from 'react-native';

class SessionMonitor {
    constructor(sessionId, apiUrl) {
        this.sessionId = sessionId;
        this.apiUrl = apiUrl;
        this.interval = null;
        this.appStateSubscription = null;
    }

    start() {
        // Check immediately
        this.checkSession();
        
        // Then check every 30 seconds
        this.interval = setInterval(() => {
            this.checkSession();
        }, 30000);

        // Also check when app comes to foreground
        this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                this.checkSession();
            }
        });
    }

    async checkSession() {
        try {
            const response = await fetch(`${this.apiUrl}/api/sessions/validate/${this.sessionId}`);
            const data = await response.json();

            if (!data.valid) {
                this.handleInvalidSession(data);
            }
        } catch (error) {
            console.error('Session check failed:', error);
        }
    }

    handleInvalidSession(data) {
        // Clear auth tokens
        AsyncStorage.clear();

        // Show alert
        Alert.alert(
            'Session Ended',
            data.reason || 'Your session has been ended. Please login again.',
            [{ text: 'OK', onPress: () => this.navigateToLogin() }]
        );

        this.stop();
    }

    navigateToLogin() {
        // Your navigation logic here
        // navigation.navigate('Login');
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (this.appStateSubscription) {
            this.appStateSubscription.remove();
        }
    }
}

// Usage in your app:
// After login
const monitor = new SessionMonitor(sessionId, API_URL);
monitor.start();

// On logout
monitor.stop();
```

#### Option B: WebSocket/Real-Time Method (Advanced)

For instant logout, implement WebSocket connection:

```javascript
// Server-side (add to your backend)
const io = require('socket.io')(server);

// When admin ends a session
socket.emit('session-ended', {
    userId: 'user123',
    sessionId: 'abc123',
    reason: 'Terminated by admin'
});

// Client-side
const socket = io(API_URL);

socket.on('session-ended', (data) => {
    if (data.sessionId === currentSessionId) {
        handleForceLogout();
    }
});
```

---

### Step 3: Session Storage in App

Make sure your app stores the `sessionId` after login:

```javascript
// After successful login
async function handleLoginSuccess(loginResponse) {
    const { token, sessionId, user } = loginResponse;
    
    // Store session ID
    localStorage.setItem('sessionId', sessionId);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Start session monitoring
    startSessionMonitoring(sessionId);
}
```

---

### Step 4: API Configuration

**Production URLs:**
```javascript
const API_CONFIG = {
    baseURL: 'https://backend-six-eta-75.vercel.app',
    endpoints: {
        validateSession: '/api/sessions/validate'
    }
};
```

**Local Development:**
```javascript
const API_CONFIG = {
    baseURL: 'http://localhost:5000',
    endpoints: {
        validateSession: '/api/sessions/validate'
    }
};
```

---

## Testing Guide

### Test Scenario 1: Normal Session Validation
1. User logs in to app
2. Session monitoring starts
3. Session remains valid
4. App continues working normally

### Test Scenario 2: Admin Ends Session
1. User is logged in to app
2. Admin goes to dashboard → Sessions page
3. Admin clicks "End Session" for that user
4. Within 30 seconds, app detects invalid session
5. App shows notification: "Session ended by administrator"
6. App automatically logs out user
7. App redirects to login page

### Test Scenario 3: Network Failure
1. User is logged in
2. Internet connection is lost
3. Session check fails
4. App should NOT logout (to avoid false positives)
5. When connection returns, session check resumes

---

## Recommended Check Intervals

- **Desktop App:** 30 seconds
- **Mobile App:** 
  - Background: 60 seconds
  - Foreground: 30 seconds
  - On app resume: Immediately
- **Web App:** 30 seconds

---

## Security Best Practices

1. **Don't logout on network errors** - Only logout when server explicitly says session is invalid
2. **Check on app resume** - Always validate when app comes to foreground
3. **Clear all data** - On force logout, clear all localStorage/AsyncStorage
4. **User notification** - Always inform user why they were logged out
5. **Rate limiting** - Don't check more frequently than every 15 seconds

---

## Error Handling

```javascript
async function checkSessionStatus(sessionId) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(
            `${API_URL}/api/sessions/validate/${sessionId}`,
            { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            console.error('Session check HTTP error:', response.status);
            return true; // Don't logout on server errors
        }
        
        const data = await response.json();
        return data.valid;
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('Session check timeout');
        } else {
            console.error('Session check failed:', error);
        }
        return true; // Don't logout on errors
    }
}
```

---

## Implementation Checklist

- [ ] Store sessionId on login
- [ ] Implement session validation API call
- [ ] Add periodic session checking (30s interval)
- [ ] Handle invalid session response
- [ ] Clear all stored data on force logout
- [ ] Show user notification
- [ ] Redirect to login page
- [ ] Test with admin ending session
- [ ] Test network failure scenarios
- [ ] Add session check on app resume
- [ ] Stop checking on normal logout

---

## Prompt for App Development Agent

```
Please implement automatic logout feature in our application that responds to admin session termination from the dashboard.

REQUIREMENTS:
1. After user login, start monitoring session validity every 30 seconds
2. Call API endpoint: GET /api/sessions/validate/{sessionId}
3. If response.valid === false, immediately logout the user
4. Show notification: "Your session has been ended by an administrator"
5. Clear all localStorage/AsyncStorage data
6. Redirect to login page
7. Handle network errors gracefully - don't logout on network failures
8. Check session status when app comes to foreground/resumes
9. Stop monitoring when user logs out normally

INTEGRATION POINTS:
- Session validation endpoint: /api/sessions/validate/:sessionId
- Response format: {valid: boolean, reason: string}
- Check interval: 30 seconds
- Timeout: 10 seconds per check

TECHNICAL DETAILS:
- Store sessionId from login response
- Use setInterval for periodic checks
- Add timeout to API calls (10s)
- Don't logout on HTTP errors or network failures
- Only logout when valid === false
- Clear interval on logout

Please implement this feature following the APP_INTEGRATION.md guide provided.
```

---

## Support

For questions or issues with integration, contact the backend team or refer to the main API documentation.
