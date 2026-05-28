import AccountMeta from "./AccountMeta";
import AdvisorPanel from "./AdvisorPanel";
import BrandMark from "../common/BrandMark";
import TransactionList from "./TransactionList";

function Dashboard({ session, transactions, transactionsState, onLogout }) {
  const hourlyWage = session.user.hourlyWage || 15;

  return (
    <div className="w-full max-w-[1200px] overflow-hidden rounded-3xl border border-[#202020] bg-[radial-gradient(circle_at_18%_5%,rgba(126,255,175,0.10),transparent_23rem),linear-gradient(145deg,rgba(12,22,13,0.96),rgba(0,0,0,0.94)_52%,rgba(6,14,7,0.96))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.6)] sm:p-10">
      <header className="mb-8 flex items-end justify-between gap-5 border-b border-[#1a1a1a] pb-6 max-md:flex-col max-md:items-start">
        <div>
          <BrandMark />
          <h1 className="my-5 mb-0 text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-tight text-white">
            Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3.5 max-sm:flex-col max-sm:items-start">
          <div className="grid gap-1 text-right max-md:text-left">
            <span className="text-xs font-bold uppercase text-[#daffde]/55">Signed in as</span>
            <strong className="text-base font-bold text-white">{session.user.username}</strong>
          </div>
          <button
            className="min-h-12 min-w-24 rounded-[10px] border border-[#2b2b2b] bg-[#0b0b0b] px-4 font-bold text-white transition hover:border-[#deff9a]/55"
            onClick={onLogout}
            type="button"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <TransactionList
          hourlyWage={hourlyWage}
          transactions={transactions}
          transactionsState={transactionsState}
        />

        <section className="grid min-w-0 content-start gap-6 rounded-[20px] border border-[#222] bg-[#0a0a0a] p-5 sm:p-8">
          <AdvisorPanel />

          <hr className="border-0 border-t border-[#1d1d1d]" />

          <div className="grid gap-3.5">
            <h2 className="m-0 text-[1.35rem] font-bold text-white">Account Meta</h2>
            <dl className="m-0">
              <AccountMeta session={session} />
            </dl>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
