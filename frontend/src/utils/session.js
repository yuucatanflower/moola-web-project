import { SESSION_KEY } from "../constants/auth";

export const readStoredSession = () => {
  try {
    const storedSession = localStorage.getItem(SESSION_KEY);
    return storedSession ? JSON.parse(storedSession) : null;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

export const saveSession = (session) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const buildSession = ({ accessToken, loginUserObj, registeredUser, username }) => {
  const currentUser = loginUserObj || registeredUser;

  return {
    accessToken,
    user: {
      id: currentUser?.id ?? null,
      username: currentUser?.username ?? username,
      role: currentUser?.role ?? "USER",
      hourlyWage: currentUser?.hourlyWage == null ? null : Number(currentUser.hourlyWage),
    },
  };
};
