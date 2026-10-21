import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { db } from '../db/dexieDb';
import type { OfflineAuthUser, ShopRecord, ProfileRecord } from '../db/dexieDb';

export interface RozKaUser {
  id: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  shopId: string;
  shopName: string;
  isOfflineUser?: boolean;
}

interface AuthContextType {
  user: RozKaUser | null;
  isLoading: boolean;
  isOnline: boolean;
  signIn: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string, shopName: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  createOfflineSession: (name?: string, shop?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CACHED_USER_KEY = 'rozka_active_session_v1';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<RozKaUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Monitor connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize and restore session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. Check local storage for persistent cached session first (vital for offline instant startup)
        const cached = localStorage.getItem(CACHED_USER_KEY);
        if (cached) {
          const parsedUser: RozKaUser = JSON.parse(cached);
          setUser(parsedUser);
        }

        // 2. If online and Supabase is configured, verify with live session
        if (navigator.onLine && isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await syncUserAndShopToLocal(session.user);
          }
        }
      } catch (err) {
        console.warn('Network auth check failed, continuing in offline mode:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for Supabase auth state changes (e.g. Google OAuth redirect)
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await syncUserAndShopToLocal(session.user);
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem(CACHED_USER_KEY);
          setUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Helper to sync Supabase user into Dexie IndexedDB and active state
  const syncUserAndShopToLocal = async (sbUser: any) => {
    const fullName = sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'Shopkeeper';
    const shopName = sbUser.user_metadata?.shop_name || `${fullName} Ki Dukan`;
    const phone = sbUser.user_metadata?.phone_number || '';

    // Check if shop exists in IndexedDB or Supabase
    let shopId = `shop-${sbUser.id.substring(0, 8)}`;
    const existingShop = await db.shops.where('ownerUserId').equals(sbUser.id).first();
    if (existingShop) {
      shopId = existingShop.id;
    } else {
      const now = new Date().toISOString();
      const newShop: ShopRecord = {
        id: shopId,
        name: shopName,
        ownerUserId: sbUser.id,
        phoneNumber: phone,
        currencyCode: 'INR',
        timezone: 'Asia/Kolkata',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };
      await db.shops.put(newShop);

      const newProfile: ProfileRecord = {
        id: sbUser.id,
        displayName: fullName,
        phoneNumber: phone,
        preferredLanguage: 'hi',
        createdAt: now,
        updatedAt: now,
      };
      await db.profiles.put(newProfile);
    }

    const rozkaUser: RozKaUser = {
      id: sbUser.id,
      email: sbUser.email || '',
      displayName: fullName,
      phoneNumber: phone,
      shopId,
      shopName,
      isOfflineUser: false,
    };

    localStorage.setItem(CACHED_USER_KEY, JSON.stringify(rozkaUser));
    setUser(rozkaUser);

    // Save into offlineAuthUsers for future offline logins
    await db.offlineAuthUsers.put({
      id: sbUser.id,
      email: sbUser.email || '',
      displayName: fullName,
      phoneNumber: phone,
      shopName,
      shopId,
      lastLoginAt: new Date().toISOString(),
    });
  };

  // Sign In with email or phone
  const signIn = async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const email = identifier.includes('@') ? identifier : `${identifier.replace(/\D/g, '')}@rozka.tech`;

      if (navigator.onLine && isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // If network failed mid-request, try offline fallback
          if (error.message.includes('fetch') || error.message.includes('network')) {
            return await attemptOfflineSignIn(email);
          }
          return { success: false, error: error.message };
        }

        if (data.user) {
          await syncUserAndShopToLocal(data.user);
          return { success: true };
        }
      } else {
        // Offline sign-in attempt
        return await attemptOfflineSignIn(email);
      }

      return { success: false, error: 'Sign in failed. Please try again.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  // Attempt local offline sign-in using Dexie cache
  const attemptOfflineSignIn = async (email: string) => {
    const offlineUser = await db.offlineAuthUsers.where('email').equalsIgnoreCase(email).first();
    if (offlineUser) {
      const rozkaUser: RozKaUser = {
        id: offlineUser.id,
        email: offlineUser.email,
        displayName: offlineUser.displayName,
        phoneNumber: offlineUser.phoneNumber,
        shopId: offlineUser.shopId,
        shopName: offlineUser.shopName,
        isOfflineUser: true,
      };
      localStorage.setItem(CACHED_USER_KEY, JSON.stringify(rozkaUser));
      setUser(rozkaUser);
      return { success: true };
    }
    return { 
      success: false, 
      error: 'Offline mode: No cached credentials found for this account. Please connect to the internet once to authenticate.' 
    };
  };

  // Sign Up with email, password, full name and shop name
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    shopName: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (navigator.onLine && isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              shop_name: shopName,
              phone_number: phone || '',
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          await syncUserAndShopToLocal(data.user);
          return { success: true };
        }
      } else {
        // Create local offline shopkeeper
        const localId = `local-user-${Date.now()}`;
        const localShopId = `local-shop-${Date.now()}`;
        const now = new Date().toISOString();

        const offlineUser: OfflineAuthUser = {
          id: localId,
          email,
          displayName: fullName || 'Retailer',
          phoneNumber: phone,
          shopName: shopName || 'My Kirana Store',
          shopId: localShopId,
          lastLoginAt: now,
        };

        await db.offlineAuthUsers.put(offlineUser);
        await db.shops.put({
          id: localShopId,
          name: shopName || 'My Kirana Store',
          ownerUserId: localId,
          currencyCode: 'INR',
          timezone: 'Asia/Kolkata',
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });

        const rozkaUser: RozKaUser = {
          id: localId,
          email,
          displayName: fullName,
          phoneNumber: phone,
          shopId: localShopId,
          shopName: shopName || 'My Kirana Store',
          isOfflineUser: true,
        };

        localStorage.setItem(CACHED_USER_KEY, JSON.stringify(rozkaUser));
        setUser(rozkaUser);
        return { success: true };
      }

      return { success: false, error: 'Registration failed.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth sign-in
  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    if (!navigator.onLine) {
      return { success: false, error: 'Internet connection is required for Google Sign-In.' };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Google Sign-In failed' };
    }
  };

  // Instant offline demo session
  const createOfflineSession = async (name = 'Unnati Mishra', shop = 'Mishra Kirana & General Store') => {
    const localId = `demo-user-${Date.now()}`;
    const localShopId = `demo-shop-001`;
    const now = new Date().toISOString();

    const offlineUser: OfflineAuthUser = {
      id: localId,
      email: 'demo@rozka.tech',
      displayName: name,
      phoneNumber: '+91 98765 43210',
      shopName: shop,
      shopId: localShopId,
      lastLoginAt: now,
    };

    await db.offlineAuthUsers.put(offlineUser);
    await db.shops.put({
      id: localShopId,
      name: shop,
      ownerUserId: localId,
      currencyCode: 'INR',
      timezone: 'Asia/Kolkata',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const rozkaUser: RozKaUser = {
      id: localId,
      email: 'demo@rozka.tech',
      displayName: name,
      phoneNumber: '+91 98765 43210',
      shopId: localShopId,
      shopName: shop,
      isOfflineUser: true,
    };

    localStorage.setItem(CACHED_USER_KEY, JSON.stringify(rozkaUser));
    setUser(rozkaUser);
  };

  // Sign out
  const signOut = async () => {
    try {
      if (navigator.onLine && isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Sign out warning:', e);
    } finally {
      localStorage.removeItem(CACHED_USER_KEY);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isOnline,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        createOfflineSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
