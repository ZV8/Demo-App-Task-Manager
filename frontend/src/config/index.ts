// В Docker окружении API доступен через nginx прокси
export const API_URL = process.env.REACT_APP_API_URL || '/api';
