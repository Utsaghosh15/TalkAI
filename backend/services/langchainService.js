import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { OpenAIEmbeddings } from '@langchain/openai';
import databaseConfig from '../config/database.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * LangChain Service - Handles AI interactions, prompt processing, and vector database operations
 * This service manages the core AI functionality including LLM chains and semantic search
 */
class LangChainService {
  constructor() {
    this.llm = null;
    this.embeddings = null;
    this.chatChain = null;
    this.isInitialized = false;
  }

  /**
   * Initialize LangChain components including LLM and embeddings
   */
  async initialize() {
    try {
      // Initialize OpenAI LLM for chat responses
      this.llm = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 1000
      });

      // Initialize OpenAI embeddings for vector operations
      this.embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: 'text-embedding-ada-002'
      });

      // Create the main chat chain with prompt template
      this.chatChain = this.createChatChain();

      this.isInitialized = true;
      console.log('✅ LangChain service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize LangChain service:', error);
      throw error;
    }
  }

  /**
   * Create the main chat chain with prompt template
   */
  createChatChain() {
    // Define the prompt template for chat responses
    const promptTemplate = PromptTemplate.fromTemplate(`
You are a helpful AI assistant. Use the following context to answer the user's question.
If you don't have relevant context, answer based on your general knowledge.

Context:
{context}

Conversation History:
{history}

User Question: {question}

Please provide a helpful and accurate response:
`);

    // Create the chain: prompt -> LLM -> string output
    return RunnableSequence.from([
      promptTemplate,
      this.llm,
      new StringOutputParser()
    ]);
  }

  /**
   * Generate embeddings for text
   * @param {string} text - Text to embed
   */
  async generateEmbedding(text) {
    if (!this.isInitialized) {
      throw new Error('LangChain service not initialized');
    }

    try {
      const embedding = await this.embeddings.embedQuery(text);
      return embedding;
    } catch (error) {
      console.error('❌ Failed to generate embedding:', error);
      throw error;
    }
  }

  /**
   * Search for relevant context in vector database
   * @param {string} query - Search query
   * @param {number} maxResults - Maximum number of results
   */
  async searchContext(query, maxResults = 5) {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Search vector database for similar documents
      const searchResults = await databaseConfig.searchSimilar(queryEmbedding, maxResults);
      
      // Extract and format context from search results
      const context = this.formatSearchResults(searchResults);
      
      return context;
    } catch (error) {
      console.error('❌ Failed to search context:', error);
      return ''; // Return empty context if search fails
    }
  }

  /**
   * Format search results into readable context
   * @param {Object} searchResults - Results from vector database search
   */
  formatSearchResults(searchResults) {
    if (!searchResults || !searchResults.documents || !searchResults.documents[0]) {
      return '';
    }

    const documents = searchResults.documents[0];
    const distances = searchResults.distances[0];
    
    // Combine documents with their relevance scores
    const formattedResults = documents.map((doc, index) => {
      const distance = distances[index];
      const relevance = Math.max(0, 1 - distance); // Convert distance to relevance score
      return `[Relevance: ${(relevance * 100).toFixed(1)}%] ${doc}`;
    });

    return formattedResults.join('\n\n');
  }

  /**
   * Process a chat message and generate response
   * @param {string} userMessage - User's message
   * @param {string} conversationHistory - Previous conversation context
   * @param {string} additionalContext - Additional context from vector search
   */
  async processChatMessage(userMessage, conversationHistory = '', additionalContext = '') {
    if (!this.isInitialized) {
      throw new Error('LangChain service not initialized');
    }

    try {
      // Search for relevant context
      const searchContext = await this.searchContext(userMessage);
      
      // Combine all context sources
      const fullContext = [additionalContext, searchContext]
        .filter(ctx => ctx && ctx.trim())
        .join('\n\n');

      // Generate response using the chat chain
      const response = await this.chatChain.invoke({
        context: fullContext || 'No specific context available.',
        history: conversationHistory || 'No previous conversation.',
        question: userMessage
      });

      return response;
    } catch (error) {
      console.error('❌ Failed to process chat message:', error);
      throw error;
    }
  }

  /**
   * Add documents to the vector database
   * @param {Array} documents - Array of document objects with text content
   */
  async addDocumentsToVectorDB(documents) {
    try {
      // Generate embeddings for all documents
      const texts = documents.map(doc => doc.text);
      const embeddings = await this.embeddings.embedDocuments(texts);
      
      // Generate IDs for documents
      const ids = documents.map((_, index) => `doc_${Date.now()}_${index}`);
      
      // Add to vector database
      await databaseConfig.addDocuments(documents, embeddings, ids);
      
      console.log(`✅ Added ${documents.length} documents to vector database`);
    } catch (error) {
      console.error('❌ Failed to add documents to vector database:', error);
      throw error;
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      hasLLM: !!this.llm,
      hasEmbeddings: !!this.embeddings,
      hasChatChain: !!this.chatChain
    };
  }
}

// Export singleton instance
const langChainService = new LangChainService();
export default langChainService; 