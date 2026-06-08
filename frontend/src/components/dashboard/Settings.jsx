import React, { useState } from "react";
import BrandMark from "../common/BrandMark";

function Settings({ session, onUpdateProfile, onLogout }) {
  // Account profile state
  const [username, setUsername] = useState(session?.user?.username || "");
  const [hourlyWage, setHourlyWage] = useState(session?.user?.hourlyWage || "15");

  // App-specific behavioral features state
  const [salaryShield, setSalaryShield] = useState(false);
  const [cooldownTimer, setCooldownTimer] = useState("24");
  const [advisorTone, setAdvisorTone] = useState("roast");
  const [preferredCurrency, setPreferredCurrency] = useState("EUR");

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile({ username, hourlyWage: Number(hourlyWage) });
    }
  };

  return (
    <div className="w-full max-w-[1200px] overflow-hidden rounded-3xl border border-[#202020] bg-[radial-gradient(circle_at_18%_5%,rgba(126,255,175,0.10),transparent_23rem),linear-gradient(145deg,rgba(12,22,13,0.96),rgba(0,0,0,0.94)_52%,rgba(6,14,7,0.96))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.6)] sm:p-10">

      {/* Header aligned symmetrically with Dashboard.jsx */}
      <header className="mb-8 flex items-end justify-between gap-5 border-b border-[#1a1a1a] pb-6 max-md:flex-col max-md:items-start">
        <div>
          <BrandMark />
          <h1 className="my-5 mb-0 text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-tight text-white">
            Settings
          </h1>
        </div>
      </header>

      {/* Main split grid container replicating the core layout spacing */}
      <main className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">

        {/* Left Column: Account Profile & Preferences configuration panels */}
        <div className="flex flex-col gap-6">

          {/* Section: Profile Metrics */}
          <section className="rounded-[20px] border border-[#222] bg-[#0a0a0a] p-5 sm:p-8">
            <div className="mb-6">
              <h2 className="m-0 text-[1.35rem] font-bold text-white">Account Metrics</h2>
              <p className="mt-1 text-xs font-bold uppercase text-[#daffde]/55">
                Update base values used for real-time transaction translations
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-[#daffde]/55">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="min-h-12 w-full rounded-[10px] border border-[#2b2b2b] bg-[#0b0b0b] px-4 text-base font-medium text-white placeholder-gray-600 transition focus:border-[#deff9a]/55 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-[#daffde]/55">Hourly Wage (€)</label>
                <input
                  type="number"
                  value={hourlyWage}
                  onChange={(e) => setHourlyWage(e.target.value)}
                  className="min-h-12 w-full rounded-[10px] border border-[#2b2b2b] bg-[#0b0b0b] px-4 text-base font-medium text-white placeholder-gray-600 transition focus:border-[#deff9a]/55 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="mt-2 min-h-12 w-full rounded-[10px] bg-[#DEFF9A] px-6 text-base font-bold text-black transition hover:bg-white hover:shadow-[0_0_15px_rgba(222,255,154,0.4)]"
              >
                Save Preferences
              </button>
            </form>
          </section>

          {/* Section: Advanced Behavioral Engine Toggles */}
          <section className="rounded-[20px] border border-[#222] bg-[#0a0a0a] p-5 sm:p-8">
            <div className="mb-6">
              <h2 className="m-0 text-[1.35rem] font-bold text-white">Moola Behavioral Engine</h2>
              <p className="mt-1 text-xs font-bold uppercase text-[#daffde]/55">
                Configure psychometric parameters for financial tracking
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {/* Feature Toggle: Salary Shield */}
              <div className="flex cursor-pointer items-center justify-between rounded-[16px] border border-[#1a1a1a] bg-[#000000] p-4">
                <div>
                  <span className="block text-base font-medium text-white">Salary Shield Mode 🛡️</span>
                  <span className="text-xs font-medium text-[#daffde]/55">Hide all absolute currency values and display exclusively in calculated labor hours.</span>
                </div>
                <input
                  type="checkbox"
                  checked={salaryShield}
                  onChange={(e) => setSalaryShield(e.target.checked)}
                  className="h-5 w-5 rounded-md border-gray-300 transition"
                  style={{ accentColor: "#DEFF9A" }}
                />
              </div>

              {/* Feature Dropdown: Impulse Purchase Freeze Time */}
              <div className="flex items-center justify-between rounded-[16px] border border-[#1a1a1a] bg-[#000000] p-4 max-sm:flex-col max-sm:items-start max-sm:gap-3">
                <div>
                  <span className="block text-base font-medium text-white">Impulse Buy Cooldown ⏳</span>
                  <span className="text-xs font-medium text-[#daffde]/55">Enforce a standard dynamic cooling period before log triggers process completely.</span>
                </div>
                <select
                  value={cooldownTimer}
                  onChange={(e) => setCooldownTimer(e.target.value)}
                  className="min-h-10 rounded-[8px] border border-[#2b2b2b] bg-[#0b0b0b] px-3 text-sm font-medium text-white transition focus:border-[#deff9a]/55 focus:outline-none"
                >
                  <option value="12">12 Hours</option>
                  <option value="24">24 Hours</option>
                  <option value="48">48 Hours</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: AI Model Personality Configuration & Session termination controls */}
        <section className="grid min-w-0 content-start gap-6 rounded-[20px] border border-[#222] bg-[#0a0a0a] p-5 sm:p-8">
          <div>
            <h2 className="m-0 text-[1.35rem] font-bold text-white mb-4">Advisor Framework</h2>
            <p className="text-sm font-medium text-[#daffde]/55 leading-relaxed mb-6">
              Adjust parameters controlling automated audit evaluation scripts.
            </p>
          </div>

          {/* Configuration Selector: AI Tonal Personality Profiles */}
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold uppercase text-[#daffde]/55">AI Personality Tone</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdvisorTone("roast")}
                className={`min-h-10 rounded-[8px] border font-bold text-xs transition ${
                  advisorTone === "roast"
                    ? "border-[#DEFF9A] bg-[#DEFF9A]/10 text-white"
                    : "border-[#2b2b2b] bg-[#0b0b0b] text-gray-400 hover:text-white"
                }`}
              >
                Roast Mode 🔥
              </button>
              <button
                type="button"
                onClick={() => setAdvisorTone("zen")}
                className={`min-h-10 rounded-[8px] border font-bold text-xs transition ${
                  advisorTone === "zen"
                    ? "border-[#DEFF9A] bg-[#DEFF9A]/10 text-white"
                    : "border-[#2b2b2b] bg-[#0b0b0b] text-gray-400 hover:text-white"
                }`}
              >
                Zen Balance 🧘
              </button>
            </div>
          </div>

          {/* Configuration Selector: Ledger Localization */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-[#daffde]/55">Primary Currency</label>
            <select
              value={preferredCurrency}
              onChange={(e) => setPreferredCurrency(e.target.value)}
              className="min-h-12 w-full rounded-[10px] border border-[#2b2b2b] bg-[#0b0b0b] px-4 text-base font-medium text-white transition focus:border-[#deff9a]/55 focus:outline-none"
            >
              <option value="EUR">Euro (€)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="GBP">British Pound (£)</option>
            </select>
          </div>

          <hr className="my-2 border-0 border-t border-[#1d1d1d]" />

          {/* Component Action: System Access Invalidation */}
          <div className="flex flex-col gap-2">
            <button
              onClick={onLogout}
              type="button"
              className="min-h-12 w-full rounded-[10px] border border-[#ff6b6b]/30 bg-[#ff6b6b]/5 px-4 text-base font-bold text(#ff6b6b) transition hover:border-[#ff6b6b] hover:bg-[#ff6b6b]/10"
              style={{ color: "#ff6b6b" }}
            >
              Disconnect Session (Logout)
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}

export default Settings;