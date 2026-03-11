import React, { createContext, useContext, useState, useMemo } from 'react';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // No authentication - mock session for compatibility
  const [session] = useState<Session | null>(null);
  const [user] = useState<User | null>(null);
  const [loading] = useState(false);

  const contextValue = useMemo(() => ({
    session,
    user,
    loading
  }), [session, user, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
