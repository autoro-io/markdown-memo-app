import { AuthService } from "./auth-service.interface";
import { MockAuthService } from "./mock-auth-service";
import { SupabaseAuthService } from "./supabase-auth-service";
import { getSupabaseClient } from "../../lib/supabase";

export class AuthServiceFactory {
  static create(): AuthService {
    // 環境変数やフラグに基づいてサービスを選択
    const useMock = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true';
    
    if (useMock) {
      return new MockAuthService();
    } else {
      return new SupabaseAuthService(getSupabaseClient());
    }
  }
}

export const auth: AuthService = AuthServiceFactory.create();