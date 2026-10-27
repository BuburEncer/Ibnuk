"use client";
import { createContext, useContext, useState, type ReactNode } from "react";

const PasswordContext = createContext<{
  password: string;
  setPassword: (value: string) => void;
} | null>(null);

export function PasswordProvider({ children }: { children: ReactNode }) {
  const [password, setPassword] = useState("");
  return (
    <PasswordContext.Provider value={{ password, setPassword }}>
      {children}
    </PasswordContext.Provider>
  );
}

function usePassword() {
  const context = useContext(PasswordContext);
  if (!context) throw new Error("PasswordProvider missing");
  return context;
}

export function PasswordInput() {
  const { password, setPassword } = usePassword();
  return (
    <label>
      Password{" "}
      <input
        name="password"
        type="password"
        autoComplete="current-password"
        suppressHydrationWarning
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
    </label>
  );
}

export function HiddenPassword() {
  const { password } = usePassword();
  return <input type="hidden" name="password" value={password} />;
}
