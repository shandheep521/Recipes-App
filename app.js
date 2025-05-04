const express = require('express');
const cors = require('cors');
const recipeRoutes = require('./routes/recipeRoutes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/recipes', recipeRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.send('Welcome to the Recipe Manager API! Use /api/recipes to access the recipes endpoint.');
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
