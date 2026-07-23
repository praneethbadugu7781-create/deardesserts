// Force rebuild: 2026-07-23T21:46:00
export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('dd_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let baseUrl = 'https://deardesserts.onrender.com/api';
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    baseUrl = 'http://localhost:5000/api';
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/api`;
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new Error('Network error. Unable to connect to server.');
  }

  let text = '';
  try {
    text = await response.text();
  } catch (e) {
    text = '';
  }

  let data: any = {};
  try {
    data = JSON.parse(text);
  } catch (e) {
    if (!response.ok) {
      if (response.status === 502 || response.status === 503 || response.status === 504) {
        throw new Error('Server is waking up (Render free tier). Please try again in 15 seconds.');
      }
      throw new Error('Server returned an invalid response. Please try again.');
    }
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.error || `Server error (${response.status})`);
  }

  return data;
}
