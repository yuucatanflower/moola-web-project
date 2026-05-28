import { useState } from "react";
import { Riple } from "react-loading-indicators";

function AdvisorPanel() {
  const [aiAdvice, setAiAdvice] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [hasAsked, setHasAsked] = useState(false);

  const handleAskAdvisor = () => {
    setLoadingAI(true);
    setHasAsked(true);
    setAiAdvice("");

    window.setTimeout(() => {
      setAiAdvice("Switch to the ad-supported Netflix tier immediately to save EUR100 annually.");
      setLoadingAI(false);
    }, 2500);
  };

  return (
    <div className="grid gap-5">
      <h2 className="m-0 text-[1.35rem] font-bold text-white">Financial Advisor</h2>

      <button
        className="min-h-12 w-full rounded-xl border border-[#2b2b2b] bg-[#0b0b0b] font-bold text-white transition hover:border-[#deff9a]/55 hover:bg-[#0f0f0f] disabled:cursor-wait disabled:opacity-50"
        disabled={loadingAI}
        onClick={handleAskAdvisor}
        type="button"
      >
        {loadingAI ? "Analyzing..." : "Ask the Advisor"}
      </button>

      <div className="relative flex min-h-28 w-full items-center justify-center">
        {loadingAI ? (
          <div className="absolute flex">
            <Riple color="#DEFF9A" size="medium" text="" textColor="" />
          </div>
        ) : null}

        <div
          className={`w-full rounded-2xl border border-[#1d1d1d] bg-[#020202] p-4 transition ${
            !loadingAI && aiAdvice ? "visible opacity-100" : "invisible opacity-0"
          }`}
        >
          <p className="m-0 text-sm font-medium leading-6 text-[#daffde]">{aiAdvice}</p>
        </div>

        {!hasAsked && !loadingAI ? (
          <p className="absolute m-0 text-center text-sm font-medium text-[#daffde]/35">
            Click above to get your custom spending roast.
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default AdvisorPanel;
