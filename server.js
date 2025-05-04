const dotenv = require('dotenv');
const app = require('./app');
const FileDB = require('./utils/fileDB');

// Load environment variables
dotenv.config();

// Set the port
const PORT = process.env.PORT || 5000;

// Connect to database and start server
const startServer = async () => {
  try {
    // Initialize file-based database
    await FileDB.init();
    console.log('File database initialized successfully');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
