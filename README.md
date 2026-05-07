# Shop v1.2

A shopping cart application built with React, Vite, Tailwind CSS, and Node.js/Express.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4
- **Backend:** Node.js, Express
- **Routing:** React Router DOM
- **Auth:** JWT (accessToken 15m + refreshToken 7d) + bcrypt
- **Payments:** Stripe Checkout (sandbox)
- **Real-time:** Socket.io (WebSocket)

## Features

**Catalog**
- Product listing with search, sort, and pagination
- Out of stock indicator and low stock warning (≤ 5 items left)

**Cart**
- Persistent cart: localStorage for guests, server-side for authenticated users
- Guest cart merges into user cart on login
- Optimistic UI updates with rollback on error
- Cart dropdown in navbar, limited to 10 unique items
- Out of stock label for unavailable or deleted products
- Deleted products automatically removed from all carts

**Checkout & Orders**
- Checkout for both guests and logged-in users
- Price snapshot with warning if price changed since item was added
- Server-side price recalculation — client value is ignored
- Stock validation before order creation
- Pay Now (Stripe redirect) or Pay Later within 7 days — authenticated users only
- Real-time order status update via WebSocket after payment
- Orders history page

**Auth**
- Register / login / logout
- OTP verification on registration (default: `1234`)
- Forgot password flow: email → OTP → new password
- JWT access token (15m) + refresh token (7d)
- Protected routes

**Security**
- Rate limiting: 100 requests per 15 minutes per IP
- Input validation on auth, orders, and cart endpoints
- JWT verification on Socket.io connection
- Secrets managed via `.env` with startup validation

**Other**
- File upload: up to 10 files at once, images converted to .webp, videos get a thumbnail
- Products CRUD API
- Swagger UI at `/api-docs`
- Toast notifications

## Project Structure

```
src/
├── api/
│   ├── auth.js            # Auth API calls
│   ├── cart.js            # Cart API calls
│   ├── client.js          # Base HTTP client with auto token refresh
│   ├── orders.js          # Orders API calls
│   ├── payments.js        # Payments API calls
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
├── config.js              # PORT, JWT secrets, Stripe keys
├── db.js                  # In-memory storage (seeded from products.js)
├── socket.js              # Socket.io initialization
├── middleware/
│   └── requireAuth.js     # JWT auth middleware
├── routes/
│   ├── auth.js            # Auth endpoints
│   ├── carts.js           # Cart endpoints
│   ├── media.js           # File upload endpoint
│   ├── orders.js          # Orders endpoints
│   ├── payments.js        # Stripe payment endpoints
│   ├── products.js        # Products CRUD endpoints
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
| POST | /api/media | Upload image or video file |
| POST | /api/payments/create-session | Create Stripe Checkout session |
| POST | /api/payments/webhook | Receive Stripe webhook events |
| GET | /api/products | Get all products (public) |
| POST | /api/products | Create product |
| GET | /api/products/:id | Get product by ID (public) |
| PUT | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |
| GET | /api/cart | Get current user's cart |
| POST | /api/cart/items | Add item to cart |
| PUT | /api/cart/items/:productId | Update item quantity |
| DELETE | /api/cart/items/:productId | Remove item from cart |
| POST | /api/cart/merge | Merge guest cart into user cart |
| DELETE | /api/cart | Clear cart |
| GET | /api/users | Get all users (dev only) |

> **Note:** Backend uses in-memory storage — data resets on server restart.
> All endpoints except `/api/auth/*`, `GET /api/products`, and `GET /api/products/:id` require a valid access token.
> For Stripe webhooks to work locally, run `ngrok http 3001` and add the public URL as a webhook endpoint in the Stripe dashboard.
