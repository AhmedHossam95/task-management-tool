const API_BASE_URL = 'http://localhost:3000' as const;

export const API_URL = {
  TASKS: `${API_BASE_URL}/tasks`,
  STATISTICS: `${API_BASE_URL}/statistics`,
} as const;
