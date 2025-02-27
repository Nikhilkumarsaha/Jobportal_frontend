import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserFromLocalStorage, getToken, clearAuthData } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState(getUserFromLocalStorage());
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      router.push('/auth/login');
      return;
    }

    const currentUser = getUserFromLocalStorage();
    if (!currentUser) {
      clearAuthData();
      setLoading(false);
      router.push('/auth/login');
      return;
    }

    setUser(currentUser);
    setLoading(false);
  }, [router]);

  const logout = () => {
    clearAuthData();
    router.push('/auth/login');
  };

  return { user, loading, logout };
}