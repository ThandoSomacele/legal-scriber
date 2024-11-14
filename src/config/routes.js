// src/config/routes.js
import authRoutes from '../routes/auth.js';
import userRoutes from '../routes/user.js';
import transcriptionRoutes from '../routes/transcriptions.js';
import summaryRoutes from '../routes/summaries.js';
import subscriptionRoutes from '../routes/subscription.js';
import auth from '../middleware/auth.js';
import checkSubscription from '../middleware/checkSubscription.js';

export const setupRoutes = app => {
  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/transcriptions', [auth, checkSubscription], transcriptionRoutes);
  app.use('/api/summaries', [auth, checkSubscription], summaryRoutes);
  app.use('/api/subscription', subscriptionRoutes);
};
