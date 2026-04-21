import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// data storage (in-memory)
let orders = []
let nextId = 1

// GET /api/orders — list all orders
app.get('/api/orders', (req, res) => {
  res.json(orders)
})

// POST /api/orders — create new order
app.post('/api/orders', (req, res) => {
  const { name, email, address, items, totalPrice } = req.body

  if (!name || !email || !address || !items || items.length === 0) {
    return res.status(400).json({ error: 'Please fill in all fields and add items to cart' })
  }

  const order = {
    id: nextId++,
    name,
    email,
    address,
    items,
    totalPrice,
    status: 'Accepted',
    createdAt: new Date().toISOString(),
  }

  orders.push(order)
  res.status(201).json(order)
})

// GET /api/orders/:id — get order by ID
app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === Number(req.params.id))
  if (!order) return res.status(404).json({ error: 'Order not found' })
  res.json(order)
})

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`)
})
