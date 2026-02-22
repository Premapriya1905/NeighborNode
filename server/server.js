import dotenv from 'dotenv';
dotenv.config(); // MUST be immediately after import

import app from './src/app.js';
import connectDB from './src/config/database.js';

// Connect to database
connectDB();

// Get PORT from environment
const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`
                                       
    🏘️  NeighborNode API Server       
                                       
    Environment: ${process.env.NODE_ENV || 'development'}           
    Port: ${PORT}                         
    URL: http://localhost:${PORT}          
                                      
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

export default server;
