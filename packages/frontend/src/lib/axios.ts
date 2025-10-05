import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Response Interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('401 error intercepted for:', originalRequest.url);
      
      if (isRefreshing) {
        console.log('Already refreshing, queueing request');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
            originalRequest._retry = true;
            return apiClient(originalRequest);
          })
          .catch((err: AxiosError) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('Attempting to refresh token...');
        // request refresh token
        await apiClient.post('/api/auth/refresh-token', {}, { withCredentials: true });
        console.log('Token refresh successful');

        processQueue(null, 'done');
        return apiClient(originalRequest);
      } catch (err) {
        console.error('Token refresh failed:', err);
        processQueue(err, null);

        // Only redirect if we're in the browser, this isn't the refresh endpoint itself,
        // and we're not already on the login page
        if (typeof window !== 'undefined' &&
            !originalRequest.url?.includes('/api/auth/refresh-token') &&
            !window.location.pathname.includes('/conversations')) {
          // Prevent redirect loops by checking if we just redirected
          const lastRedirect = localStorage.getItem('lastAuthRedirect');
          const now = Date.now();

          if (!lastRedirect || (now - parseInt(lastRedirect)) > 5000) { // 5 second cooldown
            console.log('Redirecting to login page');
            localStorage.setItem('lastAuthRedirect', now.toString());
            window.location.href = '/';
          } else {
            console.log('Preventing redirect loop, too soon since last redirect');
          }
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }

    return Promise.reject(error);
  }
);
