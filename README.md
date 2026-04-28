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
- "Out of stock" button when product amount is 0
- "Only N left" warning when stock is low (≤ 5)
- Server-side cart with optimistic updates
- Cart stored in localStorage for guests, synced to server for logged-in users
- Guest cart merges into server cart on login
- New items added to top of cart
- Cart dropdown in navbar
- Checkout for both guests and logged-in users
- Price snapshot — warns if price changed since item was added to cart
- Orders history page
- User authentication (register / login / logout)
- OTP account verification on registration (default: `1234`)
- Forgot password flow: email → OTP → new password
- Refresh token — auto re-issue access token on expiry
- Protected routes (redirect to login if not authenticated)
- Toast notifications (max 1 at a time)
- Swagger UI at `/api-docs`
- 404 page
- File upload API (images converted to .webp, videos get a first-frame thumbnail)
- Products CRUD API (name, code, medias, price, amount)
- Product catalog is public (no auth required)
- All other non-auth endpoints require a valid access token

## Project Structure

```
src/
├── api/
│   ├── auth.js            # Auth API calls
│   ├── cart.js            # Cart API calls
│   ├── client.js          # Base HTTP client with auto token refresh
│   ├── orders.js          # Orders API calls
│   └── products.js        # Products API calls
├── components/
│   ├── Cart.jsx           # Cart item list
│   ├── CartDropdown.jsx   # Navbar cart dropdown
│   ├── Navbar.jsx         # Navigation bar
│   ├── Pagination.jsx     # Pagination controls
│   ├── ProductList.jsx    # Product catalog
│   ├── ProtectedRoute.jsx # Route guard (requires auth)
│   └── SearchBar.jsx      # Search and sort controls
├── context/
│   ├── AuthContext.jsx    # Global auth state
│   └── CartContext.jsx    # Global cart state with optimistic updates
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
│   ├── VerifyOtpPage.jsx
│   └── VerifyOtpForgotPage.jsx
├── routes/
│   └── index.jsx          # App routes
├── utils/
│   └── format.js          # formatPrice helper
server/
├── index.js               # Express app setup + listen
├── config.js              # PORT, JWT secrets
├── db.js                  # In-memory storage (seeded from products.js)
├── middleware/
│   └── requireAuth.js     # JWT auth middleware
├── routes/
│   ├── auth.js            # Auth endpoints
│   ├── carts.js           # Cart endpoints
│   ├── orders.js          # Orders endpoints
│   ├── products.js        # Products CRUD endpoints
│   ├── upload.js          # File upload endpoint
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
| POST | /api/upload | Upload image or video file |
| GET | /api/products | Get all products (public) |
| POST | /api/products | Create product |
| GET | /api/products/:id | Get product by ID (public) |
| PUT | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |
| GET | /api/cart | Get current user's cart |
| POST | /api/cart/items | Add item to cart |
| PUT | /api/cart/items/:productId | Update item quantity |
| DELETE | /api/cart/items/:productId | Remove item from cart |
| DELETE | /api/cart | Clear cart |
| GET | /api/users | Get all users (dev only) |

> **Note:** Backend uses in-memory storage — data resets on server restart.
> All endpoints except `/api/auth/*`, `GET /api/products`, and `GET /api/products/:id` require a valid access token.
