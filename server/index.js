import express from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const app = express()
const PORT = 3001
const JWT_SECRET = 'shop_secret_key'

app.use(cors())
app.use(express.json())

// data storage (in-memory)
let users = []
let nextUserId = 1
let orders = []
let nextOrderId = 1

// middleware — verify JWT token
function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ error: 'Not authorized' })

  const token = header.split(' ')[1]
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// POST /api/auth/register
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

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } })
})

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  const user = users.find(u => u.email === email)
  if (!user) return res.status(400).json({ error: 'Invalid email or password' })

  const match = await bcrypt.compare(password, user.password)
  if (!match) return res.status(400).json({ error: 'Invalid email or password' })

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
})

// GET /api/auth/me — get current user from token
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json(req.user)
})

// GET /api/users — list all users (dev only)
app.get('/api/users', (req, res) => {
  const safeUsers = users.map(({ password, ...rest }) => rest)
  res.json(safeUsers)
})


// GET /api/orders — returns user's orders if logged in, empty array for guests
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

// POST /api/orders — create order (works for both logged in and guest users)
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

// GET /api/orders/:id — get order by ID (only owner)
app.get('/api/orders/:id', requireAuth, (req, res) => {
  const order = orders.find(o => o.id === Number(req.params.id))
  if (!order) return res.status(404).json({ error: 'Order not found' })
  if (order.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' })
  res.json(order)
})

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`)
})
