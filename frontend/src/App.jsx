// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { fetchTransactions } from './services/api';
import './index.css';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [aiAdvice, setAiAdvice] = useState("");
  const [loading, setLoading] = useState(false);

  // Mock hourly wage used for the Time Translator feature
  const hourlyWage = 15; 

  return (
    <div className="dashboard-container">
      <header>
        <h1>moola<span>.</span> Dashboard</h1>
      </header>

      <main className="main-content">
        {/* Section 1: Transaction List featuring Clearbit Logs & Regret Tags */}
        <section className="card-section">
          <h2>Your Expenses</h2>
          <div className="transaction-list">
            {/* TODO: Map through real backend transactions once endpoints are live */}
            <div className="transaction-item">
              {/* Clearbit Logo API Integration */}
              <img src="https://logo.clearbit.com/netflix.com" alt="Logo" className="vendor-logo" />
              <div>
                <span className="vendor-name">Netflix Subscription</span>
                {/* Regret Tag Feature */}
                <span className="tag regret-tag">Regret 😣</span>
              </div>
              {/* Time/Money Translator Integration */}
              <div className="price-info">
                <span className="price">€17.99</span>
                <span className="time-translated">⌛ {(17.99 / hourlyWage).toFixed(1)} hrs of work</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: The AI Financial Advisor */}
        <section className="card-section ai-section">
          <h2><i className="fa-solid fa-robot"></i> Financial Advisor</h2>
          <button 
            className="ai-btn" 
            onClick={() => setAiAdvice("Switch to the ad-supported Netflix tier immediately to save €100 annually!")}
          >
            Ask the Advisor
          </button>
          {aiAdvice && (
            <div className="ai-response-box">
              <p>{aiAdvice}</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;