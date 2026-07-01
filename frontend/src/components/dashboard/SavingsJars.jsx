import { useEffect, useState } from "react";
import BrandMark from "../common/BrandMark";
import { formatAmount } from "../../utils/formatters";
import {
  createSavingsJar,
  deleteSavingsJar,
  depositToSavingsJar,
  fetchSavingsJars,
  withdrawFromSavingsJar,
} from "../../services/api";

const EMOJI_CHOICES = ["🏺", "✈️", "🏠", "🚗", "🎓", "🎮", "💍", "🎁", "🩺", "🐷"];
const COLOR_CHOICES = ["#DEFF9A", "#8fe9ff", "#ff6b6b", "#ffc978", "#c9a6ff"];

function CreateJarForm({ onCreate, onCancel, isSubmitting, error }) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0]);
  const [colorHex, setColorHex] = useState(COLOR_CHOICES[0]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name.trim()) return;

    onCreate({
      name: name.trim(),
      targetAmount: targetAmount ? Number(targetAmount) : null,
      emoji,
      colorHex,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-[26px] border border-dashed border-gray-300 bg-gray-50 p-6 transition-colors dark:border-[#deff9a]/30 dark:bg-black/40"
    >
      <div className="flex items-center justify-between">
        <h3 className="m-0 text-lg font-black text-black transition-colors dark:text-white">New Jar</h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-bold text-gray-500 transition hover:text-black dark:text-gray-400 dark:hover:text-white"
        >
          Cancel
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase text-gray-500 transition-colors dark:text-[#daffde]/55">
          What are you saving for?
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New Laptop, Vacation, Emergency Fund..."
          className="min-h-12 w-full rounded-[10px] border border-gray-300 bg-white px-4 text-base font-medium text-black placeholder-gray-400 transition focus:border-green-500 focus:outline-none dark:border-[#2b2b2b] dark:bg-[#0b0b0b] dark:text-white dark:placeholder-gray-600 dark:focus:border-[#deff9a]/55"
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase text-gray-500 transition-colors dark:text-[#daffde]/55">
          Target amount (optional)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          placeholder="e.g. 1000"
          className="min-h-12 w-full rounded-[10px] border border-gray-300 bg-white px-4 text-base font-medium text-black placeholder-gray-400 transition focus:border-green-500 focus:outline-none dark:border-[#2b2b2b] dark:bg-[#0b0b0b] dark:text-white dark:placeholder-gray-600 dark:focus:border-[#deff9a]/55"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase text-gray-500 transition-colors dark:text-[#daffde]/55">Icon</label>
        <div className="flex flex-wrap gap-2">
          {EMOJI_CHOICES.map((choice) => (
            <button
              key={choice}
              type="button"
              onClick={() => setEmoji(choice)}
              className={`grid h-10 w-10 place-items-center rounded-xl border text-xl transition ${
                emoji === choice
                  ? "border-green-500 bg-green-50 dark:border-[#deff9a] dark:bg-[#deff9a]/10"
                  : "border-gray-300 bg-white hover:border-gray-400 dark:border-[#2b2b2b] dark:bg-[#0b0b0b] dark:hover:border-[#444]"
              }`}
            >
              {choice}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase text-gray-500 transition-colors dark:text-[#daffde]/55">Color</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_CHOICES.map((choice) => (
            <button
              key={choice}
              type="button"
              onClick={() => setColorHex(choice)}
              style={{ backgroundColor: choice }}
              className={`h-9 w-9 rounded-full border-2 transition ${
                colorHex === choice ? "border-black dark:border-white" : "border-transparent"
              }`}
              aria-label={choice}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 dark:border-red-500/30 dark:bg-[#2a0e0e] dark:text-[#ff6b6b]">
          ⚠️ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !name.trim()}
        className="min-h-12 w-full rounded-[10px] bg-[#DEFF9A] px-6 text-base font-bold text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-white dark:hover:text-black dark:hover:shadow-[0_0_15px_rgba(222,255,154,0.4)]"
      >
        {isSubmitting ? "Creating..." : "Create Jar"}
      </button>
    </form>
  );
}

function JarCard({ jar, currency, salaryShield, hourlyWage, onDeposit, onWithdraw, onDelete }) {
  const [amount, setAmount] = useState("");
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState("");

  const current = Number(jar.currentAmount ?? 0);
  const target = jar.targetAmount != null ? Number(jar.targetAmount) : null;
  const progressPct = target && target > 0 ? Math.min(100, (current / target) * 100) : null;
  const isComplete = progressPct !== null && progressPct >= 100;

  const displayAmount = (value) =>
    salaryShield ? `${(value / (hourlyWage || 1)).toFixed(1)} hrs` : formatAmount(value, currency);

  const runAction = async (action) => {
    const numericAmount = Number(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setActionError("Enter an amount greater than 0.");
      return;
    }

    setPending(true);
    setActionError("");
    try {
      await action(numericAmount);
      setAmount("");
    } catch (error) {
      setActionError(error.message || "That didn't work.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div
      className="group relative overflow-hidden rounded-[26px] border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-transparent dark:bg-[#151515]/95 dark:shadow-[0_18px_50px_rgba(0,0,0,0.38)]"
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-35"
        style={{ backgroundColor: jar.colorHex }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl shadow-inner"
            style={{ backgroundColor: `${jar.colorHex}33` }}
          >
            {jar.emoji}
          </span>
          <div className="min-w-0">
            <h3 className="m-0 truncate text-lg font-black text-black transition-colors dark:text-white">{jar.name}</h3>
            {target ? (
              <p className="m-0 text-xs font-bold uppercase text-gray-500 transition-colors dark:text-[#daffde]/55">
                {isComplete ? "Goal reached 🎉" : `${progressPct.toFixed(0)}% of goal`}
              </p>
            ) : (
              <p className="m-0 text-xs font-bold uppercase text-gray-500 transition-colors dark:text-[#daffde]/55">
                Open-ended jar
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDelete(jar.id)}
          className="shrink-0 rounded-lg border border-red-200 px-2 py-1 text-red-500 opacity-0 transition group-hover:opacity-100 hover:bg-red-500 hover:text-white dark:border-red-300/30 dark:text-red-200 dark:hover:bg-transparent dark:hover:text-white"
          aria-label={`Delete ${jar.name}`}
        >
          🗑
        </button>
      </div>

      <p className="relative mt-5 mb-1 flex items-baseline gap-2 leading-none">
        <span className="text-3xl font-black text-black transition-colors dark:text-white">
          {displayAmount(current)}
        </span>
        {target && (
          <span className="text-sm font-bold text-gray-400 transition-colors dark:text-[#daffde]/40">
            / {displayAmount(target)}
          </span>
        )}
      </p>

      {target && (
        <div className="relative mt-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-200 transition-colors dark:bg-white/10">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPct}%`,
              backgroundColor: jar.colorHex,
              boxShadow: `0 0 12px ${jar.colorHex}99`,
            }}
          />
        </div>
      )}

      <div className="relative mt-5 flex items-center gap-2">
        <input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          disabled={pending}
          className="min-h-10 w-full min-w-0 rounded-[10px] border border-gray-300 bg-gray-50 px-3 text-sm font-medium text-black placeholder-gray-400 transition focus:border-green-500 focus:outline-none dark:border-[#2b2b2b] dark:bg-black dark:text-white dark:placeholder-gray-600 dark:focus:border-[#deff9a]/55"
        />
        <button
          type="button"
          disabled={pending}
          onClick={() => runAction((value) => onDeposit(jar.id, value))}
          className="min-h-10 shrink-0 rounded-[10px] bg-[#DEFF9A] px-3 text-sm font-bold text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-white dark:hover:text-black"
        >
          + Add
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => runAction((value) => onWithdraw(jar.id, value))}
          className="min-h-10 shrink-0 rounded-[10px] border border-gray-300 px-3 text-sm font-bold text-black transition hover:border-black disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2b2b2b] dark:text-white dark:hover:border-white"
        >
          − Take
        </button>
      </div>

      {actionError && (
        <p className="relative mt-2 text-xs font-bold text-red-500 dark:text-[#ff6b6b]">{actionError}</p>
      )}
    </div>
  );
}

function SavingsJars({ session, onBalanceChange }) {
  const [jars, setJars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createError, setCreateError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const userCurrency = session?.user?.preferredCurrency || session?.preferredCurrency || "EUR";
  const salaryShield = session?.user?.salaryShield || session?.salaryShield || false;
  const hourlyWage = Number(session?.user?.hourlyWage || session?.hourlyWage || 15);

  useEffect(() => {
    let ignore = false;

    fetchSavingsJars(session.accessToken)
      .then((data) => {
        if (!ignore) setJars(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!ignore) setLoadError("Could not load your savings jars.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [session.accessToken]);

  const handleCreate = async (jarData) => {
    setIsCreating(true);
    setCreateError("");
    try {
      const createdJar = await createSavingsJar(session.accessToken, jarData);
      setJars((current) => [...current, createdJar]);
      setShowCreateForm(false);
    } catch (error) {
      setCreateError(error.message || "Failed to create jar.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id) => {
    const jar = jars.find((j) => j.id === id);
    if (!window.confirm(`Delete "${jar?.name ?? "this jar"}"? Any saved money moves back to your balance.`)) {
      return;
    }

    await deleteSavingsJar(session.accessToken, id);
    setJars((current) => current.filter((j) => j.id !== id));
    if (jar) {
      onBalanceChange((balance) => balance + Number(jar.currentAmount ?? 0));
    }
  };

  const handleDeposit = async (id, amount) => {
    const updatedJar = await depositToSavingsJar(session.accessToken, id, amount);
    setJars((current) => current.map((j) => (j.id === id ? updatedJar : j)));
    onBalanceChange((balance) => balance - amount);
  };

  const handleWithdraw = async (id, amount) => {
    const updatedJar = await withdrawFromSavingsJar(session.accessToken, id, amount);
    setJars((current) => current.map((j) => (j.id === id ? updatedJar : j)));
    onBalanceChange((balance) => balance + amount);
  };

  const totalSaved = jars.reduce((sum, jar) => sum + Number(jar.currentAmount ?? 0), 0);

  return (
    <div className="w-full max-w-[1200px]">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-gray-200 pb-6 transition-colors dark:border-[#1a1a1a]">
        <div>
          <BrandMark />
          <h1 className="my-5 mb-0 text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-tight text-black transition-colors dark:text-white">
            Savings Jars
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-500 transition-colors dark:text-[#daffde]/55">
            {jars.length
              ? `${jars.length} jar${jars.length === 1 ? "" : "s"} · ${
                  salaryShield ? `${(totalSaved / (hourlyWage || 1)).toFixed(1)} hrs` : formatAmount(totalSaved, userCurrency)
                } set aside`
              : "Set money aside for specific goals — it moves out of your spendable balance."}
          </p>
        </div>

        {!showCreateForm && (
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="min-h-12 rounded-2xl bg-[#DEFF9A] px-6 font-black uppercase tracking-wide text-black transition hover:bg-black hover:text-white hover:shadow-[0_0_30px_rgba(222,255,154,0.4)] dark:hover:bg-white dark:hover:text-black"
          >
            + New Jar
          </button>
        )}
      </header>

      {showCreateForm && (
        <div className="mb-8">
          <CreateJarForm
            onCreate={handleCreate}
            onCancel={() => {
              setShowCreateForm(false);
              setCreateError("");
            }}
            isSubmitting={isCreating}
            error={createError}
          />
        </div>
      )}

      {loadError && (
        <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 dark:border-red-500/30 dark:bg-[#2a0e0e] dark:text-[#ff6b6b]">
          {loadError}
        </p>
      )}

      {loading ? (
        <p className="text-black transition-colors dark:text-white">Loading your jars…</p>
      ) : jars.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {jars.map((jar) => (
            <JarCard
              key={jar.id}
              jar={jar}
              currency={userCurrency}
              salaryShield={salaryShield}
              hourlyWage={hourlyWage}
              onDeposit={handleDeposit}
              onWithdraw={handleWithdraw}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        !showCreateForm && (
          <div className="rounded-[26px] border border-dashed border-gray-300 bg-gray-50 px-8 py-16 text-center transition-colors dark:border-[#2b2b2b] dark:bg-black/40">
            <p className="text-5xl">🏺</p>
            <p className="mt-4 text-lg font-bold text-black transition-colors dark:text-white">
              No jars yet
            </p>
            <p className="mt-1 text-sm font-medium text-gray-500 transition-colors dark:text-[#daffde]/55">
              Create one to start setting money aside for something specific.
            </p>
          </div>
        )
      )}
    </div>
  );
}

export default SavingsJars;
