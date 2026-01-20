import { createContext, useState, useEffect, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

// Define the shape of your Context
export interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "organizer";
}

export interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        //decode the token to check expiry
        const decoded: any = jwtDecode(token);
        
        //check if expired
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          // if expired
          console.log("Token expired on load. Logging out.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        } else {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}