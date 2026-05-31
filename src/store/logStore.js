import { ProgressStore } from './progressStore';

export const LogStore = {
  getLogs: () => {
    try {
      const logs = localStorage.getItem('kazu_no_tenbin_logs');
      const parsed = logs ? JSON.parse(logs) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse logs', e);
      return [];
    }
  },
  
  addLog: (logEntry) => {
    try {
      const currentLogs = LogStore.getLogs();
      const newLog = {
        ...logEntry,
        profile_id: ProgressStore.getActiveId(),
        timestamp: new Date().toISOString()
      };
      currentLogs.push(newLog);
      localStorage.setItem('kazu_no_tenbin_logs', JSON.stringify(currentLogs));
      ProgressStore.recordLog(newLog);
    } catch (error) {
      console.error('Failed to save activity log', error);
    }
  },

  clearLogs: () => {
    localStorage.removeItem('kazu_no_tenbin_logs');
  }
};
