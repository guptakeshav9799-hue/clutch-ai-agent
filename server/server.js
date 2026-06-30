require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const app = require('./app');
const { startShadowAgentJob } = require('./jobs/shadowAgentJob');

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Clutch server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

  if (!process.env.GEMINI_API_KEY) {
    console.log('⚠️  GEMINI_API_KEY not set — running in demo mode');
  }
  if (!process.env.FIREBASE_PROJECT_ID) {
    console.log('⚠️  Firebase not configured — running in demo mode');
  }

  // Start cron jobs
  startShadowAgentJob();
});
