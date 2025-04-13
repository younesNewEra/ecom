import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { name, email, password, role = 'CLIENT' } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    const result = await registerUser(name, email, password, role);

    if (!result) {
      return NextResponse.json(
        { error: 'User already exists or registration failed' }, 
        { status: 409 }
      );
    }

    const { token, user } = result;

    // Set cookie for server-side auth
    cookies().set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
