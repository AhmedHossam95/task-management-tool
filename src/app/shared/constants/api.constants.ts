const API_BASE_URL = 'http://localhost:3000' as const;

export const API_URL = {
  TASKS: `${API_BASE_URL}/tasks`,
  USERS: `${API_BASE_URL}/users`,
} as const;
