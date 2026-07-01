import { formatAmount } from "../../utils/formatters";

function SummaryCard({ title, amount, accent = "text-black dark:text-white", currency = "EUR", salaryShield = false, hourlyWage = 15 }) {
  const displayValue = salaryShield
    ? (Number(amount) / (Number(hourlyWage) || 1)).toFixed(1)
    : formatAmount(amount, currency).replace(/[^\d.,-]/g, "");

  const displaySymbol = salaryShield ? "⏱️" : currency;

  return (
    <section className="min-w-0 overflow-hidden rounded-[28px] border border-gray-200 bg-white px-5 py-6 shadow-sm transition-colors dark:border-transparent dark:bg-[#151515]/95 dark:shadow-[0_18px_50px_rgba(0,0,0,0.38)] sm:px-7">
      <h2 className="m-0 truncate text-lg font-extrabold text-black transition-colors dark:text-white xl:text-xl">{title}</h2>
      <p className={`mt-6 mb-0 flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1 leading-none transition-colors ${accent}`}>
        <span className="shrink-0 text-[clamp(1.3rem,3vw,3.6rem)] font-black text-black transition-colors dark:text-white">
          {displaySymbol}
        </span>
        {/* never truncate a money value -- let it shrink down to fit instead of hiding digits behind an ellipsis */}
        <span className="min-w-0 text-[clamp(1.3rem,5.5vw,4.2rem)] font-black break-all">
          {displayValue}
          {salaryShield && <span className="ml-2 text-2xl">hrs</span>}
        </span>
      </p>
    </section>
  );
}

export default SummaryCard;