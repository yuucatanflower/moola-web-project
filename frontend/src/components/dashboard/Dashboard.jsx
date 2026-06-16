import AdvisorPanel from "./AdvisorPanel";
import BrandMark from "../common/BrandMark";
import RecurringPayments from "./RecurringPayments";
import SummaryCard from "./SummaryCard";
import TransactionList from "./TransactionList";

const isIncomeTransaction = (transaction) =>
  String(transaction.type ?? "").toLowerCase() === "income";

const calculateMonthlyIncome = (transactions) =>
  transactions
    .filter(isIncomeTransaction)
    .reduce((total, transaction) => total + Number(transaction.amount ?? 0), 0);

const calculateMonthlyExpenses = (transactions) =>
  transactions
    .filter((transaction) => !isIncomeTransaction(transaction))
    .reduce((total, transaction) => total + Math.abs(Number(transaction.amount ?? 0)), 0);

function Dashboard({
  session,
  transactions,
  transactionsState,
  onLogout,
  onDeleteTransaction,
  onUpdateTransaction,
}) {
  const totalBalance = Number(session.user.currentBalance ?? 0);
  const monthlyIncome = calculateMonthlyIncome(transactions);
  const monthlyExpenses = calculateMonthlyExpenses(transactions);

  // Extract the currency and shield settings saved in the user's session
  const userCurrency = session?.user?.preferredCurrency || session?.preferredCurrency || "EUR";
  const salaryShield = session?.user?.salaryShield || session?.salaryShield || false;
  const hourlyWage = Number(session?.user?.hourlyWage || session?.hourlyWage || 15);

  return (
    <div className="w-full">
      <header className="mb-6 flex items-center justify-end gap-5">
        <div className="flex items-center gap-4">
          <BrandMark />
          <button
            className="min-h-11 rounded-xl border border-[#2b2b2b] bg-[#0b0b0b] px-4 font-bold text-white transition hover:border-[#deff9a]/55"
            onClick={onLogout}
            type="button"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="grid min-w-0 gap-5 rounded-[34px] bg-[radial-gradient(circle_at_45%_40%,rgba(218,255,154,0.08),transparent_32rem),linear-gradient(145deg,rgba(26,30,26,0.96),rgba(5,8,5,0.98))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.6)] sm:p-7">
        <section className="grid min-w-0 gap-5 lg:grid-cols-3">
          {/* Pass shield and wage props to cards */}
          <SummaryCard amount={totalBalance} title="Total Balance" currency={userCurrency} salaryShield={salaryShield} hourlyWage={hourlyWage} />
          <SummaryCard accent="text-[#deff9a]" amount={monthlyIncome} title="Monthly Income" currency={userCurrency} salaryShield={salaryShield} hourlyWage={hourlyWage} />
          <SummaryCard accent="text-red-300" amount={monthlyExpenses} title="Monthly Expenses" currency={userCurrency} salaryShield={salaryShield} hourlyWage={hourlyWage} />
        </section>

        <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.95fr)]">
          <TransactionList
            onDeleteTransaction={onDeleteTransaction}
            onUpdateTransaction={onUpdateTransaction}
            transactions={transactions.filter((t) => !t.recurrent)}
            transactionsState={transactionsState}
            currency={userCurrency}
            salaryShield={salaryShield}
            hourlyWage={hourlyWage}
          />

          <div className="grid min-w-0 content-start gap-5">
            <AdvisorPanel
              monthlyExpenses={monthlyExpenses}
              transactions={transactions}
              sessionToken={session?.accessToken}
            />
            <RecurringPayments
              transactions={transactions}
              onDeleteTransaction={onDeleteTransaction}
              currency={userCurrency}
              salaryShield={salaryShield}
              hourlyWage={hourlyWage}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;