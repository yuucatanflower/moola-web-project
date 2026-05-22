import { useEffect, useState } from "react";
import { fetchTransactions, loginUser, registerUser } from "./services/api";
import AuthPanel from "./components/AuthPanel";
import Dashboard from "./components/Dashboard";
import "./index.css";

const SESSION_KEY = "moola.auth.v1";
const EMPTY_FORM = {
  username: "",
  password: "",
  hourlyWage: "15",
};

const readStoredSession = () => {
  try {
    const storedSession = localStorage.getItem(SESSION_KEY);
    return storedSession ? JSON.parse(storedSession) : null;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

const saveSession = (session) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

const buildSession = ({ accessToken, loginUserObj, registeredUser, username }) => {
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

function App() {
  const [session, setSession] = useState(readStoredSession);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState(EMPTY_FORM);
  const [authMessage, setAuthMessage] = useState(null);
  const [authPending, setAuthPending] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [transactionsState, setTransactionsState] = useState({
    loading: false,
    error: "",
  });

  useEffect(() => {
    if (!session?.accessToken) {
      return;
    }

    let ignoreResult = false;

    const loadTransactions = async () => {
      setTransactionsState({ loading: true, error: "" });

      try {
        const data = await fetchTransactions(session.accessToken);

        if (!ignoreResult) {
          setTransactions(Array.isArray(data) ? data : []);
          setTransactionsState({ loading: false, error: "" });
        }
      } catch {
        if (!ignoreResult) {
          setTransactions([]);
          setTransactionsState({
            loading: false,
            error: "Logged in, but transactions could not be loaded.",
          });
        }
      }
    };

    loadTransactions();

    return () => {
      ignoreResult = true;
    };
  }, [session?.accessToken]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setAuthForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleModeChange = (nextMode) => {
    setAuthMode(nextMode);
    setAuthMessage(null);
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthPending(true);
    setAuthMessage(null);

    const credentials = {
      username: authForm.username.trim(),
      password: authForm.password,
    };

    try {
      let registeredUser = null;

      if (authMode === "register") {
        registeredUser = await registerUser({
          ...credentials,
          hourlyWage: Number(authForm.hourlyWage),
        });
      }

      const loginResponse = await loginUser(credentials);

      const nextSession = buildSession({
        accessToken: loginResponse.accessToken,
        loginUserObj: loginResponse.user,
        registeredUser,
        username: credentials.username,
      });

      saveSession(nextSession);
      setSession(nextSession);
      setAuthForm(EMPTY_FORM);
    } catch {
      setAuthMessage({
        type: "error",
        text:
            authMode === "register"
                ? "Account creation failed. Check the backend and try another username."
                : "Login failed. Check your username, password, and backend server.",
      });
    } finally {
      setAuthPending(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setTransactions([]);
    setAuthMessage({
      type: "success",
      text: "You are logged out on this browser.",
    });
  };

  return (
      <div className="app-shell">
        {session ? (
            <Dashboard
                onLogout={handleLogout}
                session={session}
                transactions={transactions}
                transactionsState={transactionsState}
            />
        ) : (
            <AuthPanel
                authMode={authMode}
                form={authForm}
                message={authMessage}
                onFieldChange={handleFieldChange}
                onModeChange={handleModeChange}
                onSubmit={handleAuthSubmit}
                pending={authPending}
            />
        )}
      </div>
  );
}

export default App;