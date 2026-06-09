import { useState, useRef, useEffect } from "react";
// Make sure to import fetchCategories!
import { createTransaction, fetchCategories } from "../../services/api";
import BrandMark from "../common/BrandMark";

function Home({ onAddTransaction, token }) {
  // --- STATE MANAGEMENT ---
  const [type, setType] = useState("EXPENSE"); // Toggles between EXPENSE and INCOME
  const [currency, setCurrency] = useState("EUR");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  // NEW: State to hold database categories
  const [userCategories, setUserCategories] = useState([]);

  // Behavioral flags
  const [impulseBuy, setImpulseBuy] = useState(false);
  const [regret, setRegret] = useState(false);
  const [recurrent, setRecurrent] = useState(false);

  // UI States
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const amountInputRef = useRef(null);

  const currencySymbols = { EUR: "€", USD: "$", GBP: "£", JPY: "¥", CNY: "元" };
  const activePlaceholder = type === "INCOME" ? "I made ..." : "I spent ...";

  const giantTextClasses = "text-6xl sm:text-8xl md:text-9xl font-black leading-none tracking-normal";

  // --- LIFECYCLE: Fetch categories on load ---
  useEffect(() => {
    amountInputRef.current?.focus();

    const loadCategories = async () => {
      try {
        if (token) {
          const fetchedCats = await fetchCategories(token);
          setUserCategories(fetchedCats);
        }
      } catch (error) {
        console.error("Could not load custom categories:", error);
      }
    };

    loadCategories();
  }, [token]);

  const showToast = (message, toastType = "success") => {
    setToast({ visible: true, message, type: toastType });
    setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 4000);
  };

  // --- HANDLERS ---
  const handleAmountChange = (e) => {
    let val = e.target.value.replace(/[^0-9.]/g, "");
    const parts = val.split(".");
    if (parts.length > 2) val = parts[0] + "." + parts.slice(1).join("");
    setAmount(val);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setSubmitError("Please enter a valid amount greater than 0.");
      setIsSubmitting(false);
      return;
    }

    const newTransaction = {
      amount: numericAmount,
      currency,
      category: category.trim() || "General",
      date: new Date().toISOString().split("T")[0],
      description: description.trim() || (type === "INCOME" ? "Income Log" : "Expense Log"),
      impulseBuy: type === "EXPENSE" ? impulseBuy : false,
      isImpulseBuy: type === "EXPENSE" ? impulseBuy : false,
      isRecurrent: recurrent,
      isRegret: type === "EXPENSE" ? regret : false,
      recurrent: recurrent,
      regret: type === "EXPENSE" ? regret : false,
      type,
    };

    try {
      const savedTransaction = await createTransaction(token, newTransaction);
      onAddTransaction(savedTransaction);

      // If the user typed a brand new category, immediately add it to our local list
      // so it shows up in the dropdown next time without needing a page refresh!
      const newCatName = newTransaction.category;
      if (!userCategories.find(c => c.name.toLowerCase() === newCatName.toLowerCase())) {
        setUserCategories(prev => [...prev, { name: newCatName }]);
      }

      showToast("Transaction saved successfully!");

      // Reset form
      setAmount("");
      setCategory("");
      setDescription("");
      setImpulseBuy(false);
      setRegret(false);
      setRecurrent(false);
      setTimeout(() => amountInputRef.current?.focus(), 50);
    } catch (error) {
      setSubmitError(error.message || "Failed to save transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- DYNAMIC DROPDOWN LOGIC ---
  const defaultExpenseCats = ["Food & Dining", "Groceries", "Transportation", "Entertainment", "Utilities", "Shopping"];
  const defaultIncomeCats = ["Salary", "Freelance", "Investments", "Gift"];

  const currentDefaults = type === "EXPENSE" ? defaultExpenseCats : defaultIncomeCats;
  const dbCategoryNames = userCategories.map(c => c.name);

  // Combine databases categories with defaults and remove duplicates automatically
  const combinedCategories = [...new Set([...dbCategoryNames, ...currentDefaults])];

  return (
      <>
        <style dangerouslySetInnerHTML={{ __html: `
        @keyframes auroraFlow {
          0% { background-position: 50% 35%; }
          50% { background-position: 50% 65%; }
          100% { background-position: 50% 35%; }
        }
        .animate-aurora {
          background: radial-gradient(circle at center, rgba(126, 255, 175, 0.12), transparent 70rem), 
                      linear-gradient(145deg, rgba(12, 22, 13, 0.98), rgba(0, 0, 0, 0.95) 52%, rgba(6, 14, 7, 0.98));
          background-size: 150% 150%;
          animation: auroraFlow 30s ease-in-out infinite;
          background-attachment: fixed;
        }
      `}} />

        <div className="relative w-full min-h-[85vh] flex flex-col items-center p-5 sm:p-12 transition-all duration-300 rounded-3xl border border-[#202020] shadow-[0_24px_80px_rgba(0,0,0,0.6)] animate-aurora">

          {toast.visible && (
              <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 flex items-center px-6 py-4 rounded-2xl border border-[#deff9a]/30 bg-[#121c15]/95 text-[#deff9a] backdrop-blur-xl shadow-2xl">
                <span className="text-base font-black uppercase tracking-wider">✓ SUCCESS: </span>
                <span className="text-base font-bold ml-2 text-white">{toast.message}</span>
              </div>
          )}

          <header className="absolute top-8 left-8 sm:top-12 sm:left-12 pointer-events-none w-full">
            <BrandMark />
            <h1 className="mt-1 text-3xl font-black text-white">Home</h1>
          </header>

          <main className="flex-1 flex flex-col items-center justify-center w-full mt-20 sm:mt-0">
            <form onSubmit={handleSubmit} className="w-full max-w-4xl flex flex-col items-center justify-center">

              <div className="flex bg-[#121614] p-1.5 border border-[#1f2421] rounded-2xl mb-12 shadow-inner hover:border-[#333] transition-all">
                {['INCOME', 'EXPENSE'].map((t) => {
                  const isSelected = type === t;
                  const activeClasses = t === "INCOME"
                      ? "bg-[#2a3627] text-[#DEFF9A] shadow-[0_4px_20px_rgba(222,255,154,0.15)]"
                      : "bg-[#3a1a1a] text-[#ff6b6b] shadow-[0_4px_20px_rgba(255,107,107,0.15)]";

                  return (
                      <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setType(t);
                            setSubmitError("");
                            setTimeout(() => amountInputRef.current?.focus(), 20);
                          }}
                          className={`px-8 py-2.5 text-sm font-extrabold rounded-xl uppercase tracking-wider transition-all duration-300 ${
                              isSelected ? activeClasses : "text-gray-500 hover:text-gray-300"
                          }`}
                      >
                        {t}
                      </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-center w-full mb-12 px-4">
                <div className="flex flex-row items-center justify-center">

                  <div className="relative group cursor-pointer shrink-0 mr-3 sm:mr-5">
                  <span className={`${giantTextClasses} text-white group-hover:text-[#DEFF9A] transition-colors drop-shadow-md`}>
                    {currencySymbols[currency]}
                  </span>
                    <select
                        value={currency}
                        onChange={(e) => { setCurrency(e.target.value); amountInputRef.current?.focus(); }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    >
                      {Object.keys(currencySymbols).map(c => (
                          <option key={c} value={c} className="text-black bg-white text-base">
                            {c}
                          </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative grid items-center justify-items-start">
                  <span className={`${giantTextClasses} text-transparent whitespace-pre pointer-events-none`}>
                    {amount || activePlaceholder}
                  </span>
                    {!amount && (
                        <span className={`${giantTextClasses} text-[#424c45] pointer-events-none absolute left-0`}>
                      {activePlaceholder}
                    </span>
                    )}
                    <input
                        ref={amountInputRef}
                        type="text"
                        inputMode="decimal"
                        value={amount}
                        onChange={handleAmountChange}
                        disabled={isSubmitting}
                        className={`absolute inset-0 bg-transparent border-none outline-none p-0 text-white text-left drop-shadow-md ${giantTextClasses}`}
                    />
                  </div>

                </div>
              </div>

              <div className="w-full max-w-[320px] flex flex-col gap-3 mb-8">

                <input
                    list="category-options"
                    className="min-h-12 w-full text-center rounded-[12px] border border-[#2b2b2b] bg-[#0b0b0b]/80 px-4 text-sm font-bold text-[#DEFF9A] placeholder-gray-600 transition-all focus:border-[#deff9a] focus:ring-1 focus:ring-[#deff9a] focus:outline-none backdrop-blur-md"
                    onChange={(event) => setCategory(event.target.value)}
                    placeholder="Category (Select or Type)"
                    type="text"
                    value={category}
                    disabled={isSubmitting}
                />
                <datalist id="category-options">
                  {/* NOW POPULATED DYNAMICALLY! */}
                  {combinedCategories.map(catName => (
                      <option key={catName} value={catName} />
                  ))}
                </datalist>

                <input
                    className="min-h-12 w-full text-center rounded-[12px] border border-[#2b2b2b] bg-[#0b0b0b]/80 px-4 text-base font-medium text-white placeholder-gray-600 transition-all focus:border-[#deff9a] focus:ring-1 focus:ring-[#deff9a] focus:outline-none backdrop-blur-md"
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Description (Optional)"
                    type="text"
                    value={description}
                    disabled={isSubmitting}
                />
              </div>

              <div className={`flex gap-4 mb-10 transition-all duration-500 overflow-hidden ${type === "EXPENSE" ? "opacity-100 max-h-20" : "opacity-0 max-h-0"}`}>
                <label className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-5 py-3 transition-all duration-200 ${
                    impulseBuy ? "border-[#DEFF9A] bg-[#DEFF9A]/10" : "border-[#1a1a1a] bg-[#000000]/50 hover:border-[#333]"
                }`}>
                  <input
                      checked={impulseBuy}
                      className="h-4 w-4 cursor-pointer"
                      onChange={(e) => setImpulseBuy(e.target.checked)}
                      style={{ accentColor: "#DEFF9A" }}
                      type="checkbox"
                      disabled={isSubmitting || type === "INCOME"}
                  />
                  <span className={`text-sm font-bold tracking-wide ${impulseBuy ? "text-[#DEFF9A]" : "text-gray-400"}`}>⚡ Impulse</span>
                </label>

                <label className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-5 py-3 transition-all duration-200 ${
                    regret ? "border-[#ff6b6b] bg-[#ff6b6b]/10" : "border-[#1a1a1a] bg-[#000000]/50 hover:border-[#333]"
                }`}>
                  <input
                      checked={regret}
                      className="h-4 w-4 cursor-pointer"
                      onChange={(e) => setRegret(e.target.checked)}
                      style={{ accentColor: "#ff6b6b" }}
                      type="checkbox"
                      disabled={isSubmitting || type === "INCOME"}
                  />
                  <span className={`text-sm font-bold tracking-wide ${regret ? "text-[#ff6b6b]" : "text-gray-400"}`}>😣 Regret</span>
                </label>

                <label className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-5 py-3 transition-all duration-200 ${
                      recurrent
                        ? "border-[#8fe9ff] bg-[#8fe9ff]/10"
                        : "border-[#1a1a1a] bg-[#000000]/50 hover:border-[#333]"
                    }`}
                  >
                    <input
                      checked={recurrent}
                      className="h-4 w-4 cursor-pointer"
                      onChange={(e) => setRecurrent(e.target.checked)}
                      type="checkbox"
                      disabled={isSubmitting}
                    />
                    <span
                      className={`text-sm font-bold tracking-wide ${
                        recurrent ? "text-[#8fe9ff]" : "text-gray-400"
                      }`}
                    >
                      🔄 Recurring
                    </span>
                  </label>

              </div>

              {submitError && (
                  <div className="mb-6 rounded-xl border border-red-500/30 bg-[#2a0e0e] px-5 py-3 text-sm font-bold text-[#ff6b6b]">
                    ⚠️ {submitError}
                  </div>
              )}

              <button
                  className={`min-h-14 w-full max-w-[280px] rounded-2xl px-6 text-sm font-black uppercase tracking-widest text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      type === "INCOME"
                          ? "bg-[#DEFF9A] hover:bg-white hover:shadow-[0_0_30px_rgba(222,255,154,0.4)]"
                          : "bg-[#ff6b6b] text-white hover:bg-[#ff8585] hover:shadow-[0_0_30px_rgba(255,107,107,0.4)]"
                  }`}
                  type="submit"
                  disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : `Log ${type}`}
              </button>

            </form>
          </main>
        </div>
      </>
  );
}

export default Home;