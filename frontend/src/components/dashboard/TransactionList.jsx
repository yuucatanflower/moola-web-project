import { useState } from "react";
import { formatAmount } from "../../utils/formatters";

function BrandIcon({ name }) {
  const [hasError, setHasError] = useState(false);

  const genericTerms = ["salary", "income", "wage", "deposit", "transfer", "cash"];
  const cleanName = name ? name.toLowerCase() : "";
  const isGeneric = genericTerms.some(term => cleanName.includes(term));

  if (!name || hasError || isGeneric) {
    return (
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-[10px] font-bold text-black shadow-sm transition-colors dark:border-[#2b2b2b] dark:bg-[#1a1a1a] dark:text-white">
        {name ? name.charAt(0).toUpperCase() : "?"}
      </div>
    );
  }

  const firstWord = name.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
  const logoUrl = `https://www.google.com/s2/favicons?sz=128&domain=${firstWord}.com`;

  return (
    <img
      src={logoUrl}
      alt=""
      onError={() => setHasError(true)}
      className="h-7 w-7 shrink-0 rounded-full border border-gray-200 bg-white object-contain p-1 shadow-sm transition-colors dark:border-[#2b2b2b]"
    />
  );
}

function CategoryDot({ color }) {
  return <span className="mt-1 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />;
}

const getTransactionCategory = (transaction) => {
  if (transaction.category?.name) return transaction.category.name;
  if (typeof transaction.category === "string") return transaction.category;
  if (transaction.regret || transaction.isRegret) return "Regret";
  if (transaction.impulseBuy || transaction.isImpulseBuy) return "Impulse";
  return "Expenses";
};

const buildCategoryBreakdown = (transactions) => {
  const totals = new Map();

  transactions.forEach((transaction) => {
    const category = getTransactionCategory(transaction);
    totals.set(category, (totals.get(category) ?? 0) + Math.abs(Number(transaction.amount ?? 0)));
  });

  const colors = ["#deff9a", "#8fe9ff", "#9f7aea", "#ff9b9b"];

  return Array.from(totals.entries()).map(([label, amount], index) => ({
    amount,
    color: colors[index % colors.length],
    label,
  }));
};

const formatTransactionDate = (date) => {
  if (!date) return "-";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return String(date);

  return parsed.toLocaleDateString("de-DE");
};

function CategoryLegend({ categories, currency = "EUR", salaryShield = false, hourlyWage = 15 }) {
  return (
    <div className="grid gap-3">
      {categories.length ? (
        categories.map((category) => (
          <div className="flex items-start gap-2" key={category.label}>
            <CategoryDot color={category.color} />
            <div>
              <p className="m-0 text-sm font-extrabold text-black transition-colors dark:text-white">{category.label}</p>
              <p className="m-0 text-sm font-bold text-gray-500 transition-colors dark:text-[#daffde]/75">
                {salaryShield
                  ? `${(category.amount / (hourlyWage || 1)).toFixed(1)} hrs`
                  : formatAmount(category.amount, currency)}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="m-0 text-sm font-bold text-gray-500 transition-colors dark:text-[#daffde]/60">No categories yet</p>
      )}
    </div>
  );
}

function SpendingPie({ categories }) {
  const total = categories.reduce((sum, category) => sum + category.amount, 0);
  let cursor = 0;

  const gradient = categories.length
    ? `conic-gradient(${categories
        .map((category) => {
          const start = cursor;
          const size = total > 0 ? (category.amount / total) * 100 : 0;
          cursor += size;
          return `${category.color} ${start}% ${cursor}%`;
        })
        .join(", ")})`
    : "";

  return (
    <div
      aria-label="Spending category distribution"
      className="h-36 w-36 rounded-full bg-gray-200 shadow-inner transition-colors dark:bg-[#202020] dark:shadow-[0_0_40px_rgba(222,255,154,0.08)]"
      role="img"
      style={categories.length ? { background: gradient } : {}}
    />
  );
}

function TransactionTable({ onDeleteTransaction, onUpdateTransaction, transactions, currency = "EUR", salaryShield = false, hourlyWage = 15 }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ amount: "", description: "" });
  const [pendingId, setPendingId] = useState(null);
  const [actionError, setActionError] = useState("");

  const startEditing = (transaction) => {
    setActionError("");
    setEditingId(transaction.id);
    setEditForm({
      amount: String(transaction.amount ?? ""),
      description: transaction.description ?? "",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ amount: "", description: "" });
    setActionError("");
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleSave = async (transaction) => {
    const nextAmount = Number(editForm.amount);

    if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
      setActionError("Amount must be greater than zero.");
      return;
    }

    setPendingId(transaction.id);
    setActionError("");

    try {
      await onUpdateTransaction(transaction.id, {
        amount: nextAmount,
        description: editForm.description.trim(),
      });
      cancelEditing();
    } catch (error) {
      setActionError(error.message || "Transaction could not be updated.");
    } finally {
      setPendingId(null);
    }
  };

  const handleDelete = async (transaction) => {
    setPendingId(transaction.id);
    setActionError("");

    try {
      await onDeleteTransaction(transaction.id);
      if (editingId === transaction.id) {
        cancelEditing();
      }
    } catch (error) {
      setActionError(error.message || "Transaction could not be deleted.");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white transition-colors dark:border-transparent dark:bg-white/8">
      <div className="grid grid-cols-[0.8fr_0.8fr_1fr_0.9fr_1.4fr_auto] gap-3 bg-gray-100 px-4 py-3 text-xs font-extrabold text-black transition-colors max-md:hidden dark:bg-[#202020] dark:text-white xl:text-sm">
        <span>Date</span>
        <span>Type</span>
        <span>Category</span>
        <span>{salaryShield ? "Amount, hrs" : `Amount, ${currency}`}</span>
        <span>Description</span>
        <span className="text-right">Actions</span>
      </div>

      <div className="divide-y divide-gray-200 transition-colors dark:divide-black/25">
        {transactions.length ? (
          <>
            {actionError ? (
              <p className="m-0 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition-colors dark:bg-red-950/45 dark:text-red-200">
                {actionError}
              </p>
            ) : null}

            {transactions.map((transaction) => {
              const editing = editingId === transaction.id;
              const pending = pendingId === transaction.id;

              return (
                <article
                  className="grid gap-2 bg-white px-4 py-3 text-xs font-bold text-black transition-colors md:grid-cols-[0.8fr_0.8fr_1fr_0.9fr_1.4fr_auto] md:items-center md:gap-3 dark:bg-white/10 dark:text-[#e9f5e8] xl:text-sm"
                  key={transaction.id}
                >
                  <span>{formatTransactionDate(transaction.date)}</span>
                  <span className="flex items-center gap-1.5">
                    {transaction.type || "Expense"}
                    {transaction.recurrent && (
                      <span title="Recurring" aria-label="Recurring">🔄</span>
                    )}
                  </span>
                  <span>{getTransactionCategory(transaction)}</span>

                  {editing ? (
                    <>
                      <input
                        className="min-h-9 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 text-sm text-black outline-none transition focus:border-green-500 dark:border-[#2b2b2b] dark:bg-[#050505] dark:text-white dark:focus:border-[#deff9a]/70"
                        disabled={pending}
                        min="0.01"
                        name="amount"
                        onChange={handleEditChange}
                        step="0.01"
                        type="number"
                        value={editForm.amount}
                      />
                      <input
                        className="min-h-9 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 text-sm text-black outline-none transition focus:border-green-500 dark:border-[#2b2b2b] dark:bg-[#050505] dark:text-white dark:focus:border-[#deff9a]/70"
                        disabled={pending}
                        name="description"
                        onChange={handleEditChange}
                        type="text"
                        value={editForm.description}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          className="min-h-9 rounded-lg bg-green-100 px-3 text-xs font-black text-green-800 transition hover:bg-green-200 disabled:cursor-wait disabled:opacity-60 dark:bg-[#deff9a] dark:text-black dark:hover:bg-white"
                          disabled={pending}
                          onClick={() => handleSave(transaction)}
                          type="button"
                        >
                          Save
                        </button>
                        <button
                          className="min-h-9 rounded-lg border border-gray-300 px-3 text-xs font-black text-black transition hover:border-gray-400 disabled:cursor-wait disabled:opacity-60 dark:border-[#2b2b2b] dark:text-white dark:hover:border-[#deff9a]/60"
                          disabled={pending}
                          onClick={cancelEditing}
                          type="button"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span>
                        {salaryShield
                          ? (Number(transaction.amount ?? 0) / (hourlyWage || 1)).toFixed(1)
                          : Number(transaction.amount ?? 0).toFixed(2)}
                      </span>

                      <span className="flex items-center gap-2 text-gray-500 transition-colors dark:text-[#daffde]/70">
                        <BrandIcon name={transaction.description || getTransactionCategory(transaction)} />
                        {transaction.description}
                      </span>

                      <div className="flex justify-end gap-2">
                        <button
                          aria-label="Edit transaction"
                          className="grid h-9 w-9 place-items-center rounded-lg border border-gray-300 text-base text-black transition hover:border-green-500 hover:text-green-600 disabled:cursor-wait disabled:opacity-60 dark:border-[#2b2b2b] dark:text-white dark:hover:border-[#deff9a]/60 dark:hover:text-[#deff9a]"
                          disabled={pending}
                          onClick={() => startEditing(transaction)}
                          title="Edit amount and description"
                          type="button"
                        >
                          <span aria-hidden="true">&#9998;</span>
                        </button>
                        <button
                          aria-label="Delete transaction"
                          className="min-h-9 rounded-lg border border-red-200 px-3 text-xs font-black text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-wait disabled:opacity-60 dark:border-red-300/30 dark:text-red-200 dark:hover:bg-transparent dark:hover:border-red-200 dark:hover:text-white"
                          disabled={pending}
                          onClick={() => handleDelete(transaction)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </>
        ) : (
          <p className="m-0 bg-gray-50 px-4 py-5 text-sm font-bold text-gray-500 transition-colors dark:bg-white/10 dark:text-[#daffde]/65">
            No transactions yet. Add one from Home to populate this table.
          </p>
        )}
      </div>
    </div>
  );
}

function TransactionList({
  onDeleteTransaction,
  onUpdateTransaction,
  transactions,
  transactionsState,
  currency = "EUR",
  salaryShield = false,
  hourlyWage = 15
}) {
  const categories = buildCategoryBreakdown(transactions);

  return (
    <section className="grid min-h-[370px] min-w-0 gap-6 rounded-[28px] border border-gray-200 bg-white p-5 shadow-lg transition-colors dark:border-transparent dark:bg-[#111]/95 dark:shadow-[0_20px_60px_rgba(0,0,0,0.42)] md:grid-cols-[190px_minmax(0,1fr)] xl:grid-cols-[210px_minmax(0,1fr)]">
      <aside className="grid content-start justify-items-center gap-6 pt-2 md:justify-items-start">
        <SpendingPie categories={categories} />
        <CategoryLegend
          categories={categories}
          currency={currency}
          salaryShield={salaryShield}
          hourlyWage={hourlyWage}
        />
      </aside>

      {transactionsState.loading ? (
        <p className="m-0 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 leading-6 text-gray-500 transition-colors dark:border-[#232323] dark:bg-[#050505] dark:text-[#daffde]/75">
          Loading transactions...
        </p>
      ) : (
        <TransactionTable
          onDeleteTransaction={onDeleteTransaction}
          onUpdateTransaction={onUpdateTransaction}
          transactions={transactions}
          currency={currency}
          salaryShield={salaryShield}
          hourlyWage={hourlyWage}
        />
      )}
    </section>
  );
}

export default TransactionList;