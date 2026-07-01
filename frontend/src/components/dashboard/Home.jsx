import { useState, useRef, useEffect } from "react";
import { createTransaction, fetchCategories } from "../../services/api";
import BrandMark from "../common/BrandMark";

function Home({ onAddTransaction, token }) {
  const [type, setType] = useState("EXPENSE");
  const [currency, setCurrency] = useState("EUR");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [userCategories, setUserCategories] = useState([]);

  const [impulseBuy, setImpulseBuy] = useState(false);
  const [regret, setRegret] = useState(false);
  const [recurrent, setRecurrent] = useState(false);

  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const amountInputRef = useRef(null);

  const currencySymbols = { EUR: "€", USD: "$", GBP: "£", JPY: "¥", CNY: "元" };
  const activePlaceholder = type === "INCOME" ? "I made ..." : "I spent ...";

  const giantTextClasses = "text-6xl sm:text-8xl md:text-9xl font-black leading-none tracking-normal";

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
      recurrent,
      regret: type === "EXPENSE" ? regret : false,
      type,
    };

    try {
      const savedTransaction = await createTransaction(token, newTransaction);
      onAddTransaction(savedTransaction);

      const newCatName = newTransaction.category;
      if (!userCategories.find(c => c.name.toLowerCase() === newCatName.toLowerCase())) {
        setUserCategories(prev => [...prev, { name: newCatName }]);
      }

      showToast("Transaction saved successfully!");

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

  const defaultExpenseCats = ["Food & Dining", "Groceries", "Transportation", "Entertainment", "Utilities", "Shopping"];
  const defaultIncomeCats = ["Salary", "Freelance", "Investments", "Gift"];
  const currentDefaults = type === "EXPENSE" ? defaultExpenseCats : defaultIncomeCats;
  const dbCategoryNames = userCategories.map(c => c.name);
  const combinedCategories = [...new Set([...dbCategoryNames, ...currentDefaults])];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes auroraFlow {
          0% { background-position: 50% 35%; }
          50% { background-position: 50% 65%; }
          100% { background-position: 50% 35%; }
        }
        .dark .animate-aurora {
          background: radial-gradient(circle at center, rgba(126, 255, 175, 0.12), transparent 70rem),
                      linear-gradient(145deg, rgba(12, 22, 13, 0.98), rgba(0, 0, 0, 0.95) 52%, rgba(6, 14, 7, 0.98));
          background-size: 150% 150%;
          animation: auroraFlow 30s ease-in-out infinite;
          background-attachment: fixed;
        }
      `}} />

      <div className="relative w-full min-h-[85vh] flex flex-col items-center p-5 sm:p-12 transition-all duration-300 rounded-3xl border border-gray-200 bg-gray-50 shadow-sm dark:border-[#202020] dark:bg-transparent dark:shadow-[0_24px_80px_rgba(0,0,0,0.6)] animate-aurora">

        {toast.visible && (
          <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 flex items-center px-6 py-4 rounded-2xl border border-green-300 bg-white/95 text-green-700 backdrop-blur-xl shadow-lg dark:border-[#deff9a]/30 dark:bg-[#121c15]/95 dark:text-[#deff9a]">
            <span className="text-base font-black uppercase tracking-wider">✓ SUCCESS: </span>
            <span className="text-base font-bold ml-2 text-black dark:text-white">{toast.message}</span>
          </div>
        )}

        <header className="absolute top-8 left-8 sm:top-12 sm:left-12 pointer-events-none w-full">
          <BrandMark />
          <h1 className="mt-1 text-3xl font-black text-black dark:text-white">Home</h1>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center w-full mt-20 sm:mt-0">
          <form onSubmit={handleSubmit} className="w-full max-w-4xl flex flex-col items-center justify-center">

            <div className="flex bg-gray-200 p-1.5 border border-gray-300 rounded-2xl mb-12 shadow-inner transition-all dark:border-[#1f2421] dark:bg-[#121614]">
              {['INCOME', 'EXPENSE'].map((t) => {
                const isSelected = type === t;
                const activeClasses = t === "INCOME"
                    ? "bg-white text-green-700 shadow-sm dark:bg-[#2a3627] dark:text-[#DEFF9A] dark:shadow-[0_4px_20px_rgba(222,255,154,0.15)]"
                    : "bg-white text-red-600 shadow-sm dark:bg-[#3a1a1a] dark:text-[#ff6b6b] dark:shadow-[0_4px_20px_rgba(255,107,107,0.15)]";

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
                      isSelected ? activeClasses : "text-gray-500 hover:text-black dark:text-gray-500 dark:hover:text-gray-300"
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
                  <span className={`${giantTextClasses} text-black transition-colors drop-shadow-sm group-hover:text-green-600 dark:text-white dark:drop-shadow-md dark:group-hover:text-[#DEFF9A]`}>
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
                    <span className={`${giantTextClasses} text-gray-400 pointer-events-none absolute left-0 dark:text-[#424c45]`}>
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
                    className={`absolute inset-0 bg-transparent border-none outline-none p-0 text-black text-left drop-shadow-sm dark:text-white dark:drop-shadow-md ${giantTextClasses}`}
                  />
                </div>

              </div>
            </div>

            <div className="w-full max-w-[320px] flex flex-col gap-3 mb-8">
              <input
                list="category-options"
                className="min-h-12 w-full text-center rounded-[12px] border border-gray-300 bg-white/80 px-4 text-sm font-bold text-green-700 placeholder-gray-500 transition-all focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-[#2b2b2b] dark:bg-[#0b0b0b]/80 dark:text-[#DEFF9A] dark:placeholder-gray-600 dark:focus:border-[#deff9a] dark:focus:ring-[#deff9a] backdrop-blur-md"
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Category (Select or Type)"
                type="text"
                value={category}
                disabled={isSubmitting}
              />
              <datalist id="category-options">
                {combinedCategories.map(catName => (
                  <option key={catName} value={catName} />
                ))}
              </datalist>

              <input
                className="min-h-12 w-full text-center rounded-[12px] border border-gray-300 bg-white/80 px-4 text-base font-medium text-black placeholder-gray-500 transition-all focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-[#2b2b2b] dark:bg-[#0b0b0b]/80 dark:text-white dark:placeholder-gray-600 dark:focus:border-[#deff9a] dark:focus:ring-[#deff9a] backdrop-blur-md"
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Description (Optional)"
                type="text"
                value={description}
                disabled={isSubmitting}
              />
            </div>

            <div className={`flex gap-4 mb-10 transition-all duration-500 overflow-hidden ${type === "EXPENSE" ? "opacity-100 max-h-20" : "opacity-0 max-h-0"}`}>
              <label className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-5 py-3 transition-all duration-200 ${
                impulseBuy ? "border-green-500 bg-green-50 dark:border-[#DEFF9A] dark:bg-[#DEFF9A]/10" : "border-gray-300 bg-gray-50 hover:border-gray-400 dark:border-[#1a1a1a] dark:bg-[#000000]/50 dark:hover:border-[#333]"
              }`}>
                <input
                  checked={impulseBuy}
                  className="h-4 w-4 cursor-pointer"
                  onChange={(e) => setImpulseBuy(e.target.checked)}
                  style={{ accentColor: "#DEFF9A" }}
                  type="checkbox"
                  disabled={isSubmitting || type === "INCOME"}
                />
                <span className={`text-sm font-bold tracking-wide ${impulseBuy ? "text-green-700 dark:text-[#DEFF9A]" : "text-gray-500 dark:text-gray-400"}`}>⚡ Impulse</span>
              </label>

              <label className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-5 py-3 transition-all duration-200 ${
                regret ? "border-red-500 bg-red-50 dark:border-[#ff6b6b] dark:bg-[#ff6b6b]/10" : "border-gray-300 bg-gray-50 hover:border-gray-400 dark:border-[#1a1a1a] dark:bg-[#000000]/50 dark:hover:border-[#333]"
              }`}>
                <input
                  checked={regret}
                  className="h-4 w-4 cursor-pointer"
                  onChange={(e) => setRegret(e.target.checked)}
                  style={{ accentColor: "#ff6b6b" }}
                  type="checkbox"
                  disabled={isSubmitting || type === "INCOME"}
                />
                <span className={`text-sm font-bold tracking-wide ${regret ? "text-red-600 dark:text-[#ff6b6b]" : "text-gray-500 dark:text-gray-400"}`}>😣 Regret</span>
              </label>

              <label className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-5 py-3 transition-all duration-200 ${
                recurrent
                  ? "border-blue-400 bg-blue-50 dark:border-[#8fe9ff] dark:bg-[#8fe9ff]/10"
                  : "border-gray-300 bg-gray-50 hover:border-gray-400 dark:border-[#1a1a1a] dark:bg-[#000000]/50 dark:hover:border-[#333]"
              }`}>
                <input
                  checked={recurrent}
                  className="h-4 w-4 cursor-pointer"
                  onChange={(e) => setRecurrent(e.target.checked)}
                  type="checkbox"
                  disabled={isSubmitting}
                />
                <span
                  className={`text-sm font-bold tracking-wide ${
                    recurrent ? "text-blue-600 dark:text-[#8fe9ff]" : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  🔄 Recurring
                </span>
              </label>
            </div>

            {submitError && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-bold text-red-600 dark:border-red-500/30 dark:bg-[#2a0e0e] dark:text-[#ff6b6b]">
                ⚠️ {submitError}
              </div>
            )}

            <button
              className={`min-h-14 w-full max-w-[280px] rounded-2xl px-6 text-sm font-black uppercase tracking-widest text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                type === "INCOME"
                  ? "bg-[#DEFF9A] hover:bg-green-400 hover:shadow-[0_0_30px_rgba(222,255,154,0.4)] dark:hover:bg-white"
                  : "bg-[#ff6b6b] text-white hover:bg-red-500 hover:shadow-[0_0_30px_rgba(255,107,107,0.4)] dark:hover:bg-[#ff8585]"
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