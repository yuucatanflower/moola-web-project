import React, { useState } from "react";
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
    <section className="flex flex-col overflow-hidden rounded-[26px] bg-white/10 shadow-[0_18px_50px_rgba(0,0,0,0.38)]">
      <div className="rounded-t-[26px] bg-[#202020] px-4 py-3 text-lg font-extrabold text-[#daffde]/70">
        Ask Moola Advisor...
      </div>

      {/* Dynamic Chat Window Area */}
      <div className="flex-1 grid gap-5 bg-white/10 p-5 content-start min-h-[220px]">
        {/* User Prompt Bubble */}
        <div className="justify-self-end rounded-2xl rounded-br-none bg-[#111] px-4 py-2 text-sm font-bold text-white border border-[#333]">
          {currentPrompt}
        </div>

        {/* AI Response Bubble */}
        <div className={`max-w-[360px] rounded-2xl rounded-bl-none bg-black px-4 py-3 text-sm font-bold leading-6 transition-colors duration-300 ${isLoading ? 'text-gray-500 animate-pulse' : 'text-[#daffde]'}`}>
          {advice}
        </div>
      </div>

      {/* Interactive Prompt Action Buttons (Neutral Tone) */}
      <div className="bg-[#151515] p-3 border-t border-[#2a2a2a]">
        <p className="text-xs font-bold text-gray-500 mb-2 uppercase ml-1">Select an audit vector:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleAskAI("Review my impulse purchases.")}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-[#222] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#333] hover:text-[#deff9a] disabled:opacity-50"
          >
            Review Impulses
          </button>

          <button
            onClick={() => handleAskAI("Analyze my spending habits.")}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-[#222] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#333] hover:text-[#deff9a] disabled:opacity-50"
          >
            Analyze Spending
          </button>

          <button
            onClick={() => handleAskAI("Identify my largest expenses.")}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-[#222] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#333] hover:text-[#deff9a] disabled:opacity-50"
          >
            Identify Largest Expenses
          </button>
        </div>
      </div>
    </section>
  );
}

export default AdvisorPanel;