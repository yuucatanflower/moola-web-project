import { formatAmount } from "../../utils/formatters";

function RecurringPayments({
  transactions,
  onDeleteTransaction,
  currency = "EUR",
  salaryShield = false,
  hourlyWage = 15
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
              <div className="flex flex-1 items-center gap-3">
                <span className="text-xl font-black text-white">
                  {payment.description || "Recurring Payment"}
                </span>

                <span className="text-lg text-[#daffde]/40">•</span>

                <span className="text-lg text-[#daffde]/75">
                  {payment.category?.name || "No Category"}
                </span>

                <span className="text-lg text-[#daffde]/40">•</span>

                <span className="text-lg font-semibold text-[#8fe9ff]">
                  Every {new Date(payment.date).getDate()}th day
                </span>
              </div>

              <div className="flex items-center gap-5">
                <span className="text-2xl font-black text-[#deff9a]">
                  {salaryShield
                    ? `${(Number(payment.amount) / (hourlyWage || 1)).toFixed(1)} hrs`
                    : formatAmount(payment.amount, currency)}
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