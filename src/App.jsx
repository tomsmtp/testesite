import React, { useState, useEffect } from 'react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/dashboards';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Verifica se já existe login salvo
    const savedUser = localStorage.getItem('agromanager_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  if (!user) {
    return <Login onLoginSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <Dashboard user={user} onLogout={() => {
      localStorage.removeItem('agromanager_user');
      setUser(null);
    }} />
  );
}