# Practice Shop V1

A shopping cart application built with React, Vite, Tailwind CSS, and Node.js/Express.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4
- **Backend:** Node.js, Express
- **Routing:** React Router DOM

## Features

- Product catalog
- Cart with quantity management
- Cart dropdown in navbar
- Full cart page
- Checkout with name, email, delivery address
- Orders history page
- REST API (Express)

## Project Structure

```
src/
├── api/
│   ├── client.js         # Base HTTP client
│   └── orders.js         # Orders API calls
├── components/
│   ├── Cart.jsx           # Full cart component
│   ├── CartDropdown.jsx   # Navbar cart dropdown
│   ├── Navbar.jsx         # Navigation bar
│   └── ProductList.jsx    # Product catalog
├── context/
│   └── CartContext.jsx    # Global cart state
├── pages/
│   ├── CartPage.jsx
│   ├── CheckoutPage.jsx
│   ├── OrdersPage.jsx
│   └── ShopPage.jsx
├── routes/
│   └── index.jsx          # App routes
server/
└── index.js               # Express API server
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
| GET | /api/orders | Get all orders |
| POST | /api/orders | Create new order |
| GET | /api/orders/:id | Get order by ID |
