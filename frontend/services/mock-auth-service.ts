import type { AuthService, User } from "./auth-service.interface";

const mockAdminUser: User = {
  id: 'mock-admin-user-id',
  email: 'admin@example.com',
  name: 'Admin User',
};

export class MockAuthService implements AuthService {
  public user: User | null = null;
  public accessToken: string | null = null;

  async signIn(email: string): Promise<{ error?: string }> {
    if (email === mockAdminUser.email) {
      this.user = mockAdminUser;
      this.accessToken = 'mock-access-token';
      this.saveUser(this.user);
      this.saveAccessToken(this.accessToken);
      return Promise.resolve({});
    }
    return Promise.resolve({ error: "Invalid credentials" });
  }

  async signOut(): Promise<void> {
    this.user = null;
    this.accessToken = null;
    this.deleteUser();
    return Promise.resolve();
  }

  async saveUser(user: User): Promise<void> {
    localStorage.setItem('mock-user', JSON.stringify(user));
  }

  async saveAccessToken(token: string): Promise<void> {
    localStorage.setItem('mock-access-token', token);
  }

  async deleteUser(): Promise<void> {
    localStorage.removeItem('mock-user');
    localStorage.removeItem('mock-access-token');
  }

  async getCurrentUser(): Promise<User | null> {
    const localStorageUser = localStorage.getItem('mock-user');
    const localStorageToken = localStorage.getItem('mock-access-token');
    if (localStorageUser) {
      this.user = JSON.parse(localStorageUser);
      this.accessToken = localStorageToken || null;
    } else {
      this.user = null;
      this.accessToken = null;
    }
    return Promise.resolve(this.user);
  }

  async verifyEmailAndToken(token: string): Promise<{ error?: string; }> {
    return Promise.resolve({ error: 'Not implemented' });
  }

  onAuthStateChange(callback: (event: string, session: { user: User | null; access_token: string | null }) => void): {
    unsubscribe: () => void;
  } {
    // Simulate an auth state change
    if (this.user) {      
      callback('SIGNED_IN', { user: this.user, access_token: this.accessToken });      
    } else {
      callback('SIGNED_OUT', { user: null, access_token: null });
    }

    return {
      unsubscribe: () => {
        // Cleanup logic if needed
      }
    };
  }
}