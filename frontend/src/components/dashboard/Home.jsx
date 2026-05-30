import React, { useState } from "react";
import BrandMark from "../common/BrandMark";

function Home({ onAddTransaction }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [impulseBuy, setImpulseBuy] = useState(false);
  const [regret, setRegret] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    // Construct transaction data object
    const newTransaction = {
      id: Date.now(),
      description,
      amount: parseFloat(amount),
      impulseBuy,
      regret,
      date: new Date().toISOString(),
    };

    onAddTransaction(newTransaction);

    // Reset component form state
    setDescription("");
    setAmount("");
    setImpulseBuy(false);
    setRegret(false);
  };

  return (
    <div className="w-full max-w-[1200px] overflow-hidden rounded-3xl border border-[#202020] bg-[radial-gradient(circle_at_18%_5%,rgba(126,255,175,0.10),transparent_23rem),linear-gradient(145deg,rgba(12,22,13,0.96),rgba(0,0,0,0.94)_52%,rgba(6,14,7,0.96))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.6)] sm:p-10">

      <header className="mb-8 flex items-end justify-between gap-5 border-b border-[#1a1a1a] pb-6 max-md:flex-col max-md:items-start">
        <div>
          <BrandMark />
          <h1 className="my-5 mb-0 text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-tight text-white">
            Home
          </h1>
        </div>
      </header>

      {/* Grid structure exactly mirrors the minmax layout of Dashboard.jsx */}
      <main className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">

        <section className="rounded-[20px] border border-[#222] bg-[#0a0a0a] p-5 sm:p-8">
          <div className="mb-6">
            <h2 className="m-0 text-[1.35rem] font-bold text-white">Log Expense</h2>
            <p className="mt-1 text-xs font-bold uppercase text-[#daffde]/55">
              Track choices and transparently record your behavioral triggers
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-[#daffde]/55">Vendor Description</label>
              <input
                type="text"
                placeholder="e.g., Netflix Subscription, Starbucks Coffee"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-12 w-full rounded-[10px] border border-[#2b2b2b] bg-[#0b0b0b] px-4 text-base font-medium text-white placeholder-gray-600 transition focus:border-[#deff9a]/55 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-[#daffde]/55">Amount (€)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="min-h-12 w-full rounded-[10px] border border-[#2b2b2b] bg-[#0b0b0b] px-4 text-base font-medium text-white placeholder-gray-600 transition focus:border-[#deff9a]/55 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="mt-2 min-h-12 w-full rounded-[10px] bg-[#DEFF9A] px-6 text-base font-bold text-black transition hover:bg-white hover:shadow-[0_0_15px_rgba(222,255,154,0.4)]"
            >
              Save Transaction
            </button>
          </form>
        </section>

        {/* Content alignment using content-start matches the right-hand panel heights exactly */}
        <section className="grid min-w-0 content-start gap-6 rounded-[20px] border border-[#222] bg-[#0a0a0a] p-5 sm:p-8">
          <div>
            <h2 className="m-0 text-[1.35rem] font-bold text-white mb-4">Behavioral Tags</h2>
            <p className="text-sm font-medium text-[#daffde]/55 leading-relaxed mb-6">
              Flag habits instantly. Checked items apply dynamic visual metrics across your ledger dashboards.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <label className="flex cursor-pointer items-center justify-between rounded-[16px] border border-[#1a1a1a] bg-[#000000] p-4 transition hover:border-[#222]">
              <span className="text-base font-medium text-white">Impulse Buy ⚡</span>
              <input
                type="checkbox"
                checked={impulseBuy}
                onChange={(e) => setImpulseBuy(e.target.checked)}
                className="h-5 w-5 rounded-md border-gray-300 transition"
                style={{ accentColor: "#DEFF9A" }}
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-[16px] border border-[#1a1a1a] bg-[#000000] p-4 transition hover:border-[#222]">
              <span className="text-base font-medium text-white">Regret Tag 😣</span>
              <input
                type="checkbox"
                checked={regret}
                onChange={(e) => setRegret(e.target.checked)}
                className="h-5 w-5 rounded-md border-gray-300 transition"
                style={{ accentColor: "#ff6b6b" }}
              />
            </label>
          </div>
        </section>

      </main>
    </div>
  );
}

export default Home;