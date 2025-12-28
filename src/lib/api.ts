// src/lib/api.ts
// Utility functions for interacting with the external API

export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api.example.com";

async function handleResponse(response: Response) {
  if (response.status === 401) {
    try {
      localStorage.removeItem('token');
    } catch (e) {
      // ignore
    }
    // Force a full navigation to the login page
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  // 204 No Content
  if (response.status === 204) return undefined;

  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
  return handleResponse(response) as Promise<T>;
}

export async function apiPost<T>(endpoint: string, data: any): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse(response) as Promise<T>;
}

export async function apiPut<T>(endpoint: string, data: any): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
  return handleResponse(response) as Promise<T>;
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "DELETE",
    headers,
  });
  return handleResponse(response) as Promise<T>;
}

// Upload helper for multipart/form-data. Accepts a FormData instance and posts it to the given endpoint
export async function apiUpload<T>(endpoint: string, formData: FormData): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  // Note: do NOT set Content-Type header; the browser will set the correct multipart boundary
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: formData,
  });
  return handleResponse(response) as Promise<T>;
}
