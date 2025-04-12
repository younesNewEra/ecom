import { NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth'; // your existing login function
import { cookies } from 'next/headers'; // only if you plan to use cookies

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const loginResult = await loginUser(email, password);

    if (!loginResult) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const { token, user } = loginResult;

    return NextResponse.json({ token, user }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
