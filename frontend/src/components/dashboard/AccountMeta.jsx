import { formatAmount } from "../../utils/formatters";

function AccountMeta({ session }) {
  const hourlyWage =
    session.user.hourlyWage == null ? "Not returned by login" : formatAmount(session.user.hourlyWage);
  const currentBalance =
    session.user.currentBalance == null ? "Not returned by login" : formatAmount(session.user.currentBalance);

  const facts = [
    ["Current balance", currentBalance],
    ["Hourly wage", hourlyWage],
  ];

  return (
    <div className="grid gap-3">
      {facts.map(([label, value]) => (
        <div className="grid gap-2 border-t border-gray-200 pt-3.5 transition-colors dark:border-[#1d1d1d]" key={label}>
          <dt className="text-xs font-bold uppercase text-gray-500 transition-colors dark:text-[#daffde]/55">{label}</dt>
          <dd className="m-0 text-lg font-bold text-black transition-colors dark:text-white">{value}</dd>
        </div>
      ))}
    </div>
  );
}

export default AccountMeta;