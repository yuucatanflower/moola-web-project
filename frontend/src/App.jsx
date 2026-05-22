import { useEffect, useState } from "react";
import { fetchTransactions, loginUser, registerUser } from "./services/api";
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

const buildSession = ({ accessToken, user, username }) => ({
  accessToken,
  user: {
    id: user?.id ?? null,
    username: user?.username ?? username,
    role: user?.role ?? "USER",
    hourlyWage: user?.hourlyWage == null ? null : Number(user.hourlyWage),
  },
});

const formatAmount = (amount) =>
  new Intl.NumberFormat("en-DE", {
    style: "currency",
    currency: "EUR",
  }).format(Number(amount ?? 0));

function AuthPanel({
  authMode,
  form,
  message,
  pending,
  onFieldChange,
  onModeChange,
  onSubmit,
}) {
  const registering = authMode === "register";

  return (
    <section className="auth-panel">
      <div className="auth-copy">
        <p className="brand-mark">
          moola<span>.</span>
        </p>
        <h1>{registering ? "Create your money space" : "Sign in to your dashboard"}</h1>
        <p>
          Manage your finances and track your monthly payments and spendings. Analyze your financial habbits with help of our AI based advisor.
           <p>We do not store any sensetive data of yours.</p>
        </p>
       
      </div>

      <div className="auth-switch" role="tablist" aria-label="Authentication">
        <button
          aria-selected={!registering}
          className={!registering ? "is-active" : ""}
          onClick={() => onModeChange("login")}
          role="tab"
          type="button"
        >
          Login
        </button>
        <button
          aria-selected={registering}
          className={registering ? "is-active" : ""}
          onClick={() => onModeChange("register")}
          role="tab"
          type="button"
        >
          Register
        </button>
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        <label>
          Username
          <input
            autoComplete="username"
            name="username"
            onChange={onFieldChange}
            required
            value={form.username}
          />
        </label>

        <label>
          Password
          <input
            autoComplete={registering ? "new-password" : "current-password"}
            minLength={4}
            name="password"
            onChange={onFieldChange}
            required
            type="password"
            value={form.password}
          />
        </label>

        {registering ? (
          <label>
            Hourly wage
            <input
              min="0"
              name="hourlyWage"
              onChange={onFieldChange}
              required
              step="0.01"
              type="number"
              value={form.hourlyWage}
            />
          </label>
        ) : null}

        {message ? <p className={`form-message ${message.type}`}>{message.text}</p> : null}

        <button className="primary-btn" disabled={pending} type="submit">
          {pending ? "Working..." : registering ? "Create account" : "Login"}
        </button>
      </form>
    </section>
  );
}

function Dashboard({ session, transactions, transactionsState, onLogout }) {
  const hourlyWage = session.user.hourlyWage || 15;
  const storedHourlyWage =
    session.user.hourlyWage == null ? "Not returned by login" : formatAmount(session.user.hourlyWage);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <p className="brand-mark">
            moola<span>.</span>
          </p>
          <h1>Dashboard</h1>
        </div>

        <div className="user-menu">
          <div>
            <span>Signed in as</span>
            <strong>{session.user.username}</strong>
          </div>
          <button onClick={onLogout} type="button">
            Logout
          </button>
        </div>
      </header>

      <main className="main-content">
        <section className="card-section">
          <div className="section-title">
            <h2>Your Expenses</h2>
            <span>{transactions.length} items</span>
          </div>

          {transactionsState.loading ? <p className="panel-note">Loading transactions...</p> : null}
          {transactionsState.error ? <p className="panel-note error">{transactionsState.error}</p> : null}

          {!transactionsState.loading && !transactionsState.error ? (
            <div className="transaction-list">
              {transactions.length ? (
                transactions.map((transaction) => (
                  <article className="transaction-item" key={transaction.id}>
                    <div className="transaction-main">
                      <span className="transaction-dot" aria-hidden="true" />
                      <div>
                        <span className="vendor-name">
                          {transaction.description || "Transaction"}
                        </span>
                        <div className="tags">
                          {transaction.impulseBuy ? <span className="tag impulse-tag">Impulse</span> : null}
                          {transaction.regret ? <span className="tag regret-tag">Regret</span> : null}
                        </div>
                      </div>
                    </div>

                    <div className="price-info">
                      <span className="price">{formatAmount(transaction.amount)}</span>
                      <span className="time-translated">
                        {(Number(transaction.amount ?? 0) / hourlyWage).toFixed(1)} hrs of work
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <p className="panel-note">No transactions yet. The login flow is ready for backend data.</p>
              )}
            </div>
          ) : null}
        </section>

        <section className="card-section account-section">
          <h2>Account</h2>
          <dl className="account-facts">
            <div>
              <dt>Role</dt>
              <dd>{session.user.role}</dd>
            </div>
            <div>
              <dt>Hourly wage</dt>
              <dd>{storedHourlyWage}</dd>
            </div>
            <div>
              <dt>Session</dt>
              <dd>JWT stored locally</dd>
            </div>
          </dl>
        </section>
      </main>
    </div>
  );
}

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
        user: registeredUser,
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
