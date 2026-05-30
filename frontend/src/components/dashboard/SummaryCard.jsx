import { formatAmount } from "../../utils/formatters";

function SummaryCard({ accent = "text-white", amount, title }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-[28px] bg-[#151515]/95 px-5 py-6 shadow-[0_18px_50px_rgba(0,0,0,0.38)] sm:px-7">
      <h2 className="m-0 truncate text-lg font-extrabold text-white xl:text-xl">{title}</h2>
      <p className={`mt-6 mb-0 flex min-w-0 items-baseline gap-3 leading-none ${accent}`}>
        <span className="shrink-0 text-[clamp(1.9rem,3.2vw,3.6rem)] font-black text-white">
          EUR
        </span>
        <span className="min-w-0 truncate text-[clamp(2.2rem,4vw,4.2rem)] font-black">
          {formatAmount(amount).replace("€", "").trim()}
        </span>
      </p>
    </section>
  );
}

export default SummaryCard;
