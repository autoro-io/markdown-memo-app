import type { SupabaseClient } from "@supabase/supabase-js";
import { AuthService, User } from "./auth-service.interface";

export class SupabaseAuthService implements AuthService {
  private supabase: SupabaseClient;
  public user: User | null = null;
  public accessToken: string | null = null;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async signIn(email: string): Promise<{ error?: string }> {
    const { error } = await this.supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/" }
    });
    return { error: error?.message };
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
    this.user = null;
    this.accessToken = null;
  }

  async getCurrentUser(): Promise<User | null> {
    const { data, error } = await this.supabase.auth.getSession();
    if (error) {
      console.error("Error getting session:", error.message);
      return null;
    }
    this.user = data.session?.user ? {
      id: data.session.user.id,
      email: data.session.user.email ?? undefined,
      name: data.session.user.user_metadata?.full_name ?? undefined
    } : null;
    this.accessToken = data.session?.access_token ?? null;
    return this.user;
  }

  async verifyEmailAndToken(token: string): Promise<{ error?: string }> {
    const { error } = await this.supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    })
    return { error: error?.message };
  }

  onAuthStateChange(callback: (event: string, session: { user: User | null; access_token: string | null }) => void): {
    unsubscribe: () => void;
  } {
    const { data: listener } = this.supabase.auth.onAuthStateChange((event, session) => {
      this.user = session?.user ? {
        id: session.user.id,
        email: session.user.email ?? undefined,
        name: session.user.user_metadata?.full_name ?? undefined
      } : null;
      this.accessToken = session?.access_token ?? null;
      callback(event, { user: this.user, access_token: this.accessToken });
    });

    return {
      unsubscribe: () => {
        listener.subscription.unsubscribe();
      }
    };
  }
}