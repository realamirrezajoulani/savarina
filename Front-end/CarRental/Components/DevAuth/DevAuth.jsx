import React, { useState, useEffect } from "react";

const DevAuth = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const correctPassword = "5657";

  useEffect(() => {
    if (localStorage.getItem("devAuth") === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === correctPassword) {
      localStorage.setItem("devAuth", "true");
      setIsAuthenticated(true);
    } else {
      alert("رمز اشتباه است!");
    }
  };


  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-200">
        <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md">
          <h2 className="text-lg font-bold mb-4">رمز عبور را وارد کنید...</h2>
          <input
            type="password"
            className="border p-2 w-full mb-4"
            placeholder="*********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="bg-blue-gray-900 text-white px-4 py-2 rounded w-full">
            ورود
          </button>
        </form>
      </div>
    );
  }

  return children;
};

export default DevAuth;
