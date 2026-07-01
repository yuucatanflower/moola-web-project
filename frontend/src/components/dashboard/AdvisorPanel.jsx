import { useState } from "react";
import { formatAmount } from "../../utils/formatters";
import { fetchAiAdvice } from "../../services/api";

function AdvisorPanel({ monthlyExpenses, transactions, sessionToken }) {
  // Set a neutral default prompt
  const [currentPrompt, setCurrentPrompt] = useState("Analyze my spending.");
  const [advice, setAdvice] = useState(
    transactions.length
      ? `You logged ${formatAmount(monthlyExpenses)} in monthly spending. Review recurring purchases and regret-tagged expenses first.`
      : "Add transactions on Home to get spending advice based on your own account data."
  );
  const [isLoading, setIsLoading] = useState(false);

  // Trigger the API request to the backend AI service
  const handleAskAI = async (promptText) => {
    if (!transactions || transactions.length === 0) {
      setAdvice("No transactions found. Add some transactions first.");
      return;
    }

    setCurrentPrompt(promptText);
    setIsLoading(true);
    setAdvice("Analyzing your transaction data...");

    try {
      // Calls the backend AIService
      const aiResponse = await fetchAiAdvice(sessionToken, 30);
      setAdvice(aiResponse.advice || aiResponse);
    } catch (error) {
      setAdvice("Connection to the AI engine failed. " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex flex-col overflow-hidden rounded-[26px] border border-gray-200 bg-white shadow-lg transition-colors dark:border-none dark:bg-white/10 dark:shadow-[0_18px_50px_rgba(0,0,0,0.38)]">
      <div className="rounded-t-[26px] bg-gray-100 px-4 py-3 text-lg font-extrabold text-black transition-colors dark:bg-[#202020] dark:text-[#daffde]/70">
        Ask Moola Advisor...
      </div>

      {/* Dynamic Chat Window Area */}
      <div className="flex-1 grid gap-5 bg-gray-50 p-5 content-start min-h-[220px] transition-colors dark:bg-white/10">
        {/* User Prompt Bubble */}
        <div className="justify-self-end rounded-2xl rounded-br-none border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-black transition-colors dark:border-[#333] dark:bg-[#111] dark:text-white">
          {currentPrompt}
        </div>

        {/* AI Response Bubble */}
        <div className={`max-w-[360px] rounded-2xl rounded-bl-none px-4 py-3 text-sm font-bold leading-6 transition-colors duration-300 ${isLoading ? 'text-gray-500 animate-pulse bg-gray-200 dark:bg-[#222]' : 'bg-[#DEFF9A]/30 text-black dark:bg-black dark:text-[#daffde]'}`}>
          {advice}
        </div>
      </div>

      {/* Interactive Prompt Action Buttons */}
      <div className="bg-gray-100 p-3 border-t border-gray-200 transition-colors dark:border-[#2a2a2a] dark:bg-[#151515]">
        <p className="text-xs font-bold text-gray-500 mb-2 uppercase ml-1">Select an audit vector:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleAskAI("Review my impulse purchases.")}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-black transition hover:bg-gray-200 disabled:opacity-50 dark:border-none dark:bg-[#222] dark:text-white dark:hover:bg-[#333] dark:hover:text-[#deff9a]"
          >
            Review Impulses
          </button>

          <button
            onClick={() => handleAskAI("Analyze my spending habits.")}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-black transition hover:bg-gray-200 disabled:opacity-50 dark:border-none dark:bg-[#222] dark:text-white dark:hover:bg-[#333] dark:hover:text-[#deff9a]"
          >
            Analyze Spending
          </button>

          <button
            onClick={() => handleAskAI("Identify my largest expenses.")}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-black transition hover:bg-gray-200 disabled:opacity-50 dark:border-none dark:bg-[#222] dark:text-white dark:hover:bg-[#333] dark:hover:text-[#deff9a]"
          >
            Identify Largest Expenses
          </button>
        </div>
      </div>
    </section>
  );
}

export default AdvisorPanel;