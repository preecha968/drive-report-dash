import React, { useEffect, useState } from 'react';
import { Login } from './Login';
import { Dashboard } from './Dashboard';
import { AuthApi } from '@/lib/api';

const Index = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const { user } = await AuthApi.me();
        setCurrentUser(user.full_name);
      } catch {}
      setLoading(false);
    };
    init();
  }, []);

  const handleLogin = (username: string) => {
    setCurrentUser(username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (loading) return null;

  return (
    <>
      {currentUser ? (
        <Dashboard currentUser={currentUser} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </>
  );
};

export default Index;
