// server.js - Starter Express server for Week 2 assignment

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.json());

// Sample in-memory products database
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  }
];

// Root route
// Root route (Hello World)
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Product API routes with proper middleware applied

// GET /api/products - Get all products (no auth required for reading)
app.get('/api/products', (req, res) => {
  res.json(products);
});

// GET /api/products/:id - Get a specific product (no auth required for reading)
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// POST /api/products - Create a new product (requires auth + validation)
app.post('/api/products', authenticateApiKey, validateProduct, (req, res) => {
  const { name, description, price, category, inStock = true } = req.body;

  const newProduct = {
    id: uuidv4(),
    name: name.trim(),
    description: description.trim(),
    price,
    category: category.trim(),
    inStock
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id - Update a product (requires auth + validation)
app.put('/api/products/:id', authenticateApiKey, validateProduct, (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const { name, description, price, category, inStock = true } = req.body;

  const updatedProduct = {
    id: req.params.id,
    name: name.trim(),
    description: description.trim(),
    price,
    category: category.trim(),
    inStock
  };

  products[productIndex] = updatedProduct;
  res.json(updatedProduct);
});

// DELETE /api/products/:id - Delete a product (requires auth)
app.delete('/api/products/:id', authenticateApiKey, (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const deletedProduct = products.splice(productIndex, 1)[0];
  res.json({ message: 'Product deleted successfully', product: deletedProduct });
});

// Custom middleware for request logging with timestamp
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Validation middleware for product creation and updates
const validateProduct = (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;

  // Check required fields
  if (!name || !description || price === undefined || !category) {
    return res.status(400).json({
      error: 'Missing required fields: name, description, price, category are required'
    });
  }

  // Validate data types
  if (typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'name must be a non-empty string' });
  }

  if (typeof description !== 'string') {
    return res.status(400).json({ error: 'description must be a string' });
  }

  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({ error: 'price must be a positive number' });
  }

  if (typeof category !== 'string' || category.trim().length === 0) {
    return res.status(400).json({ error: 'category must be a non-empty string' });
  }

  if (inStock !== undefined && typeof inStock !== 'boolean') {
    return res.status(400).json({ error: 'inStock must be a boolean' });
  }

  next();
};

// Authentication middleware - checks for API key in headers
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const expectedApiKey = process.env.API_KEY || 'your-secret-api-key';

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required in x-api-key header' });
  }

  if (apiKey !== expectedApiKey) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  next();
};

// - Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the app for testing purposes
module.exports = app; 