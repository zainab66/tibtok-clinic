// src/axiosInstance.ts
import axios from 'axios';
import { store } from '../app/store'; // Make sure this path is correct: '../app/store' in your code
import { logoutUser, clearUserState } from '../features/userSlice'; // Make sure this path is correct
import { toast } from 'react-toastify';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Inject token into request headers
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 (Unauthorized) responses
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    console.log('--- AXIOS INTERCEPTOR: Response Error Caught ---');
    console.log('Status:', status);
    console.log('Error Response Data:', error.response?.data);
    console.log('-------------------------------------------------');

    if (status === 401) {
      const msg = error.response?.data?.msg || 'Session expired';
toast.warning(msg, { toastId: 'session-expired' });
      console.log('AXIOS INTERCEPTOR: 401 detected! Attempting logout...');

      try {
        // Dispatch logoutUser (which also clears localStorage on fulfilled/rejected)
        await store.dispatch(logoutUser(true)); // Pass true for localOnly logout
        console.log('AXIOS INTERCEPTOR: logoutUser dispatched.');

        // Explicitly clear user state and localStorage (redundant with logoutUser but good for certainty)
        store.dispatch(clearUserState());
        console.log('AXIOS INTERCEPTOR: clearUserState dispatched. Check localStorage now!');

      } catch (dispatchError) {
        console.error('AXIOS INTERCEPTOR: Error during Redux dispatch:', dispatchError);
      }

      console.log('🔐 Token expired: logging out and redirecting (handled by ProtectedRoute)');
      // ❌ Remove: window.location.href = '/login'
      // ✅ Let ProtectedRoute handle it
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;