const cron = require('node-cron');
const firebase = require('../config/firebase-admin');
const { runAgentForAllTasks } = require('../services/shadowAgentService');

function startShadowAgentJob() {
  // Run at 2:00 AM every day
  cron.schedule('0 2 * * *', async () => {
    console.log('[CRON] Shadow Agent job started at', new Date().toISOString());

    try {
      if (!firebase.db) {
        console.log('[CRON] Demo mode — skipping actual agent run');
        return;
      }

      // Get all users
      const usersSnap = await firebase.db.collection('users').get();

      for (const userDoc of usersSnap.docs) {
        const userData = userDoc.data();
        const userId = userDoc.id;

        try {
          console.log(`[CRON] Running agent for user: ${userId}`);
          const accessToken = userData.oauthAccessToken || null;
          await runAgentForAllTasks(userId, accessToken);
          console.log(`[CRON] Agent completed for user: ${userId}`);
        } catch (error) {
          console.error(`[CRON] Agent failed for user ${userId}:`, error.message);
        }
      }

      console.log('[CRON] Shadow Agent job completed');
    } catch (error) {
      console.error('[CRON] Shadow Agent job error:', error.message);
    }
  });

  console.log('🤖 Shadow Agent cron job scheduled (daily at 2:00 AM)');
}

module.exports = { startShadowAgentJob };
