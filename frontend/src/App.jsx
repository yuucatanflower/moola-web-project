import { useEffect, useState } from "react";
import AuthPanel from "./components/auth/AuthPanel";
import Dashboard from "./components/dashboard/Dashboard";
import Home from "./components/dashboard/Home";
import { EMPTY_AUTH_FORM } from "./constants/auth";
import { fetchTransactions, loginUser, registerUser } from "./services/api";
import { buildSession, clearSession, readStoredSession, saveSession } from "./utils/session";
import "./index.css";

function App() {
  const [session, setSession] = useState(readStoredSession);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState(EMPTY_AUTH_FORM);
  const [authMessage, setAuthMessage] = useState(null);
  const [authPending, setAuthPending] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [transactionsState, setTransactionsState] = useState({
    loading: false,
    error: "",
  });

  // Track the active view tab ("home" or "dashboard")
  const [activeTab, setActiveTab] = useState("home");

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
  startingBalance: Number(authForm.currentBalance || 0),
});
      }

      const loginResponse = await loginUser(credentials);

      const nextSession = buildSession({
        accessToken: loginResponse.accessToken,
        currentBalance: authForm.currentBalance,
        loginUserObj: loginResponse.user,
        registeredUser,
        username: credentials.username,
      });
      console.log("SESSION:", nextSession);

      saveSession(nextSession);
      setSession(nextSession);
      setAuthForm(EMPTY_AUTH_FORM);
    } catch (error) {
      setAuthMessage({
        type: "error",
        text:
          error.message ||
          (authMode === "register"
            ? "Account creation failed. Check the backend and try another username."
            : "Login failed. Check your username, password, and backend server."),
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
    // Reset back to the home view upon logging out
    setActiveTab("home");
  };

  // Callback to append locally added expenses from the Home form directly into the app state
  const handleAddTransaction = (newTx) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_22%_10%,rgba(126,255,175,0.18),transparent_28rem),radial-gradient(circle_at_82%_82%,rgba(222,255,154,0.10),transparent_30rem),linear-gradient(145deg,#020302_0%,#071108_48%,#020302_100%)] p-[clamp(18px,4vw,48px)] font-sans text-[#daffde]">
      {session ? (
        <div className="flex w-full flex-col items-center">
          
          {/* Top Navigation Bar */}
          <nav className="mb-6 flex w-full gap-6 border-b border-[#1a1a1a] px-4 pb-2 self-start">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex items-center gap-2 pb-2 text-lg font-bold transition-colors duration-150 ${
                activeTab === "home" 
                  ? "text-white border-b-2 border-[#DEFF9A]" 
                  : "text-gray-500 hover:text-white"
              }`}
            >
              🏠 Home
            </button>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 pb-2 text-lg font-bold transition-colors duration-150 ${
                activeTab === "dashboard" 
                  ? "text-white border-b-2 border-[#DEFF9A]" 
                  : "text-gray-500 hover:text-white"
              }`}
            >
              📊 Dashboard
            </button>
          </nav>

          {/* Core App View Router */}
          <div className="w-full">
            {activeTab === "home" ? (
              <Home
  onAddTransaction={handleAddTransaction}
  token={session.accessToken}
/>
            ) : (
              <Dashboard
                onLogout={handleLogout}
                session={session}
                transactions={transactions}
                transactionsState={transactionsState}
              />
            )}
          </div>

        </div>
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
