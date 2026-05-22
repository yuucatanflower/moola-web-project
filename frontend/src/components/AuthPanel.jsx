import React from "react";

function AuthPanel({
                       authMode,
                       form,
                       message,
                       pending,
                       onFieldChange,
                       onModeChange,
                       onSubmit,
                   }) {
    const registering = authMode === "register";

    return (
        <section className="auth-panel">
            <div className="auth-copy">
                <p className="brand-mark">
                    moola<span>.</span>
                </p>
                <h1 className="main-headline">
                    {registering ? "Create your money space" : "Sign in to your dashboard"}
                </h1>
                <p className="panel-subtext">
                    Manage your finances and track your monthly payments and spendings. Analyze your financial habits with help of our AI based advisor.
                </p>
                <p className="panel-subtext">We do not store any sensitive data of yours.</p>
            </div>

            <div className="auth-switch" role="tablist" aria-label="Authentication">
                <button
                    aria-selected={!registering}
                    className={!registering ? "is-active" : ""}
                    onClick={() => onModeChange("login")}
                    role="tab"
                    type="button"
                >
                    Login
                </button>
                <button
                    aria-selected={registering}
                    className={registering ? "is-active" : ""}
                    onClick={() => onModeChange("register")}
                    role="tab"
                    type="button"
                >
                    Register
                </button>
            </div>

            <form className="auth-form" onSubmit={onSubmit}>
                <label>
                    Username
                    <input
                        autoComplete="username"
                        name="username"
                        onChange={onFieldChange}
                        required
                        value={form.username}
                    />
                </label>

                <label>
                    Password
                    <input
                        autoComplete={registering ? "new-password" : "current-password"}
                        minLength={4}
                        name="password"
                        onChange={onFieldChange}
                        required
                        type="password"
                        value={form.password}
                    />
                </label>

                {registering ? (
                    <label>
                        Hourly wage
                        <input
                            min="0"
                            name="hourlyWage"
                            onChange={onFieldChange}
                            required
                            step="0.01"
                            type="number"
                            value={form.hourlyWage}
                        />
                    </label>
                ) : null}

                {message ? <p className={`form-message ${message.type}`}>{message.text}</p> : null}

                <button className="primary-btn" disabled={pending} type="submit">
                    {pending ? "Working..." : registering ? "Create account" : "Login"}
                </button>
            </form>
        </section>
    );
}

export default AuthPanel;