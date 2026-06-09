import { formatAmount } from "../../utils/formatters";

function RecurringPayments({
  transactions,
  onDeleteTransaction,
}) {
  const recurringPayments = transactions.filter((t) => t.recurrent);

  return (
    <section className="overflow-hidden rounded-[26px] bg-white/10 shadow-[0_18px_50px_rgba(0,0,0,0.38)]">
      <div className="rounded-t-[26px] bg-[#202020] px-4 py-3 text-lg font-extrabold text-white">
        Recurring Payments
      </div>

      <div className="grid gap-4 p-5">
        {recurringPayments.length ? (
          recurringPayments.map((payment) => (
            <div
  key={payment.id}
  className="flex items-center justify-between rounded-xl border border-[#2b2b2b] bg-black/40 px-6 py-5"
>
  <div className="flex items-center gap-3 flex-1">

    <span className="font-black text-xl text-white">
  {payment.description || "Recurring Payment"}
</span>

<span className="text-[#daffde]/40 text-lg">•</span>

<span className="text-[#daffde]/75 text-lg">
  {payment.category?.name || "No Category"}
</span>

<span className="text-[#daffde]/40 text-lg">•</span>

<span className="text-[#8fe9ff] text-lg font-semibold">
  Every {new Date(payment.date).getDate()}th day
</span>

  </div>

  <div className="flex items-center gap-5">
    <span className="font-black text-2xl text-[#deff9a]">
  {formatAmount(payment.amount)}
</span>

    <button
      className="rounded-lg border border-red-300/30 px-2 py-1 text-red-200 hover:text-white"
      onClick={() => onDeleteTransaction(payment.id)}
    >
      🗑
    </button>
  </div>
</div>
          ))
        ) : (
          <p className="m-0 rounded-2xl border border-[#2b2b2b] bg-black/60 px-4 py-3 text-sm font-bold text-[#daffde]/70">
            No recurring payments detected yet.
          </p>
        )}
      </div>
    </section>
  );
}

export default RecurringPayments;