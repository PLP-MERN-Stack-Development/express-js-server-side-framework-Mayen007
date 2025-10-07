const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Product = require('../models/Products');

// List all products
router.get("/products", async (req, res) => {
  try {
    // Fetch all products from the database
    const products = await Product.find();
    // Return the list of products as JSON
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Get a specific product by ID
router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    // Return the found product as JSON
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// `POST /api/products`: Create a new product
router.post("/products", async (req, res) => {
  const { name, description, price, category, inStock } = req.body;

  // Validate the request body
  if (!name || !description || !price || !category || inStock === undefined) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Create a new product
    const newProduct = new Product({
      id: uuidv4(),
      name,
      description,
      price,
      category,
      inStock
    });

    // Save the product to the database
    await newProduct.save();

    // Return the created product as JSON
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// `PUT /api/products/:id`: Update an existing product
router.put("/products/:id", async (req, res) => {
  const { name, description, price, category, inStock } = req.body;

  // Validate the request body
  if (!name || !description || !price || !category || inStock === undefined) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Find the product by ID
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update the product fields
    product.name = name;
    product.description = description;
    product.price = price;
    product.category = category;
    product.inStock = inStock;

    // Save the updated product to the database
    await product.save();

    // Return the updated product as JSON
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// `DELETE /api/products/:id`: Delete a product
router.delete("/products/:id", async (req, res) => {
  try {
    // Find the product by ID
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete the product from the database
    await product.remove();

    // Return a success message
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Export the router
module.exports = router;