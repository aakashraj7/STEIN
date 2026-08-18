import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/stein',
  },

  neo4j: {
    uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
    user: process.env.NEO4J_USER || 'neo4j',
    password: process.env.NEO4J_PASSWORD || 'password',
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },

  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || '',
    baseUrl: 'https://api.etherscan.io/api',
  },

  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    channelId: process.env.TELEGRAM_CHANNEL_ID || '',
    discussionGroupId: process.env.TELEGRAM_DISCUSSION_GROUP_ID || '',
  },

  // Correlation weights — configurable
  correlation: {
    listingSignal: 0.30,
    stylometry: 0.30,
    walletSignal: 0.25,
    behaviourOverlap: 0.15,
  },

  // Stylometry
  stylometry: {
    minMessages: 5,
    preferredMessages: 10,
  },
};

export default config;
