import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * MongoDB Configuration - Handles connection to MongoDB using Mongoose
 */
class MongoDBConfig {
  constructor() {
    this.isConnected = false;
  }

  /**
   * Initialize MongoDB connection
   */
  async initialize() {
    try {
      const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/talkai';
      
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      this.isConnected = true;
      console.log('✅ MongoDB connected successfully');
      
      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected');
        this.isConnected = true;
      });

      return mongoose.connection;
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return this.isConnected;
  }

  /**
   * Close MongoDB connection
   */
  async closeConnection() {
    try {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('✅ MongoDB connection closed');
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error);
      throw error;
    }
  }
}

// Export singleton instance
const mongodbConfig = new MongoDBConfig();
export default mongodbConfig; 