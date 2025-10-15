import { useState } from "react";
import { apiPost } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

async function apiPostForm<T>(endpoint: string, data: Record<string, string>): Promise<T> {
  const formBody = new URLSearchParams(data).toString();
  const response = await fetch(`${import.meta.env.VITE_API_URL || "https://api.example.com"}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formBody,
  });
  if (!response.ok) {
    throw new Error(`POST ${endpoint} failed: ${response.status}`);
  }
  return response.json();
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // POST /login expects form-urlencoded body
      const res = await apiPostForm<{
        access_token: string;
        token_type: string;
        user: {
          id: string;
          user_name: string;
          email: string;
          created_at: string;
        };
      }>("/login", {
        grant_type: "password",
        username,
        password,
      });
      localStorage.setItem("token", res.access_token);
      localStorage.setItem("user", JSON.stringify(res.user));
      navigate("/");
    } catch (err: any) {
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <div className="mt-4 text-sm text-center">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="text-primary underline"
          >
            Sign up
          </a>
        </div>
      </Card>
    </div>
  );
}
