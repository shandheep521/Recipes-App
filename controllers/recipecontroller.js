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
      
      const deleted = await FileDB.findByIdAndDelete(req.params.id);
      
      if (!deleted) {
        res.status(500);
        throw new Error('Failed to delete recipe');
      }
      
      return ApiResponse.success(res, 200, 'Recipe deleted successfully', null);
    } catch (error) {
      next(error);
    }
  }
