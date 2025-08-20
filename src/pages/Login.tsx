import React, { useState } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { useToast } from '@/hooks/use-toast';
import { AuthApi } from '@/lib/api';

interface LoginProps {
  onLogin: (username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    setError('');

    try {
      const { user } = await AuthApi.login(username, password);
      toast({
        title: 'เข้าสู่ระบบสำเร็จ',
        description: `ยินดีต้อนรับ ${user.full_name}`,
      });
      onLogin(user.full_name);
    } catch (err: any) {
      const msg = (() => {
        try { const p = JSON.parse(err.message); return p.error || err.message; } catch { return err.message; }
      })();
      setError(msg || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginForm 
      onLogin={handleLogin}
      isLoading={isLoading}
      error={error}
    />
  );
};