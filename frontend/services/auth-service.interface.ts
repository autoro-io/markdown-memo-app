export type User = {
  id: string;
  email?: string;
  name?: string;
}

export interface AuthService {
  signIn(email: string): Promise<{ error?: string }>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  verifyEmailAndToken(token: string): Promise<{ error?: string }>;
  onAuthStateChange(callback: (event: string, session: { user: User | null; access_token: string | null }) => void): {
    unsubscribe: () => void;
  };
  user: User | null;
  accessToken: string | null;
}