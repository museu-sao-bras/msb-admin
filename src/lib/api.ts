// src/lib/api.ts
// Utility functions for interacting with the external API

export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api.example.com";

export async function apiGet<T>(endpoint: string): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
  if (!response.ok) {
    throw new Error(`GET ${endpoint} failed: ${response.status}`);
  }
  return response.json();
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
  if (!response.ok) {
    throw new Error(`POST ${endpoint} failed: ${response.status}`);
  }
  return response.json();
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
  if (!response.ok) {
    throw new Error(`PUT ${endpoint} failed: ${response.status}`);
  }
  return response.json();
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) {
    throw new Error(`DELETE ${endpoint} failed: ${response.status}`);
  }
  return response.json();
}
