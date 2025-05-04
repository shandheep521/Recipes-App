const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

/**
 * @route   POST /api/recipes
 * @desc    Create a new recipe
 * @access  Public
 */
router.post('/', recipeController.createRecipe);

/**
 * @route   GET /api/recipes
 * @desc    Get all recipes
 * @access  Public
 */
router.get('/', recipeController.getAllRecipes);

/**
 * @route   GET /api/recipes/:id
 * @desc    Get a single recipe by ID
 * @access  Public
 */
router.get('/:id', recipeController.getRecipeById);

/**
 * @route   PUT /api/recipes/:id
 * @desc    Update a recipe by ID
 * @access  Public
 */
router.put('/:id', recipeController.updateRecipe);

/**
 * @route   DELETE /api/recipes/:id
 * @desc    Delete a recipe by ID
 * @access  Public
 */
router.delete('/:id', recipeController.deleteRecipe);

module.exports = router;
