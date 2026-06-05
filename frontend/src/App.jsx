import { useEffect, useState } from "react";
import AuthPanel from "./components/auth/AuthPanel";
import Dashboard from "./components/dashboard/Dashboard";
import Home from "./components/dashboard/Home";
import { EMPTY_AUTH_FORM } from "./constants/auth";
import {
  deleteTransaction,
  fetchTransactions,
  loginUser,
  registerUser,
  updateTransaction,
} from "./services/api";
import { buildSession, clearSession, readStoredSession, saveSession } from "./utils/session";
import "./index.css";

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
      isImpulseBuy: currentTransaction.impulseBuy ?? currentTransaction.isImpulseBuy ?? false,
      isRecurrent: currentTransaction.recurrent ?? currentTransaction.isRecurrent ?? false,
      isRegret: currentTransaction.regret ?? currentTransaction.isRegret ?? false,
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

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_22%_10%,rgba(126,255,175,0.18),transparent_28rem),radial-gradient(circle_at_82%_82%,rgba(222,255,154,0.10),transparent_30rem),linear-gradient(145deg,#020302_0%,#071108_48%,#020302_100%)] p-[clamp(18px,4vw,48px)] font-sans text-[#daffde]">
      {session ? (
        <div className="flex w-full flex-col items-center">
          <nav className="mb-6 flex w-full gap-6 self-start border-b border-[#1a1a1a] px-4 pb-2">
            <button
              className={`flex items-center gap-2 pb-2 text-lg font-bold transition-colors duration-150 ${
                activeTab === "home"
                  ? "border-b-2 border-[#DEFF9A] text-white"
                  : "text-gray-500 hover:text-white"
              }`}
              onClick={() => setActiveTab("home")}
              type="button"
            >
              Home
            </button>
            <button
              className={`flex items-center gap-2 pb-2 text-lg font-bold transition-colors duration-150 ${
                activeTab === "dashboard"
                  ? "border-b-2 border-[#DEFF9A] text-white"
                  : "text-gray-500 hover:text-white"
              }`}
              onClick={() => setActiveTab("dashboard")}
              type="button"
            >
              Dashboard
            </button>
          </nav>

          <div className="w-full">
            {activeTab === "home" ? (
              <Home onAddTransaction={handleAddTransaction} token={session.accessToken} />
            ) : (
              <Dashboard
                onDeleteTransaction={handleDeleteTransaction}
                onLogout={handleLogout}
                onUpdateTransaction={handleUpdateTransaction}
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
