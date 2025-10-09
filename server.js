// server.js - Starter Express server for Week 2 assignment

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Custom Error Classes
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

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

// Custom middleware for request logging with timestamp
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Validation middleware for product creation and updates
const validateProduct = (req, res, next) => {
  try {
    const { name, description, price, category, inStock } = req.body;

    // Check required fields
    if (!name || !description || price === undefined || !category) {
      throw new ValidationError('Missing required fields: name, description, price, category are required');
    }

    // Validate data types
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new ValidationError('name must be a non-empty string');
    }

    if (typeof description !== 'string') {
      throw new ValidationError('description must be a string');
    }

    if (typeof price !== 'number' || price < 0) {
      throw new ValidationError('price must be a positive number');
    }

    if (typeof category !== 'string' || category.trim().length === 0) {
      throw new ValidationError('category must be a non-empty string');
    }

    if (inStock !== undefined && typeof inStock !== 'boolean') {
      throw new ValidationError('inStock must be a boolean');
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Authentication middleware - checks for API key in headers
const authenticateApiKey = (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    const expectedApiKey = process.env.API_KEY || 'your-secret-api-key';

    if (!apiKey) {
      throw new AuthenticationError('API key required in x-api-key header');
    }

    if (apiKey !== expectedApiKey) {
      throw new AuthenticationError('Invalid API key');
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Root route
// Root route (Hello World)
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Product API routes with proper middleware applied

// GET /api/products - Get all products (supports filtering, search, pagination)
app.get('/api/products', asyncHandler(async (req, res) => {
  // copy in-memory list and apply filters
  let results = products.slice();

  const { category, q, page = '1', limit = '10' } = req.query;

  // filter by category (exact match)
  if (category) {
    results = results.filter(p => String(p.category).toLowerCase() === String(category).toLowerCase());
  }

  // search by name (case-insensitive substring)
  if (q) {
    const qLower = String(q).toLowerCase();
    results = results.filter(p => String(p.name).toLowerCase().includes(qLower));
  }

  // pagination
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const total = results.length;
  const start = (pageNum - 1) * limitNum;
  const data = results.slice(start, start + limitNum);

  // Simulate async (e.g., DB query)
  await Promise.resolve();

  res.json({ page: pageNum, limit: limitNum, total, data });
}));

// GET /api/products/stats - product statistics (counts by category, totals)
app.get('/api/products/stats', asyncHandler(async (req, res) => {
  // Simulate async work
  await Promise.resolve();

  const total = products.length;
  const inStock = products.filter(p => p.inStock).length;
  const byCategory = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  res.json({ total, inStock, byCategory });
}));

// GET /api/products/:id - Get a specific product (no auth required for reading)
app.get('/api/products/:id', asyncHandler(async (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    throw new NotFoundError(`Product with id '${req.params.id}' not found`);
  }
  res.json(product);
}));

// POST /api/products - Create a new product (requires auth + validation)
app.post('/api/products', authenticateApiKey, validateProduct, asyncHandler(async (req, res) => {
  const { name, description, price, category, inStock = true } = req.body;

  const newProduct = {
    id: uuidv4(),
    name: name.trim(),
    description: description.trim(),
    price,
    category: category.trim(),
    inStock
  };

  // Simulate async operation (e.g., saving to database)
  await Promise.resolve();
  products.push(newProduct);

  res.status(201).json({
    message: 'Product created successfully',
    product: newProduct
  });
}));

// PUT /api/products/:id - Update a product (requires auth + validation)
app.put('/api/products/:id', authenticateApiKey, validateProduct, asyncHandler(async (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  if (productIndex === -1) {
    throw new NotFoundError(`Product with id '${req.params.id}' not found`);
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

  // Simulate async operation (e.g., updating database)
  await Promise.resolve();
  products[productIndex] = updatedProduct;

  res.json({
    message: 'Product updated successfully',
    product: updatedProduct
  });
}));

// DELETE /api/products/:id - Delete a product (requires auth)
app.delete('/api/products/:id', authenticateApiKey, asyncHandler(async (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  if (productIndex === -1) {
    throw new NotFoundError(`Product with id '${req.params.id}' not found`);
  }

  // Simulate async operation (e.g., deleting from database)
  await Promise.resolve();
  const deletedProduct = products.splice(productIndex, 1)[0];

  res.json({
    message: 'Product deleted successfully',
    product: deletedProduct
  });
}));

// Global error handling middleware
app.use((err, req, res, next) => {
  // Log error details for debugging
  console.error(`[${new Date().toISOString()}] Error:`, {
    name: err.name,
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  // Handle custom error classes
  if (err instanceof NotFoundError || err instanceof ValidationError || err instanceof AuthenticationError) {
    return res.status(err.statusCode).json({
      error: {
        name: err.name,
        message: err.message,
        statusCode: err.statusCode,
        timestamp: new Date().toISOString(),
        path: req.url,
        method: req.method
      }
    });
  }

  // Handle specific Express/Node.js errors
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: {
        name: 'ValidationError',
        message: 'Invalid ID format',
        statusCode: 400,
        timestamp: new Date().toISOString(),
        path: req.url,
        method: req.method
      }
    });
  }

  if (err.name === 'SyntaxError' && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: {
        name: 'ValidationError',
        message: 'Invalid JSON format in request body',
        statusCode: 400,
        timestamp: new Date().toISOString(),
        path: req.url,
        method: req.method
      }
    });
  }

  // Handle unexpected errors (500)
  res.status(500).json({
    error: {
      name: 'InternalServerError',
      message: process.env.NODE_ENV === 'production'
        ? 'Something went wrong on our end'
        : err.message,
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the app for testing purposes
module.exports = app; 