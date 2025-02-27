import { jwtVerify } from 'jose';

export async function verifyAuth(token: string) {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    return verified.payload;
  } catch (err) {
    console.log(err)
    throw new Error('Invalid token');
  }
}

export function getUserFromLocalStorage() {
  if (typeof window === 'undefined') return null;
  
  const user = localStorage.getItem('user');
  if (!user) return null;
  
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setAuthData(token: string, user: any) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearAuthData() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}