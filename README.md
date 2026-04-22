# Shop v1.2

A shopping cart application built with React, Vite, Tailwind CSS, and Node.js/Express.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4
- **Backend:** Node.js, Express
- **Routing:** React Router DOM
- **Auth:** JWT + bcrypt

## Features

- Product catalog with search and sort
- Cart with quantity management (per-user, persisted in localStorage)
- Cart dropdown in navbar
- Guest cart merges into user cart on login (without overwriting existing items)
- Checkout for both guests and logged-in users
- Orders history page
- User authentication (register / login / logout)
- Protected routes (redirect to login if not authenticated)
- Toast notifications
- 404 page

## Project Structure

```
src/
├── api/
│   ├── auth.js            # Auth API calls
│   ├── client.js          # Base HTTP client
│   └── orders.js          # Orders API calls
├── components/
│   ├── CartDropdown.jsx   # Navbar cart dropdown
│   ├── Navbar.jsx         # Navigation bar
│   ├── ProductList.jsx    # Product catalog
│   ├── ProtectedRoute.jsx # Route guard (requires auth)
│   └── SearchBar.jsx      # Search and sort controls
├── context/
│   ├── AuthContext.jsx    # Global auth state
│   └── CartContext.jsx    # Global cart state
├── pages/
│   ├── CartPage.jsx
│   ├── CheckoutPage.jsx
│   ├── LoginPage.jsx
│   ├── NotFoundPage.jsx
│   ├── OrdersPage.jsx
│   ├── ProfilePage.jsx
│   ├── RegisterPage.jsx
│   └── ShopPage.jsx
├── routes/
│   └── index.jsx          # App routes
server/
└── index.js               # Express API server (in-memory storage)
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

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/orders | Get user orders |
| POST | /api/orders | Create order |
| GET | /api/orders/:id | Get order by ID |

> **Note:** Backend uses in-memory storage — data resets on server restart.
