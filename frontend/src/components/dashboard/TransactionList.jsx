import { useState } from "react";
import { formatAmount } from "../../utils/formatters";

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

function CategoryLegend({ categories }) {
  return (
    <div className="grid gap-3">
      {categories.length ? (
        categories.map((category) => (
          <div className="flex items-start gap-2" key={category.label}>
            <CategoryDot color={category.color} />
            <div>
              <p className="m-0 text-sm font-extrabold text-white">{category.label}</p>
              <p className="m-0 text-sm font-bold text-[#daffde]/75">
                {formatAmount(category.amount)}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="m-0 text-sm font-bold text-[#daffde]/60">No categories yet</p>
      )}
    </div>
  );
}

function SpendingPie({ categories }) {
  const total = categories.reduce((sum, category) => sum + category.amount, 0);
  let cursor = 0;
  const gradient = categories.length
    ? categories
        .map((category) => {
          const start = cursor;
          const size = total > 0 ? (category.amount / total) * 100 : 0;
          cursor += size;
          return `${category.color} ${start}% ${cursor}%`;
        })
        .join(", ")
    : "#202020 0 100%";

  return (
    <div
      aria-label="Spending category distribution"
      className="h-36 w-36 rounded-full shadow-[0_0_40px_rgba(222,255,154,0.08)]"
      role="img"
      style={{ background: `conic-gradient(${gradient})` }}
    />
  );
}

function TransactionTable({ onDeleteTransaction, onUpdateTransaction, transactions }) {
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
    <div className="min-w-0 overflow-hidden rounded-2xl bg-white/8">
      <div className="grid grid-cols-[0.8fr_0.8fr_1fr_0.9fr_1.4fr_auto] gap-3 bg-[#202020] px-4 py-3 text-xs font-extrabold text-white max-md:hidden xl:text-sm">
        <span>Date</span>
        <span>Type</span>
        <span>Category</span>
        <span>Amount, EUR</span>
        <span>Description</span>
        <span className="text-right">Actions</span>
      </div>

      <div className="divide-y divide-black/25">
        {transactions.length ? (
          <>
            {actionError ? (
              <p className="m-0 bg-red-950/45 px-4 py-3 text-sm font-bold text-red-200">
                {actionError}
              </p>
            ) : null}

            {transactions.map((transaction) => {
              const editing = editingId === transaction.id;
              const pending = pendingId === transaction.id;

              return (
                <article
                  className="grid gap-2 bg-white/10 px-4 py-3 text-xs font-bold text-[#e9f5e8] md:grid-cols-[0.8fr_0.8fr_1fr_0.9fr_1.4fr_auto] md:items-center md:gap-3 xl:text-sm"
                  key={transaction.id}
                >
                  <span>{formatTransactionDate(transaction.date)}</span>
                  <span>{transaction.type || "Expense"}</span>
                  <span>{getTransactionCategory(transaction)}</span>

                  {editing ? (
                    <>
                      <input
                        className="min-h-9 rounded-lg border border-[#2b2b2b] bg-[#050505] px-3 text-sm text-white outline-none transition focus:border-[#deff9a]/70"
                        disabled={pending}
                        min="0.01"
                        name="amount"
                        onChange={handleEditChange}
                        step="0.01"
                        type="number"
                        value={editForm.amount}
                      />
                      <input
                        className="min-h-9 rounded-lg border border-[#2b2b2b] bg-[#050505] px-3 text-sm text-white outline-none transition focus:border-[#deff9a]/70"
                        disabled={pending}
                        name="description"
                        onChange={handleEditChange}
                        type="text"
                        value={editForm.description}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          className="min-h-9 rounded-lg bg-[#deff9a] px-3 text-xs font-black text-black transition hover:bg-white disabled:cursor-wait disabled:opacity-60"
                          disabled={pending}
                          onClick={() => handleSave(transaction)}
                          type="button"
                        >
                          Save
                        </button>
                        <button
                          className="min-h-9 rounded-lg border border-[#2b2b2b] px-3 text-xs font-black text-white transition hover:border-[#deff9a]/60 disabled:cursor-wait disabled:opacity-60"
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
                      <span>{Number(transaction.amount ?? 0).toFixed(2)}</span>
                      <span className="text-[#daffde]/70">{transaction.description}</span>
                      <div className="flex justify-end gap-2">
                        <button
                          aria-label="Edit transaction"
                          className="grid h-9 w-9 place-items-center rounded-lg border border-[#2b2b2b] text-base text-white transition hover:border-[#deff9a]/60 hover:text-[#deff9a] disabled:cursor-wait disabled:opacity-60"
                          disabled={pending}
                          onClick={() => startEditing(transaction)}
                          title="Edit amount and description"
                          type="button"
                        >
                          <span aria-hidden="true">&#9998;</span>
                        </button>
                        <button
                          aria-label="Delete transaction"
                          className="min-h-9 rounded-lg border border-red-300/30 px-3 text-xs font-black text-red-200 transition hover:border-red-200 hover:text-white disabled:cursor-wait disabled:opacity-60"
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
          <p className="m-0 bg-white/10 px-4 py-5 text-sm font-bold text-[#daffde]/65">
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
}) {
  const categories = buildCategoryBreakdown(transactions);

  return (
    <section className="grid min-h-[370px] min-w-0 gap-6 rounded-[28px] bg-[#111]/95 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.42)] md:grid-cols-[190px_minmax(0,1fr)] xl:grid-cols-[210px_minmax(0,1fr)]">
      <aside className="grid content-start justify-items-center gap-6 pt-2 md:justify-items-start">
        <SpendingPie categories={categories} />
        <CategoryLegend categories={categories} />
      </aside>

      {transactionsState.loading ? (
        <p className="m-0 rounded-xl border border-[#232323] bg-[#050505] px-3.5 py-3 leading-6 text-[#daffde]/75">
          Loading transactions...
        </p>
      ) : (
        <TransactionTable
          onDeleteTransaction={onDeleteTransaction}
          onUpdateTransaction={onUpdateTransaction}
          transactions={transactions}
        />
      )}
    </section>
  );
}

export default TransactionList;
