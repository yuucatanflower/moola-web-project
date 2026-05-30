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
        <div className="grid gap-2 border-t border-[#1d1d1d] pt-3.5" key={label}>
          <dt className="text-xs font-bold uppercase text-[#daffde]/55">{label}</dt>
          <dd className="m-0 text-lg font-bold text-white">{value}</dd>
        </div>
      ))}
    </div>
  );
}

export default AccountMeta;
