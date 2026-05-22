import React, { useState } from "react";
import { Riple } from "react-loading-indicators";

const formatAmount = (amount) =>
    new Intl.NumberFormat("en-DE", {
        style: "currency",
        currency: "EUR",
    }).format(Number(amount ?? 0));

function Dashboard({ session, transactions, transactionsState, onLogout }) {
    const hourlyWage = session.user.hourlyWage || 15;
    const storedHourlyWage =
        session.user.hourlyWage == null ? "Not returned by login" : formatAmount(session.user.hourlyWage);

    const [aiAdvice, setAiAdvice] = useState("");
    const [loadingAI, setLoadingAI] = useState(false);
    const [hasAsked, setHasAsked] = useState(false);

    const handleAskAdvisor = () => {
        setLoadingAI(true);
        setHasAsked(true);
        setAiAdvice("");

        setTimeout(() => {
            setAiAdvice("Switch to the ad-supported Netflix tier immediately to save €100 annually!");
            setLoadingAI(false);
        }, 2500);
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <p className="brand-mark">
                        moola<span>.</span>
                    </p>
                    <h1 className="main-headline">Dashboard</h1>
                </div>

                <div className="user-menu">
                    <div>
                        <span>Signed in as</span>
                        <strong>{session.user.username}</strong>
                    </div>
                    <button onClick={onLogout} type="button">
                        Logout
                    </button>
                </div>
            </header>

            <main className="main-content">
                {/* Left Column: Expenses Card */}
                <section className="card-section">
                    <div className="section-title">
                        <h2 className="section-headline">Your Expenses</h2>
                        <span>{transactions.length || 1} items</span>
                    </div>

                    {transactionsState.loading ? <p className="panel-note">Loading transactions...</p> : null}
                    {transactionsState.error ? <p className="panel-note error">{transactionsState.error}</p> : null}

                    {!transactionsState.loading && !transactionsState.error ? (
                        <div className="transaction-list">
                            {transactions.length ? (
                                transactions.map((transaction) => (
                                    <article className="transaction-item" key={transaction.id}>
                                        <div className="transaction-main">
                                            <img
                                                src="https://img.logo.dev/netflix.com?token=pk_UzSG7ttKQZyJ5b837_CfGg&size=37&format=png&theme=dark&retina=true"
                                                alt="Vendor Logo"
                                                className="vendor-logo"
                                                style={{ borderRadius: "6px", marginRight: "12px" }}
                                            />
                                            <div>
                        <span className="vendor-name">
                          {transaction.description || "Transaction"}
                        </span>
                                                <div className="tags">
                                                    {transaction.impulseBuy ? <span className="tag impulse-tag">Impulse</span> : null}
                                                    {transaction.regret ? <span className="tag regret-tag">Regret</span> : null}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="price-info">
                                            <span className="price">{formatAmount(transaction.amount)}</span>
                                            <span className="time-translated">
                        ⌛ {(Number(transaction.amount ?? 0) / hourlyWage).toFixed(1)} hrs of work
                      </span>
                                        </div>
                                    </article>
                                ))
                            ) : (
                                <article className="transaction-item">
                                    <div className="transaction-main">
                                        <img
                                            src="https://img.logo.dev/netflix.com?token=pk_UzSG7ttKQZyJ5b837_CfGg&size=37&format=png&theme=dark&retina=true"
                                            alt="Vendor Logo"
                                            className="vendor-logo"
                                            style={{ borderRadius: "6px", marginRight: "12px" }}
                                        />
                                        <div>
                                            <span className="vendor-name">Netflix Subscription</span>
                                            <div className="tags">
                                                <span className="tag regret-tag">Regret 😣</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="price-info">
                                        <span className="price">€17.99</span>
                                        <span className="time-translated">
                      ⌛ {(17.99 / hourlyWage).toFixed(1)} hrs of work
                    </span>
                                    </div>
                                </article>
                            )}
                        </div>
                    ) : null}
                </section>

                {/* Right Column: Financial Advisor Card & Meta Data Combo */}
                <section className="card-section ai-section" style={{ display: "flex", flexDirection: "column" }}>
                    <h2 className="section-headline" style={{ marginBottom: "22px" }}>Financial Advisor</h2>

                    <button className="ai-btn" onClick={handleAskAdvisor} disabled={loadingAI}>
                        {loadingAI ? "Analyzing..." : "Ask the Advisor"}
                    </button>

                    <div
                        className="ai-response-container"
                        style={{
                            marginTop: "1.25rem",
                            position: "relative",
                            width: "100%",
                            minHeight: "110px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <div style={{ position: "absolute", display: loadingAI ? "flex" : "none" }}>
                            <Riple color="#DEFF9A" size="medium" text="" textColor="" />
                        </div>

                        <div
                            className="ai-response-box"
                            style={{
                                opacity: !loadingAI && aiAdvice ? 1 : 0,
                                visibility: !loadingAI && aiAdvice ? "visible" : "hidden",
                                transition: "opacity 0.2s ease",
                            }}
                        >
                            <p>{aiAdvice || "Switch to the ad-supported Netflix tier immediately to save €100 annually!"}</p>
                        </div>

                        {!hasAsked && !loadingAI && (
                            <div style={{ position: "absolute", color: "rgba(218, 255, 222, 0.35)", fontSize: "0.9rem", fontWeight: 500 }}>
                                <p>Click above to get your custom spending roast.</p>
                            </div>
                        )}
                    </div>

                    <hr style={{ border: "none", borderTop: "1px solid #1d1d1d", margin: "1.5rem 0" }} />

                    <h2 className="section-headline" style={{ marginBottom: "14px" }}>Account Meta</h2>
                    <dl className="account-facts">
                        <div>
                            <dt>Role</dt>
                            <dd>{session.user.role}</dd>
                        </div>
                        <div>
                            <dt>Hourly wage</dt>
                            <dd>{storedHourlyWage}</dd>
                        </div>
                        <div>
                            <dt>Session Status</dt>
                            <dd>JWT Secured</dd>
                        </div>
                    </dl>
                </section>
            </main>
        </div>
    );
}

export default Dashboard;