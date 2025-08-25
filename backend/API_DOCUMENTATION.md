# NeuraSlide API Documentation

## 🌐 Base URL

```
http://localhost:5513
```

## 📋 Table of Contents

1. [Health & Info](#health--info)
2. [Authentication](#authentication)
3. [Instagram Integration](#instagram-integration)
4. [Conversations](#conversations)
5. [Automations](#automations)
6. [Products](#products)
7. [AI Services](#ai-services)
8. [Campaigns](#campaigns)
9. [Dashboard](#dashboard)
10. [Billing](#billing)
11. [Account Management](#account-management)
12. [Admin (Nexus)](#admin-nexus)
13. [Webhooks](#webhooks)

---

## 🏥 Health & Info

### GET `/health`

**Purpose**: Check if the server is running and healthy
**Why Required**: Essential for monitoring, load balancers, and health checks
**Authentication**: None required

**Response**:

```json
{
  "success": true,
  "message": "NeuraSlide backend is running",
  "data": {
    "status": "OK",
    "timestamp": "2025-08-21T11:10:11.912Z",
    "version": "1.0.0",
    "environment": "development"
  }
}
```

### GET `/`

**Purpose**: Get API information and available endpoints
**Why Required**: Helps developers understand available functionality
**Authentication**: None required

**Response**:

```json
{
  "success": true,
  "message": "Welcome to NeuraSlide API",
  "data": {
    "version": "1.0.0",
    "environment": "development",
    "endpoints": {
      "health": "/health",
      "crystal": {
        "auth": "/crystal/auth",
        "instagram": "/crystal/instagram",
        "conversations": "/crystal/conversations",
        "automations": "/crystal/automations",
        "products": "/crystal/products",
        "ai": "/crystal/ai",
        "campaigns": "/crystal/campaigns",
        "dashboard": "/crystal/dashboard",
        "billing": "/crystal/billing",
        "account": "/crystal/account"
      },
      "nexus": {
        "admin": "/nexus/admin"
      },
      "webhooks": {
        "instagram": "/webhooks/instagram",
        "stripe": "/webhooks/stripe"
      }
    }
  }
}
```

---

## 🔐 Authentication

### POST `/crystal/auth/signup`, done

**Purpose**: Register a new user account
**Why Required**: Core functionality for user onboarding
**Authentication**: None required

**Payload**:

```json
{
  "email": "customer@example.com",
  "password": "TestPass123",
  "name": "John Doe",
  "teamName": "My Business"
}
```

**Validation Rules**:

- Email: Valid email format
- Password: Minimum 6 characters, at least 1 uppercase, 1 lowercase, 1 number
- Name: Required, 1-100 characters, letters and spaces only
- TeamName: Optional, 2-50 characters

**Response**:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user123",
      "email": "customer@example.com",
      "name": "John Doe",
      "role": "owner",
      "isEmailVerified": false,
      "createdAt": "2025-08-21T11:10:11.912Z"
    },
    "team": {
      "id": "team123",
      "name": "My Business",
      "ownerId": "user123",
      "plan": "free",
      "createdAt": "2025-08-21T11:10:11.912Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST `/crystal/auth/login` done

**Purpose**: Authenticate user and get access token
**Why Required**: Secure access to protected resources
**Authentication**: None required

**Payload**:

```json
{
  "email": "customer@example.com",
  "password": "TestPass123"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user123",
      "email": "customer@example.com",
      "name": "John Doe",
      "role": "owner",
      "isEmailVerified": false,
      "teamId": "team123"
    },
    "team": {
      "id": "team123",
      "name": "My Business",
      "ownerId": "user123",
      "plan": "free"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### GET `/crystal/auth/me` done

**Purpose**: Get current user profile
**Why Required**: Display user information in dashboard
**Authentication**: Bearer token required

**Headers**:

```
Authorization: Bearer {JWT_TOKEN}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "user123",
    "email": "customer@example.com",
    "name": "John Doe",
    "role": "owner",
    "isEmailVerified": false,
    "teamId": "team123",
    "createdAt": "2025-08-21T11:10:11.912Z"
  }
}
```

### POST `/crystal/auth/logout`

**Purpose**: Logout user (invalidate token)
**Why Required**: Security - proper session termination
**Authentication**: Bearer token required

**Headers**:

```
Authorization: Bearer {JWT_TOKEN}
```

**Response**:

```json
{
  "success": true,
  "message": "Logout successful"
}
```

### POST `/crystal/auth/forgot-password`

**Purpose**: Send password reset email
**Why Required**: User account recovery
**Authentication**: None required

**Payload**:

```json
{
  "email": "customer@example.com"
}
```

### POST `/crystal/auth/reset-password`

**Purpose**: Reset password using token
**Why Required**: Complete password reset flow
**Authentication**: None required

**Payload**:

```json
{
  "token": "reset_token_here",
  "newPassword": "NewPass123"
}
```

### POST `/crystal/auth/change-password`

**Purpose**: Change password for authenticated user
**Why Required**: Account security management
**Authentication**: Bearer token required

**Payload**:

```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123"
}
```

### POST `/crystal/auth/verify-email`

**Purpose**: Verify email address
**Why Required**: Email verification for security
**Authentication**: None required

**Payload**:

```json
{
  "token": "verification_token_here"
}
```

---

## 📱 Instagram Integration

### GET `/crystal/instagram/accounts`

**Purpose**: Get user's connected Instagram accounts
**Why Required**: Display connected accounts in dashboard
**Authentication**: Bearer token required

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "ig_account_123",
      "username": "mybusiness",
      "accountType": "BUSINESS",
      "isConnected": true,
      "lastSyncAt": "2025-08-21T11:10:11.912Z"
    }
  ]
}
```

### POST `/crystal/instagram/connect`

**Purpose**: Connect Instagram account via OAuth
**Why Required**: Enable Instagram automation features
**Authentication**: Bearer token required

**Payload**:

```json
{
  "authCode": "oauth_code_from_instagram"
}
```

### DELETE `/crystal/instagram/accounts/:id`

**Purpose**: Disconnect Instagram account
**Why Required**: Account management
**Authentication**: Bearer token required

---

## 💬 Conversations

### GET `/crystal/conversations`

**Purpose**: Get user's Instagram conversations
**Why Required**: Display conversation history
**Authentication**: Bearer token required

**Query Parameters**:

- `page` (number): Page number for pagination
- `limit` (number): Items per page (default: 10)
- `status` (string): Filter by status (ACTIVE, ARCHIVED)
- `search` (string): Search by participant name

**Response**:

```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conv123",
        "participantUsername": "customer1",
        "participantFullName": "John Customer",
        "lastMessageAt": "2025-08-21T11:10:11.912Z",
        "lastMessageText": "Hello there!",
        "messageCount": 5,
        "status": "ACTIVE"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### GET `/crystal/conversations/:id`

**Purpose**: Get specific conversation with messages
**Why Required**: View conversation details and history
**Authentication**: Bearer token required

**Response**:

```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "conv123",
      "participantUsername": "customer1",
      "participantFullName": "John Customer",
      "status": "ACTIVE",
      "messages": [
        {
          "id": "msg123",
          "text": "Hello there!",
          "senderType": "CUSTOMER",
          "createdAt": "2025-08-21T11:10:11.912Z"
        }
      ]
    }
  }
}
```

### POST `/crystal/conversations/:id/messages`

**Purpose**: Send message in conversation
**Why Required**: Manual message sending
**Authentication**: Bearer token required

**Payload**:

```json
{
  "text": "Thank you for your message!",
  "mediaUrls": ["https://example.com/image.jpg"]
}
```

---

## 🤖 Automations

### GET `/crystal/automations`

**Purpose**: Get user's automation rules
**Why Required**: Display automation dashboard
**Authentication**: Bearer token required

**Query Parameters**:

- `page` (number): Page number
- `limit` (number): Items per page
- `search` (string): Search by name
- `status` (string): Filter by status (ACTIVE, INACTIVE)

**Response**:

```json
{
  "success": true,
  "data": {
    "automations": [
      {
        "id": "auto123",
        "name": "Welcome Message",
        "trigger": "hello",
        "response": "Hi there! Welcome to our store!",
        "isActive": true,
        "createdAt": "2025-08-21T11:10:11.912Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  }
}
```

### POST `/crystal/automations`

**Purpose**: Create new automation rule
**Why Required**: Set up automated responses
**Authentication**: Bearer token required

**Payload**:

```json
{
  "name": "Welcome Message",
  "trigger": "hello",
  "response": "Hi there! Welcome to our store!",
  "conditions": {
    "keywords": ["hello", "hi", "hey"],
    "exactMatch": false
  }
}
```

**Validation Rules**:

- Name: Required, non-empty
- Trigger: Required, non-empty
- Response: Required, non-empty

### GET `/crystal/automations/:id`

**Purpose**: Get specific automation details
**Why Required**: Edit automation settings
**Authentication**: Bearer token required

### PUT `/crystal/automations/:id`

**Purpose**: Update automation rule
**Why Required**: Modify automation behavior
**Authentication**: Bearer token required

**Payload**: Same as POST (all fields optional)

### DELETE `/crystal/automations/:id`

**Purpose**: Delete automation rule
**Why Required**: Remove unwanted automations
**Authentication**: Bearer token required

### POST `/crystal/automations/:id/toggle`

**Purpose**: Enable/disable automation
**Why Required**: Quick activation/deactivation
**Authentication**: Bearer token required

**Response**:

```json
{
  "success": true,
  "message": "Automation status toggled successfully",
  "data": {
    "isActive": false
  }
}
```

### POST `/crystal/automations/:id/test`

**Purpose**: Test automation with sample message
**Why Required**: Verify automation works correctly
**Authentication**: Bearer token required

**Payload**:

```json
{
  "message": "hello world"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "triggered": true,
    "response": "Hi there! Welcome to our store!",
    "matchedTrigger": "hello"
  }
}
```

---

## 🛍️ Products

### GET `/crystal/products`

**Purpose**: Get user's product catalog
**Why Required**: Display products in dashboard
**Authentication**: Bearer token required

**Query Parameters**:

- `page` (number): Page number
- `limit` (number): Items per page
- `category` (string): Filter by category
- `search` (string): Search by name/description

**Response**:

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod123",
        "name": "Premium T-Shirt",
        "description": "High-quality cotton t-shirt",
        "category": "Clothing",
        "price": 29.99,
        "currency": "USD",
        "images": ["https://example.com/tshirt.jpg"],
        "tags": ["clothing", "tshirt", "cotton"]
      }
    ]
  }
}
```

### POST `/crystal/products`

**Purpose**: Add new product to catalog
**Why Required**: Build product database for AI responses
**Authentication**: Bearer token required

**Payload**:

```json
{
  "name": "Premium T-Shirt",
  "description": "High-quality cotton t-shirt",
  "category": "Clothing",
  "price": 29.99,
  "currency": "USD",
  "images": ["https://example.com/tshirt.jpg"],
  "tags": ["clothing", "tshirt", "cotton"],
  "specifications": {
    "material": "Cotton",
    "size": "M",
    "color": "Blue"
  }
}
```

### GET `/crystal/products/search`

**Purpose**: Search products for AI responses
**Why Required**: Enable AI to recommend products
**Authentication**: Bearer token required

**Query Parameters**:

- `q` (string): Search query
- `category` (string): Filter by category
- `limit` (number): Max results

### POST `/crystal/products/bulk-import`

**Purpose**: Import multiple products at once
**Why Required**: Efficient product catalog setup
**Authentication**: Bearer token required

**Payload**:

```json
{
  "products": [
    {
      "name": "Product 1",
      "description": "Description 1",
      "category": "Category 1",
      "price": 10.99
    },
    {
      "name": "Product 2",
      "description": "Description 2",
      "category": "Category 2",
      "price": 20.99
    }
  ]
}
```

---

## 🧠 AI Services

### POST `/crystal/ai/generate`

**Purpose**: Generate AI response for customer message
**Why Required**: Provide intelligent automated responses
**Authentication**: Bearer token required

**Payload**:

```json
{
  "message": "Do you have any t-shirts?",
  "conversationId": "conv123",
  "context": {
    "customerName": "John",
    "previousMessages": ["Hello", "Hi there!"]
  }
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "response": "Yes! We have a great selection of t-shirts. Our Premium Cotton T-Shirt is very popular and costs $29.99. Would you like to know more about it?",
    "confidence": 0.95,
    "sources": ["product_catalog", "conversation_history"]
  }
}
```

### GET `/crystal/ai/conversations`

**Purpose**: Get AI conversation history
**Why Required**: Review AI performance and responses
**Authentication**: Bearer token required

### GET `/crystal/ai/conversations/:id`

**Purpose**: Get specific AI conversation
**Why Required**: Analyze AI response quality
**Authentication**: Bearer token required

### POST `/crystal/ai/training-data`

**Purpose**: Add training data for AI improvement
**Why Required**: Improve AI response quality
**Authentication**: Bearer token required

**Payload**:

```json
{
  "question": "Do you have t-shirts?",
  "answer": "Yes, we have premium cotton t-shirts for $29.99",
  "category": "product_inquiry"
}
```

---

## 📢 Campaigns

### GET `/crystal/campaigns`

**Purpose**: Get marketing campaigns
**Why Required**: Manage promotional activities
**Authentication**: Bearer token required

### POST `/crystal/campaigns`

**Purpose**: Create new marketing campaign
**Why Required**: Launch promotional campaigns
**Authentication**: Bearer token required

**Payload**:

```json
{
  "name": "Summer Sale",
  "description": "20% off all summer items",
  "targetAudience": "all_customers",
  "message": "Summer sale is here! Get 20% off all summer items!",
  "startDate": "2025-06-01T00:00:00Z",
  "endDate": "2025-08-31T23:59:59Z"
}
```

### GET `/crystal/campaigns/:id/analytics`

**Purpose**: Get campaign performance metrics
**Why Required**: Measure campaign effectiveness
**Authentication**: Bearer token required

---

## 📊 Dashboard

### GET `/crystal/dashboard`

**Purpose**: Get dashboard overview data
**Why Required**: Display key metrics and insights
**Authentication**: Bearer token required

**Response**:

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalConversations": 150,
      "activeAutomations": 5,
      "totalProducts": 25,
      "aiResponses": 89
    },
    "recentActivity": [
      {
        "type": "NEW_CONVERSATION",
        "message": "New conversation with @customer1",
        "timestamp": "2025-08-21T11:10:11.912Z"
      }
    ],
    "performance": {
      "responseTime": "2.3s",
      "satisfactionRate": 0.92
    }
  }
}
```

### GET `/crystal/dashboard/analytics`

**Purpose**: Get detailed analytics
**Why Required**: Business intelligence and reporting
**Authentication**: Bearer token required

**Query Parameters**:

- `period` (string): Time period (day, week, month, year)
- `metric` (string): Specific metric to analyze

---

## 💳 Billing

### GET `/crystal/billing/plans`

**Purpose**: Get available subscription plans
**Why Required**: Display pricing options
**Authentication**: Bearer token required

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "basic",
      "name": "Basic Plan",
      "price": 9.99,
      "currency": "USD",
      "features": ["100 conversations/month", "5 automations"]
    },
    {
      "id": "pro",
      "name": "Pro Plan",
      "price": 29.99,
      "currency": "USD",
      "features": [
        "Unlimited conversations",
        "Unlimited automations",
        "AI responses"
      ]
    }
  ]
}
```

### GET `/crystal/billing/subscriptions`

**Purpose**: Get user's subscription status
**Why Required**: Check subscription and billing status
**Authentication**: Bearer token required

### POST `/crystal/billing/subscriptions`

**Purpose**: Create new subscription
**Why Required**: Upgrade/downgrade plans
**Authentication**: Bearer token required

**Payload**:

```json
{
  "planId": "pro",
  "paymentMethodId": "pm_1234567890"
}
```

### GET `/crystal/billing/invoices`

**Purpose**: Get billing history
**Why Required**: Financial records and receipts
**Authentication**: Bearer token required

### GET `/crystal/billing/usage`

**Purpose**: Get current usage metrics
**Why Required**: Monitor plan usage
**Authentication**: Bearer token required

---

## 👤 Account Management

### GET `/crystal/account/profile`

**Purpose**: Get user profile
**Why Required**: Display user information
**Authentication**: Bearer token required

### PUT `/crystal/account/profile`

**Purpose**: Update user profile
**Why Required**: Profile management
**Authentication**: Bearer token required

**Payload**:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "timezone": "America/New_York",
  "language": "en"
}
```

### PUT `/crystal/account/password`

**Purpose**: Change password
**Why Required**: Account security
**Authentication**: Bearer token required

**Payload**:

```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123"
}
```

### GET `/crystal/account/settings`

**Purpose**: Get account settings
**Why Required**: Display user preferences
**Authentication**: Bearer token required

### PUT `/crystal/account/settings`

**Purpose**: Update account settings
**Why Required**: Customize user experience
**Authentication**: Bearer token required

**Payload**:

```json
{
  "notifications": {
    "email": true,
    "push": false
  },
  "privacy": {
    "dataSharing": false
  }
}
```

### GET `/crystal/account/activity`

**Purpose**: Get account activity log
**Why Required**: Security monitoring
**Authentication**: Bearer token required

### DELETE `/crystal/account`

**Purpose**: Delete user account
**Why Required**: Account termination
**Authentication**: Bearer token required

### POST `/crystal/account/export-data`

**Purpose**: Export user data
**Why Required**: Data portability (GDPR compliance)
**Authentication**: Bearer token required

---

## 🔧 Admin (Nexus)

### GET `/nexus/admin/users`

**Purpose**: Get all users (admin only)
**Why Required**: User management and support
**Authentication**: Admin token required

**Query Parameters**:

- `page` (number): Page number
- `limit` (number): Items per page
- `role` (string): Filter by role
- `status` (string): Filter by status

### GET `/nexus/admin/users/:id`

**Purpose**: Get specific user details
**Why Required**: User support and management
**Authentication**: Admin token required

### PUT `/nexus/admin/users/:id`

**Purpose**: Update user (admin only)
**Why Required**: User management
**Authentication**: Admin token required

**Payload**:

```json
{
  "status": "SUSPENDED",
  "role": "USER"
}
```

### GET `/nexus/admin/metrics`

**Purpose**: Get system metrics
**Why Required**: System monitoring and health
**Authentication**: Admin token required

### GET `/nexus/admin/health`

**Purpose**: Get system health status
**Why Required**: System monitoring
**Authentication**: Admin token required

### POST `/nexus/admin/actions`

**Purpose**: Perform admin actions
**Why Required**: System administration
**Authentication**: Admin token required

**Payload**:

```json
{
  "action": "SEND_NOTIFICATION",
  "target": "all_users",
  "message": "System maintenance scheduled"
}
```

### GET `/nexus/admin/settings`

**Purpose**: Get platform settings
**Why Required**: System configuration
**Authentication**: Admin token required

### PUT `/nexus/admin/settings`

**Purpose**: Update platform settings
**Why Required**: System configuration
**Authentication**: Admin token required

---

## 🔗 Webhooks

### POST `/webhooks/instagram`

**Purpose**: Receive Instagram webhook events
**Why Required**: Real-time Instagram integration
**Authentication**: Webhook signature verification

**Headers**:

```
X-Hub-Signature-256: sha256=...
```

**Payload** (Instagram message):

```json
{
  "object": "instagram",
  "entry": [
    {
      "id": "123456789",
      "time": 1234567890,
      "messaging": [
        {
          "sender": { "id": "sender_id" },
          "recipient": { "id": "recipient_id" },
          "timestamp": 1234567890,
          "message": {
            "mid": "message_id",
            "text": "Hello!"
          }
        }
      ]
    }
  ]
}
```

### POST `/webhooks/stripe`

**Purpose**: Receive Stripe webhook events
**Why Required**: Payment processing integration
**Authentication**: Stripe signature verification

**Headers**:

```
Stripe-Signature: t=1234567890,v1=...
```

**Payload** (Stripe event):

```json
{
  "id": "evt_1234567890",
  "object": "event",
  "api_version": "2020-08-27",
  "created": 1234567890,
  "data": {
    "object": {
      "id": "sub_1234567890",
      "object": "subscription",
      "status": "active"
    }
  },
  "type": "customer.subscription.created"
}
```

---

## 🔐 Authentication Headers

For all protected endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📝 Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

Common HTTP Status Codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

## 🧪 Testing Tips

1. **Start with Health Check**: `GET /health`
2. **Register a User**: `POST /crystal/auth/signup`
3. **Login to Get Token**: `POST /crystal/auth/login`
4. **Use Token for Protected Routes**: Include in Authorization header
5. **Test Error Cases**: Invalid data, missing fields, wrong tokens
6. **Check Response Format**: Ensure consistent structure
7. **Verify Business Logic**: Test automation triggers, AI responses

## 📚 Additional Resources

- **Environment**: Development server runs on port 5513
- **Database**: MongoDB with Prisma ORM
- **Authentication**: JWT tokens with 7-day expiration
- **Rate Limiting**: 100 requests per 15 minutes
- **CORS**: Configured for localhost:3000 (frontend)
