const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Path to the JSON database file
const DB_PATH = path.join(__dirname, '../data/recipes.json');

/**
 * Simple file-based database implementation
 */
class FileDB {
  /**
   * Initialize the database
   */
  static async init() {
    try {
      // Check if the data directory exists, if not create it
      const dataDir = path.join(__dirname, '../data');
      try {
        await fs.access(dataDir);
      } catch (err) {
        await fs.mkdir(dataDir, { recursive: true });
      }

      // Check if the file exists, if not create it with empty array
      try {
        await fs.access(DB_PATH);
      } catch (err) {
        await fs.writeFile(DB_PATH, JSON.stringify([], null, 2));
      }

      console.log('File DB initialized successfully');
    } catch (error) {
      console.error(`Error initializing file DB: ${error.message}`);
      throw error;
    }
  }

  /**
   * Read all data from the database
   * @returns {Array} All records
   */
  static async readAll() {
    try {
      const data = await fs.readFile(DB_PATH, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading from DB: ${error.message}`);
      throw error;
    }
  }

  /**
   * Write data to the database
   * @param {Array} data - Data to write
   */
  static async writeAll(data) {
    try {
      await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error writing to DB: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find a record by ID
   * @param {String} id - Record ID
   * @returns {Object|null} Found record or null
   */
  static async findById(id) {
    try {
      const data = await this.readAll();
      return data.find(item => item._id === id) || null;
    } catch (error) {
      console.error(`Error finding by ID: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a new record
   * @param {Object} record - Record to create
   * @returns {Object} Created record
   */
  static async create(record) {
    try {
      const data = await this.readAll();
      const newRecord = { 
        ...record, 
        _id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      data.push(newRecord);
      await this.writeAll(data);
      return newRecord;
    } catch (error) {
      console.error(`Error creating record: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update a record
   * @param {String} id - Record ID
   * @param {Object} updates - Fields to update
   * @returns {Object|null} Updated record or null if not found
   */
  static async findByIdAndUpdate(id, updates) {
    try {
      const data = await this.readAll();
      const index = data.findIndex(item => item._id === id);
      
      if (index === -1) return null;
      
      const updatedRecord = { 
        ...data[index], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };
      
      data[index] = updatedRecord;
      await this.writeAll(data);
      return updatedRecord;
    } catch (error) {
      console.error(`Error updating record: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a record
   * @param {String} id - Record ID
   * @returns {Boolean} True if deleted, false if not found
   */
  static async findByIdAndDelete(id) {
    try {
      const data = await this.readAll();
      const initialLength = data.length;
      const filteredData = data.filter(item => item._id !== id);
      
      if (filteredData.length === initialLength) return false;
      
      await this.writeAll(filteredData);
      return true;
    } catch (error) {
      console.error(`Error deleting record: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find records with filtering and sorting
   * @param {Object} query - Query object for filtering
   * @param {Object} options - Options for sorting and pagination
   * @returns {Object} Object with records and pagination info
   */
  static async find(query = {}, options = {}) {
    try {
      let data = await this.readAll();
      
      // Apply filtering
      if (query.cuisine) {
        data = data.filter(item => item.cuisine === query.cuisine);
      }
      
      if (query.difficulty) {
        data = data.filter(item => item.difficulty === query.difficulty);
      }
      
      if (query.tags && query.tags.$in) {
        data = data.filter(item => 
          item.tags && item.tags.some(tag => query.tags.$in.includes(tag))
        );
      }
      
      // Count total before pagination
      const totalRecords = data.length;
      
      // Apply sorting
      if (options.sort) {
        const [field, order] = Object.entries(options.sort)[0];
        data.sort((a, b) => {
          if (a[field] < b[field]) return order === -1 ? 1 : -1;
          if (a[field] > b[field]) return order === -1 ? -1 : 1;
          return 0;
        });
      }
      
      // Apply pagination
      const page = options.page || 1;
      const limit = options.limit || 10;
      const skip = (page - 1) * limit;
      
      const paginatedData = data.slice(skip, skip + limit);
      
      return {
        records: paginatedData,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalRecords / limit),
          totalRecords
        }
      };
    } catch (error) {
      console.error(`Error finding records: ${error.message}`);
      throw error;
    }
  }
}

module.exports = FileDB;
