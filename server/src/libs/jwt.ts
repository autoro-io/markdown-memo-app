import { jwtVerify, type JWTPayload } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET as string;

export interface MyJwtPayload extends JWTPayload {
  sub: string;
  exp: number;
  iat: number;
  role: string; 
}

export async function verifyJwt(token: string): Promise<MyJwtPayload | null> {
  try {
    const decoded = await jwtVerify<MyJwtPayload>(token, new TextEncoder().encode(SECRET_KEY));
    return decoded.payload;
  } catch (err) {
    console.error('Invalid JWT:', err);
    return null;
  }
}
