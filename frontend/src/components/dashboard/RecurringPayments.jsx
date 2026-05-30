import { formatAmount } from "../../utils/formatters";

function PaymentIcon({ type }) {
  const isSpotify = type === "spotify";

  return (
    <span
      className={`grid h-8 w-8 place-items-center rounded-full text-sm font-black ${
        isSpotify ? "bg-[#1ed760] text-black" : "border border-white/70 text-white"
      }`}
    >
      {isSpotify ? "S" : "H"}
    </span>
  );
}

const isRecurringCandidate = (transaction) => {
  const text = `${transaction.description ?? ""} ${transaction.category ?? ""} ${transaction.type ?? ""}`.toLowerCase();
  return text.includes("rent") || text.includes("subscription") || text.includes("spotify");
};

function RecurringPayments({ transactions }) {
  const recurringPayments = transactions.filter(isRecurringCandidate).slice(0, 3);

  return (
    <section className="overflow-hidden rounded-[26px] bg-white/10 shadow-[0_18px_50px_rgba(0,0,0,0.38)]">
      <div className="rounded-t-[26px] bg-[#202020] px-4 py-3 text-lg font-extrabold text-white">
        Recurring Payments
      </div>
      <div className="grid gap-3 p-5">
        {recurringPayments.length ? (
          recurringPayments.map((payment) => (
            <div
              className="grid grid-cols-[auto_1fr_auto] items-center gap-4 text-sm font-bold text-white"
              key={payment.id}
            >
              <PaymentIcon
                type={String(payment.description ?? "").toLowerCase().includes("spotify") ? "spotify" : "home"}
              />
              <span className="min-w-0 truncate text-lg">{payment.description || "Recurring payment"}</span>
              <span className="text-right">{formatAmount(payment.amount)}</span>
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
