# Shop v1.2

A shopping cart application built with React, Vite, Tailwind CSS, and Node.js/Express.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4
- **Backend:** Node.js, Express
- **Routing:** React Router DOM
- **Auth:** JWT (accessToken 15m + refreshToken 7d) + bcrypt

## Features

- Product catalog with search and sort
- Pagination
- Cart with quantity management (per-user, persisted in localStorage)
- Cart dropdown in navbar
- Guest cart merges into user cart on login (without overwriting existing items)
- Checkout for both guests and logged-in users
- Orders history page
- User authentication (register / login / logout)
- OTP account verification on registration (default: `1234`)
- Forgot password flow: email → OTP → new password
- Refresh token — auto re-issue access token on expiry
- Protected routes (redirect to login if not authenticated)
- Toast notifications
- Swagger UI at `/api-docs`
- 404 page

## Project Structure

```
src/
├── api/
│   ├── auth.js            # Auth API calls
│   ├── client.js          # Base HTTP client with auto token refresh
│   └── orders.js          # Orders API calls
├── components/
│   ├── CartDropdown.jsx   # Navbar cart dropdown
│   ├── Navbar.jsx         # Navigation bar
│   ├── Pagination.jsx     # Pagination controls
│   ├── ProductList.jsx    # Product catalog
│   ├── ProtectedRoute.jsx # Route guard (requires auth)
│   └── SearchBar.jsx      # Search and sort controls
├── context/
│   ├── AuthContext.jsx    # Global auth state
│   └── CartContext.jsx    # Global cart state
├── hooks/
│   └── useProductFilter.js # Custom hook for search/sort/filter
├── pages/
│   ├── CartPage.jsx
│   ├── ChangePasswordPage.jsx
│   ├── CheckoutPage.jsx
│   ├── ForgotPage.jsx
│   ├── LoginPage.jsx
│   ├── NotFoundPage.jsx
│   ├── OrdersPage.jsx
│   ├── ProfilePage.jsx
│   ├── RegisterPage.jsx
│   ├── ShopPage.jsx
│   └── VerifyOtpPage.jsx
│   └── VerifyOtpForgotPage.jsx
├── routes/
│   └── index.jsx          # App routes
server/
├── index.js               # Express app setup + listen
├── config.js              # PORT, JWT secrets
├── db.js                  # In-memory storage
├── middleware/
│   └── requireAuth.js     # JWT auth middleware
├── routes/
│   ├── auth.js            # Auth endpoints
│   ├── orders.js          # Orders endpoints
│   └── users.js           # Users endpoints
├── utils/
│   └── tokens.js          # generateTokens helper
└── swagger.json           # OpenAPI docs
```

## Getting Started

Install dependencies:
```bash
npm install
```

Run both frontend and backend:
```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Swagger UI: http://localhost:3001/api-docs

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/verify-otp | Verify account OTP |
| POST | /api/auth/forgot | Request password reset OTP |
| POST | /api/auth/verify-otp-forgot | Verify password reset OTP |
| POST | /api/auth/change-password | Set new password |
| GET | /api/auth/me | Get current user |
| GET | /api/orders | Get user orders |
| POST | /api/orders | Create order |
| GET | /api/orders/:id | Get order by ID |

> **Note:** Backend uses in-memory storage — data resets on server restart.
