import React, { useState, useEffect } from "react";
import BrandMark from "../common/BrandMark";

function Settings({ session, onUpdateProfile, onLogout }) {
  // Safely extract properties by checking fallback paths from buildSession
  const initialUsername = session?.username || session?.user?.username || "";
  const initialHourlyWage = session?.user?.hourlyWage || session?.hourlyWage || "15";
  const initialTone = session?.user?.advisorTone || session?.advisorTone || "roast";
  const initialCurrency = session?.user?.preferredCurrency || session?.preferredCurrency || "EUR";

  // Extract initial shield state
  const initialShield = session?.user?.salaryShield || session?.salaryShield || false;

  // State initialization
  const [username, setUsername] = useState(initialUsername);
  const [hourlyWage, setHourlyWage] = useState(initialHourlyWage);
  const [salaryShield, setSalaryShield] = useState(initialShield);
  const [cooldownTimer, setCooldownTimer] = useState("24");
  const [advisorTone, setAdvisorTone] = useState(initialTone);
  const [preferredCurrency, setPreferredCurrency] = useState(initialCurrency);

  // Synchronize component state values smoothly when routing or mutating parent context
  useEffect(() => {
    if (session) {
      setUsername(session?.username || session?.user?.username || "");
      setHourlyWage(session?.user?.hourlyWage || session?.hourlyWage || "15");
      setAdvisorTone(session?.user?.advisorTone || session?.advisorTone || "roast");
      setPreferredCurrency(session?.user?.preferredCurrency || session?.preferredCurrency || "EUR");
      setSalaryShield(session?.user?.salaryShield || session?.salaryShield || false);
    }
  }, [session]);

  const handleCurrencyChange = (e) => {
    const newCurrency = e.target.value;
    setPreferredCurrency(newCurrency);
    if (onUpdateProfile) {
      onUpdateProfile({
        username,
        hourlyWage: Number(hourlyWage),
        advisorTone,
        preferredCurrency: newCurrency,
        salaryShield
      });
    }
  };

  const handleToneChange = (newTone) => {
    setAdvisorTone(newTone);
    if (onUpdateProfile) {
      onUpdateProfile({
        username,
        hourlyWage: Number(hourlyWage),
        advisorTone: newTone,
        preferredCurrency,
        salaryShield
      });
    }
  };

  // Auto-save the shield toggle instantly
  const handleShieldChange = (e) => {
    const isEnabled = e.target.checked;
    setSalaryShield(isEnabled);
    if (onUpdateProfile) {
      onUpdateProfile({
        username,
        hourlyWage: Number(hourlyWage),
        advisorTone,
        preferredCurrency,
        salaryShield: isEnabled
      });
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    console.log("-> Save-Button pressed! Sending Data:", { username, hourlyWage, advisorTone });

    if (onUpdateProfile) {
      onUpdateProfile({
        username,
        hourlyWage: Number(hourlyWage),
        advisorTone,
        preferredCurrency,
        salaryShield
      });
    } else {
      console.error("-> ERROR: onUpdateProfile is not sent to Settings!");
    }
  };

  return (
    <div className="w-full max-w-[1200px] overflow-hidden rounded-3xl border border-[#202020] bg-[radial-gradient(circle_at_18%_5%,rgba(126,255,175,0.10),transparent_23rem),linear-gradient(145deg,rgba(12,22,13,0.96),rgba(0,0,0,0.94)_52%,rgba(6,14,7,0.96))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.6)] sm:p-10">
      <header className="mb-8 flex items-end justify-between gap-5 border-b border-[#1a1a1a] pb-6 max-md:flex-col max-md:items-start">
        <div>
          <BrandMark />
          <h1 className="my-5 mb-0 text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-tight text-white">
            Settings
          </h1>
        </div>
      </header>

      <main className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <div className="flex flex-col gap-6">

          {/* Section: Profile Info */}
          <section className="rounded-[20px] border border-[#222] bg-[#0a0a0a] p-5 sm:p-8">
            <div className="mb-6">
              <h2 className="m-0 text-[1.35rem] font-bold text-white">Profile Details</h2>
              <p className="mt-1 text-xs font-bold uppercase text-[#daffde]/55">
                Update your personal info and base hourly pay.
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
                <label className="text-xs font-bold uppercase text-[#daffde]/55">Hourly Wage</label>
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
                Save Profile Info
              </button>
            </form>
          </section>

          {/* Section: App Features */}
          <section className="rounded-[20px] border border-[#222] bg-[#0a0a0a] p-5 sm:p-8">
            <div className="mb-6">
              <h2 className="m-0 text-[1.35rem] font-bold text-white">App Features</h2>
              <p className="mt-1 text-xs font-bold uppercase text-[#daffde]/55">
                Adjust how the app helps you manage your money.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex cursor-pointer items-center justify-between rounded-[16px] border border-[#1a1a1a] bg-[#000000] p-4">
                <div>
                  <span className="block text-base font-medium text-white">Salary Shield 🛡️</span>
                  <span className="text-xs font-medium text-[#daffde]/55">Hide currency amounts and show them as hours worked instead.</span>
                </div>
                <input
                  type="checkbox"
                  checked={salaryShield}
                  onChange={handleShieldChange}
                  className="h-5 w-5 rounded-md border-gray-300 transition"
                  style={{ accentColor: "#DEFF9A" }}
                />
              </div>

              <div className="flex items-center justify-between rounded-[16px] border border-[#1a1a1a] bg-[#000000] p-4 max-sm:flex-col max-sm:items-start max-sm:gap-3">
                <div>
                  <span className="block text-base font-medium text-white">Impulse Buy Cooldown ⏳</span>
                  <span className="text-xs font-medium text-[#daffde]/55">Set a waiting period to think over impulse purchases.</span>
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

        {/* Right Column: AI & Settings */}
        <section className="grid min-w-0 content-start gap-6 rounded-[20px] border border-[#222] bg-[#0a0a0a] p-5 sm:p-8">
          <div>
            <h2 className="mb-4 m-0 text-[1.35rem] font-bold text-white">AI Advisor</h2>
            <p className="mb-6 text-sm font-medium leading-relaxed text-[#daffde]/55">
              Choose how the AI talks to you about your spending.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold uppercase text-[#daffde]/55">AI Tone</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleToneChange("roast")}
                className={`min-h-10 rounded-[8px] border text-xs font-bold transition ${
                  advisorTone === "roast"
                    ? "border-[#DEFF9A] bg-[#DEFF9A]/10 text-white"
                    : "border-[#2b2b2b] bg-[#0b0b0b] text-gray-400 hover:text-white"
                }`}
              >
                Roast Mode 🔥
              </button>
              <button
                type="button"
                onClick={() => handleToneChange("zen")}
                className={`min-h-10 rounded-[8px] border text-xs font-bold transition ${
                  advisorTone === "zen"
                    ? "border-[#DEFF9A] bg-[#DEFF9A]/10 text-white"
                    : "border-[#2b2b2b] bg-[#0b0b0b] text-gray-400 hover:text-white"
                }`}
              >
                Zen Balance 🧘
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-[#daffde]/55">Primary Currency</label>
            <select
              value={preferredCurrency}
              onChange={handleCurrencyChange}
              className="min-h-12 w-full rounded-[10px] border border-[#2b2b2b] bg-[#0b0b0b] px-4 text-base font-medium text-white transition focus:border-[#deff9a]/55 focus:outline-none"
            >
              <option value="EUR">Euro (€)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="GBP">British Pound (£)</option>
            </select>
          </div>

          <hr className="my-2 border-0 border-t border-[#1d1d1d]" />

          <div className="flex flex-col gap-2">
            <button
              onClick={onLogout}
              type="button"
              className="min-h-12 w-full rounded-[10px] border border-[#ff6b6b]/30 bg-[#ff6b6b]/5 px-4 text-base font-bold transition hover:border-[#ff6b6b] hover:bg-[#ff6b6b]/10"
              style={{ color: "#ff6b6b" }}
            >
              Log Out
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Settings;