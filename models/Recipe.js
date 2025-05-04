const FileDB = require('../utils/fileDB');
const { v4: uuidv4 } = require('uuid');

/**
 * Recipe model for file-based storage
 */
class Recipe {
  /**
   * Validate recipe data
   * @param {Object} data - Recipe data
   * @throws {Error} Validation error
   */
  static validate(data) {
    const errors = [];

    // Required fields
    if (!data.title) errors.push('Recipe title is required');
    if (!data.description) errors.push('Recipe description is required');
    if (!data.instructions) errors.push('Cooking instructions are required');
    if (!data.cookingTime) errors.push('Cooking time is required');
    if (!data.difficulty) errors.push('Difficulty level is required');
    if (!data.servings) errors.push('Number of servings is required');

    // Validate difficulty enum
    if (data.difficulty && !['Easy', 'Medium', 'Hard'].includes(data.difficulty)) {
      errors.push('Difficulty must be Easy, Medium, or Hard');
    }

    // Validate ingredients
    if (data.ingredients) {
      data.ingredients.forEach((ingredient, index) => {
        if (!ingredient.name) errors.push(`Recipe ingredients.${index}.name is required`);
        if (!ingredient.quantity) errors.push(`Recipe ingredients.${index}.quantity is required`);
      });
    } else {
      errors.push('Ingredients are required');
    }

    if (errors.length > 0) {
      const error = new Error('Validation Error');
      error.name = 'ValidationError';
      error.errors = errors;
      throw error;
    }
  }

  /**
   * Create a new recipe
   * @param {Object} recipeData - Recipe data
   * @returns {Object} Created recipe
   */
  static async create(recipeData) {
    this.validate(recipeData);
    return FileDB.create(recipeData);
  }

  /**
   * Find all recipes with filtering
   * @param {Object} query - Filter criteria
   * @param {Object} sort - Sort options
   * @param {Number} limit - Number of recipes per page
   * @param {Number} page - Page number
   * @returns {Object} Recipes with pagination info
   */
  static async find(query, sort, limit, page) {
    return FileDB.find(query, { 
      sort,
      limit: parseInt(limit) || 10,
      page: parseInt(page) || 1
    });
  }

  /**
   * Count documents
   * @param {Object} query - Query for counting
   * @returns {Number} Count of matching documents
   */
  static async countDocuments(query) {
    const data = await FileDB.readAll();
    let count = data.length;
    
    // Apply filtering
    if (query.cuisine) {
      count = data.filter(item => item.cuisine === query.cuisine).length;
    }
    
    if (query.difficulty) {
      count = data.filter(item => item.difficulty === query.difficulty).length;
    }
    
    if (query.tags && query.tags.$in) {
      count = data.filter(item => 
        item.tags && item.tags.some(tag => query.tags.$in.includes(tag))
      ).length;
    }
    
    return count;
  }

  /**
   * Find recipe by ID
   * @param {String} id - Recipe ID
   * @returns {Object|null} Recipe or null if not found
   */
  static async findById(id) {
    return FileDB.findById(id);
  }

  /**
   * Update recipe by ID
   * @param {String} id - Recipe ID
   * @param {Object} updateData - Data to update
   * @param {Object} options - Options
   * @returns {Object|null} Updated recipe or null
   */
  static async findByIdAndUpdate(id, updateData, options = {}) {
    const recipe = await this.findById(id);
    if (!recipe) return null;
    
    if (options.runValidators) {
      this.validate({ ...recipe, ...updateData });
    }
    
    return FileDB.findByIdAndUpdate(id, updateData);
  }

  /**
   * Delete one recipe method for compatibility
   */
  static async deleteOne() {
    return { acknowledged: true, deletedCount: 1 };
  }
}

module.exports = Recipe;
