import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api, setAccessToken } from "../api";
import { connectSocket } from "../useSocket";

export default function Login({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isRegister, setIsRegister] = useState(searchParams.get("register") === "1");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegister) {
        await api("/auth/register", {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
        });
      }
      const data = await api<{ accessToken: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setAccessToken(data.accessToken);
      connectSocket(data.accessToken);
      onLoginSuccess();
      navigate("/projects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">{isRegister ? "Create account" : "Login to DevFlow"}</h1>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        {isRegister && (
          <input className="w-full border rounded px-3 py-2" placeholder="Name"
            value={name} onChange={(e) => setName(e.target.value)} />
        )}
        <input className="w-full border rounded px-3 py-2" placeholder="Email" type="email"
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password"
          value={password} onChange={(e) => setPassword(e.target.value)} />

        <button className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700">
          {isRegister ? "Register" : "Login"}
        </button>

        <button type="button" className="text-sm text-blue-600 w-full"
          onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "Already have an account? Login" : "No account? Register"}
        </button>
      </form>
    </div>
  );
}