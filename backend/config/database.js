import { ChromaClient } from 'chromadb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Database configuration for Chroma vector database
 * Handles connection setup and collection management
 */
class DatabaseConfig {
  constructor() {
    this.client = null;
    this.collection = null;
    this.isInitialized = false;
  }

  /**
   * Initialize Chroma client and create/connect to collection
   */
  async initialize() {
    try {
      // Initialize Chroma client to connect to the running server
      this.client = new ChromaClient({
        path: process.env.CHROMA_SERVER_URL || 'http://localhost:8000'
      });

      // Create or get existing collection for document embeddings
      const collectionName = 'documents';
      this.collection = await this.client.getOrCreateCollection({
        name: collectionName,
        metadata: {
          description: 'Collection for document embeddings and semantic search'
        }
      });

      this.isInitialized = true;
      console.log('✅ Chroma database initialized successfully');
      
      return this.collection;
    } catch (error) {
      console.error('❌ Failed to initialize Chroma database:', error);
      throw error;
    }
  }

  /**
   * Get the initialized collection
   */
  getCollection() {
    if (!this.isInitialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.collection;
  }

  /**
   * Get the Chroma client instance
   */
  getClient() {
    if (!this.client) {
      throw new Error('Chroma client not initialized. Call initialize() first.');
    }
    return this.client;
  }

  /**
   * Add documents to the vector database
   * @param {Array} documents - Array of document objects with text content
   * @param {Array} embeddings - Array of embedding vectors
   * @param {Array} ids - Array of unique document IDs
   */
  async addDocuments(documents, embeddings, ids) {
    try {
      const collection = this.getCollection();
      
      await collection.add({
        ids: ids,
        embeddings: embeddings,
        documents: documents.map(doc => doc.text),
        metadatas: documents.map(doc => doc.metadata || {})
      });

      console.log(`✅ Added ${documents.length} documents to vector database`);
    } catch (error) {
      console.error('❌ Failed to add documents to vector database:', error);
      throw error;
    }
  }

  /**
   * Search for similar documents using vector similarity
   * @param {Array} queryEmbedding - Query embedding vector
   * @param {number} nResults - Number of results to return
   */
  async searchSimilar(queryEmbedding, nResults = 5) {
    try {
      const collection = this.getCollection();
      
      const results = await collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: nResults
      });

      return results;
    } catch (error) {
      console.error('❌ Failed to search vector database:', error);
      throw error;
    }
  }
}

// Export singleton instance
const databaseConfig = new DatabaseConfig();
export default databaseConfig; 