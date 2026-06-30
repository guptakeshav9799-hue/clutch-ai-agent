import { useState, useCallback } from 'react';
import { api } from '../services/api';

export function useGemini() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getEmergencyPlan = useCallback(async (taskTitle, hoursRemaining) => {
    setIsLoading(true);
    setError(null);
    try {
      const plan = await api.getEmergencyPlan(taskTitle, hoursRemaining);
      setIsLoading(false);
      return plan;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      // Return demo emergency plan
      return {
        extension_email: `Subject: Request for Extension — ${taskTitle}\n\nDear Professor/Manager,\n\nI am writing to respectfully request a brief extension for "${taskTitle}." Due to unforeseen circumstances, I need additional time to ensure the quality of my submission.\n\nI am committed to submitting within 2 additional days.\n\nThank you for your understanding.\n\nBest regards,\n[Your Name]`,
        mvs_description: `For "${taskTitle}", the absolute minimum includes: a clear introduction, the core content (even if not polished), and a brief conclusion. Focus on structure over perfection.`,
        survival_steps: [
          `Spend the first ${Math.floor(hoursRemaining * 0.4)} hour(s) on core content`,
          `Use the next ${Math.floor(hoursRemaining * 0.4)} hour(s) to structure your ideas`,
          `Reserve the final ${Math.ceil(hoursRemaining * 0.2)} hour(s) for formatting and submission`,
        ],
      };
    }
  }, []);

  return { getEmergencyPlan, isLoading, error };
}
