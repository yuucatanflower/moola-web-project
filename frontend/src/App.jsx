import { useEffect, useState } from "react";
import AuthPanel from "./components/auth/AuthPanel";
import Dashboard from "./components/dashboard/Dashboard";
import Home from "./components/dashboard/Home";
import SavingsJars from "./components/dashboard/SavingsJars";
import Settings from "./components/dashboard/Settings";
import { EMPTY_AUTH_FORM } from "./constants/auth";
import {
  deleteTransaction,
  fetchTransactions,
  loginUser,
  registerUser,
  updateTransaction,
  updateUserProfile,
} from "./services/api";
import { buildSession, clearSession, readStoredSession, saveSession } from "./utils/session";
import "./index.css";
import AdminPanel from "./components/dashboard/AdminPanel";

const getTransactionBalanceDelta = (transaction) => {
  const amount = Number(transaction.amount ?? 0);
  const isIncome = String(transaction.type ?? "").toLowerCase() === "income";

  return isIncome ? amount : -Math.abs(amount);
};

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
  const [activeTab, setActiveTab] = useState("home");
  const isAdminPage = window.location.pathname === "/admin";

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      }

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

        // Ensures both Tone and Currency survive the login refresh
        if (loginResponse.user) {
          if (!nextSession.user) nextSession.user = {};

          if (loginResponse.user.advisorTone) {
            nextSession.advisorTone = loginResponse.user.advisorTone;
            nextSession.user.advisorTone = loginResponse.user.advisorTone;
          }
          if (loginResponse.user.preferredCurrency) {
            nextSession.preferredCurrency = loginResponse.user.preferredCurrency;
            nextSession.user.preferredCurrency = loginResponse.user.preferredCurrency;
          }
        }

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
    setActiveTab("home");
  };

  // Profile patch handler to update stateful session details locally.
  // Errors are intentionally left to propagate so Settings can show them to the user.
  const handleUpdateProfile = async (updatedData) => {
    // 1. Check if the currency is actually being changed
    const oldCurrency = session.preferredCurrency || session.user?.preferredCurrency;
    const isCurrencyChanged = updatedData.preferredCurrency && updatedData.preferredCurrency !== oldCurrency;

    // 2. Send the update to the backend AND save the response (which contains the newly calculated wage and balance)
    const updatedUserResponse = await updateUserProfile(session.accessToken, {
      newUsername: updatedData.username,
      hourlyWage: updatedData.hourlyWage,
      advisorTone: updatedData.advisorTone,
      preferredCurrency: updatedData.preferredCurrency,
      salaryShield: updatedData.salaryShield
    });

    // 3. IF the currency changed, force React to download the newly converted transactions
    if (isCurrencyChanged) {
      const freshTransactions = await fetchTransactions(session.accessToken);
      setTransactions(Array.isArray(freshTransactions) ? freshTransactions : []);
    }

    // 4. Update the local state with the precise math returned from the backend
    setSession((currentSession) => {
      if (!currentSession) return currentSession;

      const nextSession = {
        ...currentSession,
        username: updatedUserResponse.username ?? updatedData.username,
        hourlyWage: updatedUserResponse.hourlyWage ?? updatedData.hourlyWage,
        advisorTone: updatedUserResponse.advisorTone ?? updatedData.advisorTone,
        preferredCurrency: updatedUserResponse.preferredCurrency ?? updatedData.preferredCurrency,
        salaryShield: updatedUserResponse.salaryShield ?? updatedData.salaryShield,
        user: {
          ...currentSession.user,
          username: updatedUserResponse.username ?? updatedData.username,
          hourlyWage: updatedUserResponse.hourlyWage ?? updatedData.hourlyWage,
          advisorTone: updatedUserResponse.advisorTone ?? updatedData.advisorTone,
          preferredCurrency: updatedUserResponse.preferredCurrency ?? updatedData.preferredCurrency,
          salaryShield: updatedUserResponse.salaryShield ?? updatedData.salaryShield,
          currentBalance: updatedUserResponse.balance ?? currentSession.user?.currentBalance
        },
      };

      saveSession(nextSession);
      return nextSession;
    });
  };

  const updateSessionBalance = (balanceUpdater) => {
    setSession((currentSession) => {
      if (!currentSession) {
        return currentSession;
      }

      const currentBalance = Number(currentSession.user.currentBalance ?? 0);
      const nextSession = {
        ...currentSession,
        user: {
          ...currentSession.user,
          currentBalance: balanceUpdater(currentBalance),
        },
      };

      saveSession(nextSession);
      return nextSession;
    });
  };

  const handleAddTransaction = (newTransaction) => {
    setTransactions((currentTransactions) => [newTransaction, ...currentTransactions]);
    updateSessionBalance((currentBalance) => currentBalance + getTransactionBalanceDelta(newTransaction));
  };

  const handleDeleteTransaction = async (transactionId) => {
    const deletedTransaction = transactions.find((transaction) => transaction.id === transactionId);

    // intentionally not caught here: TransactionList wraps this call in its own
    // try/catch and surfaces the error inline next to the row being deleted
    await deleteTransaction(session.accessToken, transactionId);

    setTransactions((currentTransactions) =>
      currentTransactions.filter((transaction) => transaction.id !== transactionId)
    );

    if (deletedTransaction) {
      updateSessionBalance(
        (currentBalance) => currentBalance - getTransactionBalanceDelta(deletedTransaction)
      );
    }
  };

  const handleUpdateTransaction = async (transactionId, updates) => {
    const currentTransaction = transactions.find((transaction) => transaction.id === transactionId);

    if (!currentTransaction) {
      throw new Error("Transaction not found.");
    }

    const updatedTransaction = await updateTransaction(session.accessToken, transactionId, {
      amount: updates.amount ?? currentTransaction.amount,
      category: currentTransaction.category ?? null,
      currency: currentTransaction.currency ?? "EUR",
      date: currentTransaction.date,
      description: updates.description ?? currentTransaction.description,
      impulseBuy: currentTransaction.impulseBuy ?? currentTransaction.isImpulseBuy ?? false,
      recurrent: currentTransaction.recurrent ?? currentTransaction.isRecurrent ?? false,
      regret: currentTransaction.regret ?? currentTransaction.isRegret ?? false,
      type: currentTransaction.type ?? "EXPENSE",
    });

    updateSessionBalance(
      (currentBalance) =>
        currentBalance -
        getTransactionBalanceDelta(currentTransaction) +
        getTransactionBalanceDelta(updatedTransaction)
    );

    setTransactions((currentTransactions) =>
      currentTransactions.map((transaction) =>
        transaction.id === transactionId ? updatedTransaction : transaction
      )
    );
  };

  if (isAdminPage) {
    return (
      <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_22%_10%,rgba(34,197,94,0.10),transparent_28rem),radial-gradient(circle_at_82%_82%,rgba(132,204,22,0.08),transparent_30rem),linear-gradient(145deg,#ffffff_0%,#f3fbf4_48%,#ffffff_100%)] p-[clamp(18px,4vw,48px)] font-sans text-black transition-colors dark:bg-[radial-gradient(circle_at_22%_10%,rgba(126,255,175,0.18),transparent_28rem),radial-gradient(circle_at_82%_82%,rgba(222,255,154,0.10),transparent_30rem),linear-gradient(145deg,#020302_0%,#071108_48%,#020302_100%)] dark:text-[#daffde]">
        <AdminPanel session={session} />
      </div>
    );
  }

  // Helper template mapper to dynamically isolate view switches
  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return <Home onAddTransaction={handleAddTransaction} token={session.accessToken} />;
      case "dashboard":
        return (
          <Dashboard
            onDeleteTransaction={handleDeleteTransaction}
            onLogout={handleLogout}
            onUpdateTransaction={handleUpdateTransaction}
            session={session}
            transactions={transactions}
            transactionsState={transactionsState}
          />
        );
      case "jars":
        return <SavingsJars session={session} onBalanceChange={updateSessionBalance} />;
      case "settings":
        return (
          <Settings
            session={session}
            onUpdateProfile={handleUpdateProfile}
            onLogout={handleLogout}
          />
        );
      default:
        return <Home onAddTransaction={handleAddTransaction} token={session.accessToken} />;
    }
  };

  const NAV_TABS = [
    { key: "home", label: "Home", icon: "💸" },
    { key: "dashboard", label: "Dashboard", icon: "📊" },
    { key: "jars", label: "Jars", icon: "🏺" },
    { key: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_22%_10%,rgba(34,197,94,0.10),transparent_28rem),radial-gradient(circle_at_82%_82%,rgba(132,204,22,0.08),transparent_30rem),linear-gradient(145deg,#ffffff_0%,#f3fbf4_48%,#ffffff_100%)] p-[clamp(18px,4vw,48px)] font-sans text-black transition-colors dark:bg-[radial-gradient(circle_at_22%_10%,rgba(126,255,175,0.18),transparent_28rem),radial-gradient(circle_at_82%_82%,rgba(222,255,154,0.10),transparent_30rem),linear-gradient(145deg,#020302_0%,#071108_48%,#020302_100%)] dark:text-[#daffde]">
      {session ? (
        <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center">
          <nav className="mb-6 flex w-full items-center self-start">
            <div className="flex flex-wrap gap-1.5 rounded-2xl border border-gray-200 bg-white/80 p-1.5 shadow-sm backdrop-blur-md transition-colors dark:border-[#1f2421] dark:bg-[#121614]/90">
              {NAV_TABS.map(({ key, label, icon }) => {
                const isActive = activeTab === key;

                return (
                  <button
                    key={key}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold uppercase tracking-wide transition-all duration-200 ${
                      isActive
                        ? "bg-[#DEFF9A] text-black shadow-[0_4px_20px_rgba(222,255,154,0.35)]"
                        : "text-gray-500 hover:bg-gray-100 hover:text-black dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
                    }`}
                    onClick={() => setActiveTab(key)}
                    type="button"
                  >
                    <span className="text-base leading-none">{icon}</span>
                    <span className="max-sm:hidden">{label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="flex w-full flex-col items-center">
            {renderTabContent()}
          </div>
        </div>
      ) : (
        <div className="grid min-h-[85vh] place-items-center">
          <AuthPanel
            authMode={authMode}
            form={authForm}
            message={authMessage}
            onFieldChange={handleFieldChange}
            onModeChange={handleModeChange}
            onSubmit={handleAuthSubmit}
            pending={authPending}
          />
        </div>
      )}
    </div>
  );
}

export default App;