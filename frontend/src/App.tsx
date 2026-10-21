import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import { setAccessToken } from "./api";
import { connectSocket } from "./useSocket";
import ToastContainer from "./Toast";

export default function App() {
  const [checked, setChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setAccessToken(data.accessToken);
          connectSocket(data.accessToken);
          setLoggedIn(true);
        }
      })
      .finally(() => setChecked(true));
  }, []);

  if (!checked) return null;

  return (
    <>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login onLoginSuccess={() => setLoggedIn(true)} />} />
          <Route path="/projects" element={loggedIn ? <Projects /> : <Navigate to="/login" replace />} />
          <Route path="*" element={< Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </> 
  );
}