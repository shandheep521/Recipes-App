const Recipe = require('../models/Recipe');
const ApiResponse = require('../utils/apiResponse');

/**
 * Recipe controller
 */
const recipeController = {
  /**
   * Create a new recipe
   * @route POST /api/recipes
   * @access Public
   */
  createRecipe: async (req, res, next) => {
    try {
      const recipe = await Recipe.create(req.body);
      return ApiResponse.success(res, 201, 'Recipe created successfully', recipe);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all recipes
   * @route GET /api/recipes
   * @access Public
   */
  getAllRecipes: async (req, res, next) => {
    try {
      // Implement filtering, sorting, and pagination
      const { cuisine, difficulty, tags, sortBy, limit = 10, page = 1 } = req.query;
      
      // Build query
      const query = {};
      if (cuisine) query.cuisine = cuisine;
      if (difficulty) query.difficulty = difficulty;
      if (tags) query.tags = { $in: tags.split(',') };

      // Sorting option
      const sort = {};
      if (sortBy) {
        const [field, order] = sortBy.split(':');
        sort[field] = order === 'desc' ? -1 : 1;
      } else {
        sort.createdAt = -1; // Default sort by latest
      }
      
      // Execute query
      const result = await Recipe.find(query, sort, limit, page);
      
      return ApiResponse.success(res, 200, 'Recipes retrieved successfully', {
        recipes: result.records,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get a recipe by ID
   * @route GET /api/recipes/:id
   * @access Public
   */
  getRecipeById: async (req, res, next) => {
    try {
      const recipe = await Recipe.findById(req.params.id);
      
      if (!recipe) {
        res.status(404);
        throw new Error('Recipe not found');
      }
      
      return ApiResponse.success(res, 200, 'Recipe retrieved successfully', recipe);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a recipe by ID
   * @route PUT /api/recipes/:id
   * @access Public
   */
  updateRecipe: async (req, res, next) => {
    try {
      const recipe = await Recipe.findById(req.params.id);
      
      if (!recipe) {
        res.status(404);
        throw new Error('Recipe not found');
      }
      
      const updatedRecipe = await Recipe.findByIdAndUpdate(
        req.params.id, 
        req.body,
        { runValidators: true }
      );
      
      return ApiResponse.success(res, 200, 'Recipe updated successfully', updatedRecipe);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a recipe by ID
   * @route DELETE /api/recipes/:id
   * @access Public
   */
  deleteRecipe: async (req, res, next) => {
    try {
      const recipe = await Recipe.findById(req.params.id);
      
      if (!recipe) {
        res.status(404);
        throw new Error('Recipe not found');
      }
      
      const deleted = await Recipe.findByIdAndDelete(req.params.id);
      
      if (!deleted) {
        res.status(500);
        throw new Error('Failed to delete recipe');
      }
      
      return ApiResponse.success(res, 200, 'Recipe deleted successfully', null);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = recipeController;
