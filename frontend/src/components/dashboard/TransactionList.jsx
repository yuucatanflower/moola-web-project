import { formatAmount } from "../../utils/formatters";

function CategoryDot({ color }) {
  return <span className="mt-1 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />;
}

const getTransactionCategory = (transaction) => {
  if (transaction.category?.name) return transaction.category.name;
  if (typeof transaction.category === "string") return transaction.category;
  if (transaction.regret) return "Regret";
  if (transaction.impulseBuy) return "Impulse";
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
              <p className="m-0 text-sm font-bold text-[#daffde]/75">{formatAmount(category.amount)}</p>
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

function TransactionTable({
  transactions
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl bg-white/8">
<div className="grid grid-cols-[0.8fr_0.8fr_1fr_0.9fr_1.4fr] gap-3 bg-[#202020] px-4 py-3 text-xs font-extrabold text-white max-md:hidden xl:text-sm">
  <span>Date</span>
  <span>Type</span>
  <span>Category</span>
  <span>Amount, EUR</span>
  <span>Description</span>
</div>

      <div className="divide-y divide-black/25">
        {transactions.length ? (
          transactions.map((transaction) => (
            <article
  className="grid gap-1 bg-white/10 px-4 py-3 text-xs font-bold text-[#e9f5e8] md:grid-cols-[0.8fr_0.8fr_1fr_0.9fr_1.4fr] md:gap-3 xl:text-sm"
  key={transaction.id}
>
  <span>{formatTransactionDate(transaction.date)}</span>
  <span>{transaction.type || "Expense"}</span>
  <span>{getTransactionCategory(transaction)}</span>
  <span>{Number(transaction.amount ?? 0).toFixed(2)}</span>
  <span className="text-[#daffde]/70">{transaction.description}</span>


</article>
          ))
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
  transactions,
  transactionsState
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
  transactions={transactions}
 
/>
      )}
    </section>
  );
}

export default TransactionList;
