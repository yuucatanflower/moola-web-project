import React, { useState, useEffect } from "react";
import BrandMark from "../common/BrandMark";

function Settings({ session, onUpdateProfile, onLogout }) {
  // Safely extract properties by checking fallback paths from buildSession
  const initialUsername = session?.username || session?.user?.username || "";
  const initialHourlyWage = session?.user?.hourlyWage || session?.hourlyWage || "15";
  const initialTone = session?.user?.advisorTone || session?.advisorTone || "roast";
  const initialCurrency = session?.user?.preferredCurrency || session?.preferredCurrency || "EUR";
  const initialShield = session?.user?.salaryShield || session?.salaryShield || false;

  // State initialization
  const [username, setUsername] = useState(initialUsername);
  const [hourlyWage, setHourlyWage] = useState(initialHourlyWage);
  const [salaryShield, setSalaryShield] = useState(initialShield);
  const [cooldownTimer, setCooldownTimer] = useState("24");
  const [advisorTone, setAdvisorTone] = useState(initialTone);
  const [preferredCurrency, setPreferredCurrency] = useState(initialCurrency);
  const [appTheme, setAppTheme] = useState("dark"); // State for dropdown

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

  // Check current theme state on component mount
  useEffect(() => {
    setAppTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

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

  // Change theme class on the HTML root element via dropdown
  const handleThemeChange = (e) => {
    const selectedTheme = e.target.value;
    setAppTheme(selectedTheme);

    if (selectedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
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
    <div className="w-full max-w-[1200px] overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.1)] transition-colors dark:border-[#202020] dark:bg-[radial-gradient(circle_at_18%_5%,rgba(126,255,175,0.10),transparent_23rem),linear-gradient(145deg,rgba(12,22,13,0.96),rgba(0,0,0,0.94)_52%,rgba(6,14,7,0.96))] dark:shadow-[0_24px_80px_rgba(0,0,0,0.6)] sm:p-10">
      <header className="mb-8 flex items-end justify-between gap-5 border-b border-gray-200 pb-6 transition-colors max-md:flex-col max-md:items-start dark:border-[#1a1a1a]">
        <div>
          <BrandMark />
          <h1 className="my-5 mb-0 text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-tight text-black transition-colors dark:text-white">
            Settings
          </h1>
        </div>
      </header>

      <main className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <div className="flex flex-col gap-6">

          {/* Section: Profile Info */}
          <section className="rounded-[20px] border border-gray-200 bg-white p-5 transition-colors sm:p-8 dark:border-[#222] dark:bg-[#0a0a0a]">
            <div className="mb-6">
              <h2 className="m-0 text-[1.35rem] font-bold text-black transition-colors dark:text-white">Profile Details</h2>
              <p className="mt-1 text-xs font-bold uppercase text-gray-500 transition-colors dark:text-[#daffde]/55">
                Update your personal info and base hourly pay.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 transition-colors dark:text-[#daffde]/55">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="min-h-12 w-full rounded-[10px] border border-gray-300 bg-gray-50 px-4 text-base font-medium text-black placeholder-gray-400 transition focus:border-green-500 focus:outline-none dark:border-[#2b2b2b] dark:bg-[#0b0b0b] dark:text-white dark:placeholder-gray-600 dark:focus:border-[#deff9a]/55"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 transition-colors dark:text-[#daffde]/55">Hourly Wage</label>
                <input
                  type="number"
                  value={hourlyWage}
                  onChange={(e) => setHourlyWage(e.target.value)}
                  className="min-h-12 w-full rounded-[10px] border border-gray-300 bg-gray-50 px-4 text-base font-medium text-black placeholder-gray-400 transition focus:border-green-500 focus:outline-none dark:border-[#2b2b2b] dark:bg-[#0b0b0b] dark:text-white dark:placeholder-gray-600 dark:focus:border-[#deff9a]/55"
                />
              </div>

              <button
                type="submit"
                className="mt-2 min-h-12 w-full rounded-[10px] bg-[#DEFF9A] px-6 text-base font-bold text-black transition hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:hover:shadow-[0_0_15px_rgba(222,255,154,0.4)]"
              >
                Save Profile Info
              </button>
            </form>
          </section>

          {/* Section: App Features */}
          <section className="rounded-[20px] border border-gray-200 bg-white p-5 transition-colors sm:p-8 dark:border-[#222] dark:bg-[#0a0a0a]">
            <div className="mb-6">
              <h2 className="m-0 text-[1.35rem] font-bold text-black transition-colors dark:text-white">App Features</h2>
              <p className="mt-1 text-xs font-bold uppercase text-gray-500 transition-colors dark:text-[#daffde]/55">
                Adjust how the app helps you manage your money.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between rounded-[16px] border border-gray-200 bg-gray-50 p-4 transition-colors max-sm:flex-col max-sm:items-start max-sm:gap-3 dark:border-[#1a1a1a] dark:bg-[#000000]">
                <div>
                  <span className="block text-base font-medium text-black transition-colors dark:text-white">App Theme 🌗</span>
                  <span className="text-xs font-medium text-gray-500 transition-colors dark:text-[#daffde]/55">Switch between light and dark visual styles.</span>
                </div>
                <select
                  value={appTheme}
                  onChange={handleThemeChange}
                  className="min-h-10 rounded-[8px] border border-gray-300 bg-white px-3 text-sm font-medium text-black transition focus:border-green-500 focus:outline-none dark:border-[#2b2b2b] dark:bg-[#0b0b0b] dark:text-white dark:focus:border-[#deff9a]/55"
                >
                  <option value="dark">Dark Mode</option>
                  <option value="light">Light Mode</option>
                </select>
              </div>

              <div className="flex cursor-pointer items-center justify-between rounded-[16px] border border-gray-200 bg-gray-50 p-4 transition-colors dark:border-[#1a1a1a] dark:bg-[#000000]">
                <div>
                  <span className="block text-base font-medium text-black transition-colors dark:text-white">Salary Shield 🛡️</span>
                  <span className="text-xs font-medium text-gray-500 transition-colors dark:text-[#daffde]/55">Hide currency amounts and show them as hours worked instead.</span>
                </div>
                <input
                  type="checkbox"
                  checked={salaryShield}
                  onChange={handleShieldChange}
                  className="h-5 w-5 rounded-md border-gray-300 transition"
                  style={{ accentColor: "#DEFF9A" }}
                />
              </div>

              <div className="flex items-center justify-between rounded-[16px] border border-gray-200 bg-gray-50 p-4 transition-colors max-sm:flex-col max-sm:items-start max-sm:gap-3 dark:border-[#1a1a1a] dark:bg-[#000000]">
                <div>
                  <span className="block text-base font-medium text-black transition-colors dark:text-white">Impulse Buy Cooldown ⏳</span>
                  <span className="text-xs font-medium text-gray-500 transition-colors dark:text-[#daffde]/55">Set a waiting period to think over impulse purchases.</span>
                </div>
                <select
                  value={cooldownTimer}
                  onChange={(e) => setCooldownTimer(e.target.value)}
                  className="min-h-10 rounded-[8px] border border-gray-300 bg-white px-3 text-sm font-medium text-black transition focus:border-green-500 focus:outline-none dark:border-[#2b2b2b] dark:bg-[#0b0b0b] dark:text-white dark:focus:border-[#deff9a]/55"
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
        <section className="grid min-w-0 content-start gap-6 rounded-[20px] border border-gray-200 bg-white p-5 transition-colors sm:p-8 dark:border-[#222] dark:bg-[#0a0a0a]">
          <div>
            <h2 className="mb-4 m-0 text-[1.35rem] font-bold text-black transition-colors dark:text-white">AI Advisor</h2>
            <p className="mb-6 text-sm font-medium leading-relaxed text-gray-500 transition-colors dark:text-[#daffde]/55">
              Choose how the AI talks to you about your spending.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold uppercase text-gray-500 transition-colors dark:text-[#daffde]/55">AI Tone</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleToneChange("roast")}
                className={`min-h-10 rounded-[8px] border text-xs font-bold transition ${
                  advisorTone === "roast"
                    ? "border-[#DEFF9A] bg-[#DEFF9A] text-black dark:bg-[#DEFF9A]/10 dark:text-white"
                    : "border-gray-300 bg-gray-50 text-gray-500 hover:text-black dark:border-[#2b2b2b] dark:bg-[#0b0b0b] dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                Roast Mode 🔥
              </button>
              <button
                type="button"
                onClick={() => handleToneChange("zen")}
                className={`min-h-10 rounded-[8px] border text-xs font-bold transition ${
                  advisorTone === "zen"
                    ? "border-[#DEFF9A] bg-[#DEFF9A] text-black dark:bg-[#DEFF9A]/10 dark:text-white"
                    : "border-gray-300 bg-gray-50 text-gray-500 hover:text-black dark:border-[#2b2b2b] dark:bg-[#0b0b0b] dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                Zen Balance 🧘
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase text-gray-500 transition-colors dark:text-[#daffde]/55">Primary Currency</label>
            <select
              value={preferredCurrency}
              onChange={handleCurrencyChange}
              className="min-h-12 w-full rounded-[10px] border border-gray-300 bg-gray-50 px-4 text-base font-medium text-black transition focus:border-green-500 focus:outline-none dark:border-[#2b2b2b] dark:bg-[#0b0b0b] dark:text-white dark:focus:border-[#deff9a]/55"
            >
              <option value="EUR">Euro (€)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="GBP">British Pound (£)</option>
            </select>
          </div>

          <hr className="my-2 border-0 border-t border-gray-200 transition-colors dark:border-[#1d1d1d]" />

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