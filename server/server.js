// server.js - Main server file for the Personal Notes Blog application

// Import colors for console output
import colors from 'colors';

// Enable debug logging
const debug = (message, ...args) => {
  console.log(`[DEBUG] ${message}`, ...args);
};

// Safe error logging that works with or without colors
const logError = (message, error = null) => {
  try {
    // Try to use colors if available
    if (colors.red && colors.bold) {
      console.error(colors.red(colors.bold(message)));
    } else {
      console.error(`ERROR: ${message}`);
    }
    if (error) console.error(error);
  } catch (e) {
    // Fallback if colors throws an error
    console.error(`ERROR: ${message}`, error);
  }
};

// Log uncaught exceptions and unhandled rejections
process.on('uncaughtException', (err) => {
  logError('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logError('UNHANDLED REJECTION! 💥 Shutting down...', err);
  process.exit(1);
});

debug('Starting server initialization...');

// Import required modules
debug('Importing required modules...');
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import errorHandler from './middleware/error.js';

debug('All modules imported successfully');

// Get __dirname equivalent in ES modules
debug('Setting up __dirname...');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
debug('__dirname set to:', __dirname);

// Load environment variables
try {
  debug('Loading environment variables...');
  dotenv.config({ path: './config/config.env' });
  debug('Environment variables loaded');
} catch (err) {
  console.error('Error loading environment variables:'.red, err);
  process.exit(1);
}

// Import routes
debug('Importing routes...');
let authRoutes, postRoutes, categoryRoutes;
try {
  authRoutes = (await import('./routes/auth.js')).default;
  postRoutes = (await import('./routes/posts.js')).default;
  categoryRoutes = (await import('./routes/categories.js')).default;
  debug('Routes imported successfully');
} catch (err) {
  console.error('Error importing routes:'.red, err);
  process.exit(1);
}

// Initialize Express app
debug('Initializing Express app...');
const app = express();
const PORT = process.env.PORT || 5000;
debug(`Express app initialized, PORT=${PORT}`);

// Set static folder
debug('Setting up static folder...');
const publicPath = path.join(__dirname, 'public');
debug('Public path:', publicPath);
app.use(express.static(publicPath));
debug('Static folder set up');

// Body parser
debug('Setting up body parser...');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
debug('Body parser set up');

// Cookie parser
debug('Setting up cookie parser...');
app.use(cookieParser());
debug('Cookie parser set up');

// Sanitize data
debug('Setting up data sanitization...');
try {
  app.use(mongoSanitize());
  debug('Data sanitization set up');
} catch (err) {
  console.error('Error setting up data sanitization:'.red, err);
  process.exit(1);
}

// Set security headers
debug('Setting up security headers...');
try {
  app.use(helmet());
  debug('Security headers set up');
} catch (err) {
  console.error('Error setting up security headers:'.red, err);
  process.exit(1);
}

// Prevent XSS attacks
debug('Setting up XSS protection...');
try {
  app.use(xss());
  debug('XSS protection set up');
} catch (err) {
  console.error('Error setting up XSS protection:'.red, err);
  process.exit(1);
}

// Rate limiting
debug('Setting up rate limiting...');
try {
  const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use(limiter);
  debug('Rate limiting set up');
} catch (err) {
  console.error('Error setting up rate limiting:'.red, err);
  process.exit(1);
}

// Prevent http param pollution
debug('Setting up HPP...');
try {
  app.use(hpp());
  debug('HPP set up');
} catch (err) {
  console.error('Error setting up HPP:'.red, err);
  process.exit(1);
}

// Enable CORS
debug('Setting up CORS...');
try {
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }));
  debug('CORS set up');
} catch (err) {
  console.error('Error setting up CORS:'.red, err);
  process.exit(1);
}

// Mount routers
debug('Mounting routes...');
try {
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/posts', postRoutes);
  app.use('/api/v1/categories', categoryRoutes);
  debug('Routes mounted');
} catch (err) {
  console.error('Error mounting routes:'.red, err);
  process.exit(1);
}

// Error handling middleware
debug('Setting up error handler...');
try {
  app.use(errorHandler);
  debug('Error handler set up');
} catch (err) {
  console.error('Error setting up error handler:'.red, err);
  process.exit(1);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...'.red.bold);
  console.error('Error:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...'.red.bold);
  console.error('Error:', err);
  process.exit(1);
});

// Connect to database and start server
const startServer = async () => {
  debug('Starting server initialization...');
  
  try {
    // Connect to MongoDB
    debug('Connecting to MongoDB...');
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000, // 5 second timeout for initial connection
      });
      debug('MongoDB connected successfully');
    } catch (dbError) {
      logError('MongoDB connection error:', dbError);
      throw dbError;
    }
    
    // Start the HTTP server
    debug('Starting HTTP server...');
    return new Promise((resolve, reject) => {
      const server = app.listen(PORT, () => {
        console.log(`\n${'='.repeat(60)}`.green);
        console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`.yellow.bold);
        console.log('📚 Available routes:'.green);
        console.log(`- POST /api/v1/auth/register`.green);
        console.log(`- POST /api/v1/auth/login`.green);
        console.log(`- GET /api/v1/posts`.green);
        console.log(`- POST /api/v1/posts`.green);
        console.log(`- GET /api/v1/categories`.green);
        console.log(`- POST /api/v1/categories`.green);
        console.log(`${'='.repeat(60)}\n`.green);
        debug('HTTP server started successfully');
        resolve(server);
      });
      
      // Handle server errors
      server.on('error', (serverError) => {
        logError('Server error:', serverError);
        reject(serverError);
      });
    });
  } catch (err) {
    logError('\n❌ Server startup failed:', err);
    process.exit(1);
  }
};

// Start the application
let server;

// Handle graceful shutdown
const shutdown = async (signal) => {
  debug(`\n${signal} received: shutting down gracefully...`);
  
  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      debug('HTTP server closed');
    }
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      debug('MongoDB connection closed');
    }
    
    debug('Shutdown complete');
    process.exit(0);
  } catch (err) {
    logError('Error during shutdown:', err);
    process.exit(1);
  }
};

// Handle termination signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start the server
(async () => {
  try {
    debug('Starting application...');
    server = await startServer();
    
    // Log uncaught exceptions and unhandled rejections
    process.on('uncaughtException', (err) => {
      logError('\n❌ UNCAUGHT EXCEPTION! Shutting down...', err);
      shutdown('uncaughtException');
    });
    
    process.on('unhandledRejection', (err) => {
      logError('\n❌ UNHANDLED REJECTION! Shutting down...', err);
      shutdown('unhandledRejection');
    });
    
  } catch (err) {
    logError('\n❌ Failed to start server:', err);
    process.exit(1);
  }
})();

export default app;