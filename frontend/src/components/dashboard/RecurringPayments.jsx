import { formatAmount, ordinal } from "../../utils/formatters";

function RecurringPayments({
  transactions,
  onDeleteTransaction,
  currency = "EUR",
  salaryShield = false,
  hourlyWage = 15
}) {
  const recurringPayments = transactions.filter((t) => t.recurrent);

  return (
    <section className="overflow-hidden rounded-[26px] border border-gray-200 bg-white shadow-lg transition-colors dark:border-none dark:bg-white/10 dark:shadow-[0_18px_50px_rgba(0,0,0,0.38)]">
      <div className="rounded-t-[26px] bg-gray-100 px-4 py-3 text-lg font-extrabold text-black transition-colors dark:bg-[#202020] dark:text-white">
        Recurring Payments
      </div>

      <div className="grid gap-4 p-5">
        {recurringPayments.length ? (
          recurringPayments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-6 py-5 transition-colors dark:border-[#2b2b2b] dark:bg-black/40"
            >
              <div className="flex flex-1 items-center gap-3">
                <span className="text-xl font-black text-black transition-colors dark:text-white">
                  {payment.description || "Recurring Payment"}
                </span>

                <span className="text-lg text-gray-300 transition-colors dark:text-[#daffde]/40">•</span>

                <span className="text-lg text-gray-500 transition-colors dark:text-[#daffde]/75">
                  {payment.category?.name || "No Category"}
                </span>

                <span className="text-lg text-gray-300 transition-colors dark:text-[#daffde]/40">•</span>

                <span className="text-lg font-semibold text-blue-600 transition-colors dark:text-[#8fe9ff]">
                  Every {ordinal(new Date(payment.date).getDate())} day
                </span>
              </div>

              <div className="flex items-center gap-5">
                <span className="text-2xl font-black text-green-600 transition-colors dark:text-[#deff9a]">
                  {salaryShield
                    ? `${(Number(payment.amount) / (hourlyWage || 1)).toFixed(1)} hrs`
                    : formatAmount(payment.amount, currency)}
                </span>

                <button
                  className="rounded-lg border border-red-200 px-2 py-1 text-red-500 transition-colors hover:bg-red-500 hover:text-white dark:border-red-300/30 dark:text-red-200 dark:hover:bg-transparent dark:hover:text-white"
                  onClick={() => onDeleteTransaction(payment.id)}
                >
                  🗑
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="m-0 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-500 transition-colors dark:border-[#2b2b2b] dark:bg-black/60 dark:text-[#daffde]/70">
            No recurring payments detected yet.
          </p>
        )}
      </div>
    </section>
  );
}

export default RecurringPayments;