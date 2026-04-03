export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function fetchApi(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include',
    ...options,
    headers,
  });

  // Attempt to refresh token if 401 Unauthorized
  if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
    try {
      const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', refreshData.accessToken);
        }

        // Retry original request with new token
        const newHeaders: Record<string, string> = { ...headers as Record<string, string> };
        newHeaders['Authorization'] = `Bearer ${refreshData.accessToken}`;
        
        response = await fetch(`${API_URL}${endpoint}`, {
          credentials: 'include',
          ...options,
          headers: newHeaders,
        });
      }
    } catch (err) {
      if (typeof window !== 'undefined') localStorage.removeItem('accessToken');
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
    throw new Error(errorData.error || 'Something went wrong');
  }

  // Handle 204 No Content
  if (response.status === 204) return null;
  
  return response.json();
}
