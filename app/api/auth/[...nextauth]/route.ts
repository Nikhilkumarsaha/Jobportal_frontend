import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const response = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { message: error.message || 'Login failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24, 
    };

    const response2 = NextResponse.json(data);
    response2.cookies.set('token', data.access_token, cookieOptions);
    response2.cookies.set('user', JSON.stringify(data.user), cookieOptions);

    return response2;
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { message: 'An error occurred' },
      { status: 500 }
    );
  }
}