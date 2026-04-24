import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const swaggerDocument = require('./swagger.json')
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const app = express()
const PORT = 3001
const JWT_SECRET = 'shop_secret_key'
const REFRESH_SECRET = 'shop_refresh_secret'

app.use(cors())
app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

/** In-memory storage — resets on server restart */
let users = []
let nextUserId = 1
let orders = []
let nextOrderId = 1
const refreshTokens = new Set()

/** Generates accessToken (15m) and refreshToken (7d) for a user */
function generateTokens(user) {
  const payload = { id: user.id, name: user.name, email: user.email }
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' })
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' })
  return { accessToken, refreshToken }
}

/**
 * Middleware that verifies JWT access token from Authorization header.
 * Attaches decoded user payload to req.user on success.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ error: 'Not authorized' })

  const token = header.split(' ')[1]
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' })
    }
    res.status(401).json({ error: 'Invalid token' })
  }
}

/**
 * POST /api/auth/register
 * Creates a new user account and returns access and refresh tokens.
 */
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already registered' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = { id: nextUserId++, name, email, password: hashedPassword }
  users.push(user)

  const { accessToken, refreshToken } = generateTokens(user)
  refreshTokens.add(refreshToken)

  res.status(201).json({
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email }
  })
})

/**
 * POST /api/auth/login
 * Validates credentials and returns access and refresh tokens.
 */
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  const user = users.find(u => u.email === email)
  if (!user) return res.status(400).json({ error: 'Invalid email or password' })

  const match = await bcrypt.compare(password, user.password)
  if (!match) return res.status(400).json({ error: 'Invalid email or password' })

  const { accessToken, refreshToken } = generateTokens(user)
  refreshTokens.add(refreshToken)

  res.json({
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email }
  })
})

/**
 * POST /api/auth/refresh
 * Validates refresh token and returns a new access token.
 */
app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    return res.status(401).json({ error: 'Invalid refresh token' })
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET)
    const accessToken = jwt.sign(
      { id: decoded.id, name: decoded.name, email: decoded.email },
      JWT_SECRET,
      { expiresIn: '15m' }
    )
    res.json({ accessToken })
  } catch {
    refreshTokens.delete(refreshToken)
    res.status(401).json({ error: 'Refresh token expired, please login again' })
  }
})

/**
 * POST /api/auth/logout
 * Removes refresh token from the server, invalidating the session.
 */
app.post('/api/auth/logout', (req, res) => {
  const { refreshToken } = req.body
  refreshTokens.delete(refreshToken)
  res.json({ message: 'Logged out' })
})

/**
 * GET /api/auth/me
 * Returns the current user decoded from the JWT token.
 */
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json(req.user)
})

/**
 * GET /api/users
 * Returns all users without passwords. For development use only.
 */
app.get('/api/users', (req, res) => {
  const safeUsers = users.map(({ password, ...rest }) => rest)
  res.json(safeUsers)
})

/**
 * GET /api/orders
 * Returns orders for the authenticated user, or an empty array for guests.
 */
app.get('/api/orders', (req, res) => {
  const header = req.headers.authorization
  if (!header) return res.json([])

  try {
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    const userOrders = orders.filter(o => o.userId === decoded.id)
    res.json(userOrders)
  } catch {
    res.json([])
  }
})

/**
 * POST /api/orders
 * Creates a new order. Works for both authenticated users and guests.
 */
app.post('/api/orders', (req, res) => {
  const { name, email, address, items, totalPrice } = req.body

  const header = req.headers.authorization
  let userId = null
  let userName = name
  let userEmail = email

  if (header) {
    try {
      const token = header.split(' ')[1]
      const decoded = jwt.verify(token, JWT_SECRET)
      userId = decoded.id
      userName = decoded.name
      userEmail = decoded.email
    } catch {}
  }

  if (!userName || !userEmail || !address || !items || items.length === 0) {
    return res.status(400).json({ error: 'Please fill in all fields and add items to cart' })
  }

  const order = {
    id: nextOrderId++,
    userId,
    name: userName,
    email: userEmail,
    address,
    items,
    totalPrice,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  }

  orders.push(order)
  res.status(201).json(order)
})

/**
 * GET /api/orders/:id
 * Returns a single order by ID. Only accessible by the order owner.
 */
app.get('/api/orders/:id', requireAuth, (req, res) => {
  const order = orders.find(o => o.id === Number(req.params.id))
  if (!order) return res.status(404).json({ error: 'Order not found' })
  if (order.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' })
  res.json(order)
})

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`)
})
