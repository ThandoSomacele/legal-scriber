// src/utils/clientLogger.js
const clientLogger = {
  info: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.info('📝 [INFO]:', ...args);
    }
  },

  error: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ [ERROR]:', ...args);
    }
  },

  warn: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ [WARN]:', ...args);
    }
  },

  debug: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('🔍 [DEBUG]:', ...args);
    }
  },
};

export default clientLogger;
