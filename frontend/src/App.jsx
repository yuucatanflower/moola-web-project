// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { fetchTransactions } from './services/api';
import { Riple } from 'react-loading-indicators';
import './index.css';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [aiAdvice, setAiAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasAsked, setHasAsked] = useState(false); // state to track if user initiated the action

  const hourlyWage = 15;

  const handleAskAdvisor = () => {
    setLoading(true);
    setHasAsked(true);
    setAiAdvice("");

    setTimeout(() => {
      setAiAdvice("Switch to the ad-supported Netflix tier immediately to save €100 annually!");
      setLoading(false);
    }, 2500);
  };

  return (
      <div className="dashboard-container">
        <header>
          <h1>moola<span>.</span> Dashboard</h1>
        </header>

        <main className="main-content" style={{ display: 'flex', gap: '2rem', alignItems: 'stretch' }}>

          {/* Section 1: Expenses */}
          <section className="card-section" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2>Your Expenses</h2>
            <div className="transaction-list" style={{ flex: 1 }}>
              <div className="transaction-item">
                <img src="https://logo.clearbit.com/netflix.com" alt="Logo" className="vendor-logo" />
                <div>
                  <span className="vendor-name">Netflix Subscription</span>
                  <span className="tag regret-tag">Regret 😣</span>
                </div>
                <div className="price-info">
                  <span className="price">€17.99</span>
                  <span className="time-translated">⌛ {(17.99 / hourlyWage).toFixed(1)} hrs of work</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Financial Advisor */}
          <section className="card-section ai-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h2><i className="fa-solid fa-robot"></i> Financial Advisor</h2>

            <button
                className="ai-btn"
                onClick={handleAskAdvisor}
                disabled={loading}
                style={{ width: '100%' }}
            >
              {loading ? "Analyzing..." : "Ask the Advisor"}
            </button>

            {/* STATIC PARENT: This container holds the absolute dimensions */}
            <div
                className="ai-response-container"
                style={{
                  marginTop: '1rem',
                  position: 'relative',
                  width: '100%',
                  minHeight: '120px', // Strict minimum height matching the design
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1
                }}
            >
              {/* 1. Loader Layer: Centered and layered inside the static box */}
              <div style={{
                position: 'absolute',
                display: loading ? 'flex' : 'none',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Riple color="#DEFF9A" size="medium" text="" textColor="" />
              </div>

              {/* 2. Text Content Layer: Kept rendered at all times to preserve structure */}
              <div
                  className="ai-response-box"
                  style={{
                    width: '100%',
                    margin: 0,
                    opacity: (!loading && aiAdvice) ? 1 : 0, // Toggle visibility via opacity
                    visibility: (!loading && aiAdvice) ? 'visible' : 'hidden',
                    transition: 'opacity 0.3s ease' // Smooth slick fade-in
                  }}
              >
                {/* Fallback mock string if state is clean to reserve the text paragraph spacing */}
                <p>{aiAdvice || "Switch to the ad-supported Netflix tier immediately to save €100 annually!"}</p>
              </div>

              {/* 3. Welcome/Idle State Layer */}
              {!hasAsked && !loading && (
                  <div style={{ position: 'absolute', color: '#666', fontSize: '0.9rem', textAlign: 'center' }}>
                    <p>Click above to get your custom spending roast.</p>
                  </div>
              )}
            </div>

          </section>
        </main>
      </div>
  );
}

export default App;