import { DEMO_TRANSACTION } from "../../constants/demoData";
import { formatAmount } from "../../utils/formatters";

const LOGO_URL =
  "https://img.logo.dev/netflix.com?token=pk_UzSG7ttKQZyJ5b837_CfGg&size=37&format=png&theme=dark&retina=true";

function TransactionTag({ children, tone }) {
  const toneClass =
    tone === "regret"
      ? "border-red-300/25 bg-red-400/10 text-red-300"
      : "border-[#deff9a]/25 bg-[#deff9a]/10 text-[#deff9a]";

  return (
    <span className={`rounded-md border px-2 py-1 text-[0.72rem] font-extrabold uppercase ${toneClass}`}>
      {children}
    </span>
  );
}

function TransactionRow({ transaction, hourlyWage, demo = false }) {
  return (
    <article className="flex min-h-20 items-center justify-between gap-4 rounded-2xl border border-[#1d1d1d] bg-[#020202] p-4 max-sm:flex-col max-sm:items-start">
      <div className="flex min-w-0 items-center gap-3.5">
        <img alt="" className="h-10 w-10 rounded-md object-contain" src={LOGO_URL} />

        <div>
          <span className="block [overflow-wrap:anywhere] text-base font-bold text-white">
            {transaction.description || "Transaction"}
          </span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {transaction.impulseBuy ? <TransactionTag tone="impulse">Impulse</TransactionTag> : null}
            {transaction.regret ? <TransactionTag tone="regret">Regret</TransactionTag> : null}
            {demo ? <TransactionTag tone="regret">Demo</TransactionTag> : null}
          </div>
        </div>
      </div>

      <div className="shrink-0 text-right max-sm:text-left">
        <span className="block text-xl font-extrabold text-[#deff9a]">
          {formatAmount(transaction.amount)}
        </span>
        <span className="mt-1 block text-sm text-[#daffde]/60">
          {(Number(transaction.amount ?? 0) / hourlyWage).toFixed(1)} hrs of work
        </span>
      </div>
    </article>
  );
}

function TransactionList({ hourlyWage, transactions, transactionsState }) {
  const visibleTransactions = transactions.length ? transactions : [DEMO_TRANSACTION];

  return (
    <section className="min-w-0 rounded-[20px] border border-[#222] bg-[#0a0a0a] p-5 sm:p-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="m-0 text-[1.35rem] font-bold text-white">Your Expenses</h2>
        <span className="text-xs font-bold uppercase text-[#daffde]/55">
          {transactions.length || 1} items
        </span>
      </div>

      {transactionsState.loading ? (
        <p className="m-0 rounded-xl border border-[#232323] bg-[#050505] px-3.5 py-3 leading-6 text-[#daffde]/75">
          Loading transactions...
        </p>
      ) : null}

      {transactionsState.error ? (
        <p className="m-0 rounded-xl border border-red-300/35 bg-[#050505] px-3.5 py-3 leading-6 text-red-200">
          {transactionsState.error}
        </p>
      ) : null}

      {!transactionsState.loading && !transactionsState.error ? (
        <div className="grid gap-3.5">
          {visibleTransactions.map((transaction) => (
            <TransactionRow
              demo={!transactions.length}
              hourlyWage={hourlyWage}
              key={transaction.id}
              transaction={transaction}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default TransactionList;
