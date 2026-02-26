import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor to add token to requests
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
}, error => {
    console.error('API Request Error:', error.response || error);
    return Promise.reject(error);
});

api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Response Error:', error.response || error);
        return Promise.reject(error);
    }
);

export default api;
