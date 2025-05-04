const Recipe = require('../models/Recipe');
const ApiResponse = require('../utils/apiResponse');

/**
 * Controller for handling recipe operations
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

      // Pagination
      const skip = (page - 1) * limit;
      
      // Execute query
      const recipes = await Recipe.find(query)
        .sort(sort)
        .limit(parseInt(limit))
        .skip(skip);
      
      // Get total count for pagination info
      const totalRecipes = await Recipe.countDocuments(query);
      
      const pagination = {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalRecipes / limit),
        totalRecipes
      };

      return ApiResponse.success(res, 200, 'Recipes retrieved successfully', {
        recipes,
        pagination
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get a single recipe by ID
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
      let recipe = await Recipe.findById(req.params.id);
      
      if (!recipe) {
        res.status(404);
        throw new Error('Recipe not found');
      }
      
      recipe = await Recipe.findByIdAndUpdate(
        req.params.id, 
        req.body, 
        { new: true, runValidators: true }
      );
      
      return ApiResponse.success(res, 200, 'Recipe updated successfully', recipe);
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
      
      await recipe.deleteOne();
      
      return ApiResponse.success(res, 200, 'Recipe deleted successfully', null);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = recipeController;
