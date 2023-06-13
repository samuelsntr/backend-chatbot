const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

// Create a MySQL connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "thriftshop",
  port: 8889,
});

// Connect to the MySQL database
connection.connect((error) => {
  if (error) {
    console.error("Error connecting to the database: ", error);
  } else {
    console.log("Connected to the database");
  }
});

const app = express();
app.use(bodyParser.json());

// Create a product
app.post("/products", (req, res) => {
  const { name, description, price, quantity } = req.body;

  connection.query(
    "INSERT INTO products (name, description, price, quantity) VALUES (?, ?, ?, ?)",
    [name, description, price, quantity],
    (error, results) => {
      if (error) {
        console.error("Error creating product: ", error);
        res.status(500).json({ error: "Failed to create product" });
      } else {
        res.status(201).json({ message: "Product created successfully" });
      }
    }
  );
});

// Get all products / by its name
app.get("/products", (req, res) => {
  const { name } = req.query;
  const enteredName = `%${name}%`;
  if (!name) {
    connection.query("SELECT * FROM products", (error, results) => {
      if (error) {
        console.error("Error retrieving products: ", error);
        res.status(500).json({ error: "Failed to retrieve products" });
      } else {
        res.status(200).json(results);
      }
    });
  } else {
    connection.query(
      "SELECT * FROM products WHERE name LIKE ?",
      enteredName,
      (error, results) => {
        if (error) {
          console.error("Error searching products: ", error);
          res.status(500).json({ error: "Failed to search products" });
        } else {
          res.status(200).json(results);
        }
      }
    );
  }
});

// Get a product by ID
app.get("/products/:id", (req, res) => {
  const productId = req.params.id;

  connection.query(
    "SELECT * FROM products WHERE id = ?",
    [productId],
    (error, results) => {
      if (error) {
        console.error("Error retrieving product: ", error);
        res.status(500).json({ error: "Failed to retrieve product" });
      } else if (results.length === 0) {
        res.status(404).json({ error: "Product not found" });
      } else {
        res.status(200).json(results[0]);
      }
    }
  );
});

// Update a product
app.put("/products/:id", (req, res) => {
  const productId = req.params.id;
  const { name, description, price, quantity } = req.body;

  connection.query(
    "UPDATE products SET name = ?, description = ?, price = ?, quantity = ? WHERE id = ?",
    [name, description, price, quantity, productId],
    (error, results) => {
      if (error) {
        console.error("Error updating product: ", error);
        res.status(500).json({ error: "Failed to update product" });
      } else if (results.affectedRows === 0) {
        res.status(404).json({ error: "Product not found" });
      } else {
        res.status(200).json({ message: "Product updated successfully" });
      }
    }
  );
});

// Delete a product
app.delete("/products/:id", (req, res) => {
  const productId = req.params.id;

  connection.query(
    "DELETE FROM products WHERE id = ?",
    [productId],
    (error, results) => {
      if (error) {
        console.error("Error deleting product: ", error);
        res.status(500).json({ error: "Failed to delete product" });
      } else if (results.affectedRows === 0) {
        res.status(404).json({ error: "Product not found" });
      } else {
        res.status(200).json({ message: "Product deleted successfully" });
      }
    }
  );
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
