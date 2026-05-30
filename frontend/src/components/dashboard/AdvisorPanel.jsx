import { formatAmount } from "../../utils/formatters";

function AdvisorPanel({ monthlyExpenses, transactions }) {
  const advice = transactions.length
    ? `You logged ${formatAmount(monthlyExpenses)} in monthly spending. Review recurring purchases and regret-tagged expenses first.`
    : "Add transactions on Home to get spending advice based on your own account data.";

  return (
    <section className="overflow-hidden rounded-[26px] bg-white/10 shadow-[0_18px_50px_rgba(0,0,0,0.38)]">
      <div className="rounded-t-[26px] bg-[#202020] px-4 py-3 text-lg font-extrabold text-[#daffde]/70">
        Ask Moola Advisor...
      </div>
      <div className="grid min-h-44 gap-5 bg-white/10 p-5">
        <div className="justify-self-end rounded-2xl rounded-br-none bg-black px-4 py-2 text-sm font-bold text-white">
          What should I cut back on?
        </div>
        <div className="max-w-[360px] rounded-2xl rounded-bl-none bg-black px-4 py-3 text-sm font-bold leading-6 text-[#daffde]">
          {advice}
        </div>
      </div>
    </section>
  );
}

export default AdvisorPanel;
