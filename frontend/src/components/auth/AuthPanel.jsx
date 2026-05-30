import { useState } from "react";
import AuthTabs from "./AuthTabs";
import BrandMark from "../common/BrandMark";
import FormField from "../common/FormField";

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
  const [registerStep, setRegisterStep] = useState(1);
  const isRegisterDetailsStep = registering && registerStep === 2;

  const handleFormSubmit = (event) => {
    if (registering && registerStep === 1) {
      event.preventDefault();
      setRegisterStep(2);
      return;
    }

    onSubmit(event);
  };

  const handleModeChange = (nextMode) => {
    setRegisterStep(1);
    onModeChange(nextMode);
  };

  return (
    <section className="grid min-h-[min(760px,calc(100vh-36px))] w-full max-w-[1200px] items-center gap-8 rounded-3xl border border-[#202020] bg-[radial-gradient(circle_at_18%_8%,rgba(126,255,175,0.12),transparent_22rem),linear-gradient(145deg,rgba(11,22,12,0.96),rgba(0,0,0,0.94)_48%,rgba(6,14,7,0.96))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.6)] sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,440px)] lg:gap-16 xl:p-[72px]">
      <div className="max-w-xl">
        <BrandMark />
        <h1 className="my-5 max-w-[12ch] text-[clamp(2.25rem,5vw,5.3rem)] font-extrabold leading-none text-white">
          {registering ? "Create your money space" : "Sign in to your dashboard"}
        </h1>
        <p className="mb-3 max-w-[470px] text-base leading-7 text-[#daffde]/700 sm:text-lg">
          Manage your finances and track your monthly payments and spendings. Analyze your
          financial habits with help of our AI based advisor.
        </p>
      </div>

      <AuthTabs authMode={authMode} onModeChange={handleModeChange} />

      <form
        className="grid gap-4 self-start rounded-2xl border border-[#222] bg-[#0b0b0b] p-5 lg:col-start-2 lg:-mt-8 lg:p-8"
        onSubmit={handleFormSubmit}
      >
        {!isRegisterDetailsStep ? (
          <>
            <FormField
              autoComplete="username"
              label="Username"
              name="username"
              onChange={onFieldChange}
              required
              value={form.username}
            />

            <FormField
              autoComplete={registering ? "new-password" : "current-password"}
              label="Password"
              minLength={4}
              name="password"
              onChange={onFieldChange}
              required
              type="password"
              value={form.password}
            />
          </>
        ) : (
          <>
            <p className="m-0 rounded-xl border border-[#232323] bg-[#050505] px-3.5 py-3 text-sm leading-6 text-[#daffde]/70">
              Add the starting values for your account. You can change them later.
            </p>

            <FormField
              label="Hourly wage"
              min="0"
              name="hourlyWage"
              onChange={onFieldChange}
              required
              step="0.01"
              type="number"
              value={form.hourlyWage}
            />

            <FormField
              label="Current balance"
              name="currentBalance"
              onChange={onFieldChange}
              required
              step="0.01"
              type="number"
              value={form.currentBalance}
            />
          </>
        )}

        {message ? (
          <p
            className={`m-0 rounded-xl border bg-[#050505] px-3.5 py-3 leading-6 ${
              message.type === "success"
                ? "border-teal-300/30 text-teal-200"
                : "border-red-300/35 text-red-200"
            }`}
          >
            {message.text}
          </p>
        ) : null}

        {isRegisterDetailsStep ? (
          <button
            className="min-h-11 rounded-xl border border-[#2b2b2b] bg-transparent font-bold text-[#daffde]/70 transition hover:border-[#deff9a]/55 hover:text-white"
            onClick={() => setRegisterStep(1)}
            type="button"
          >
            Back
          </button>
        ) : null}

        <button
          className="mt-1 min-h-14 rounded-[14px] bg-[#deff9a] font-extrabold text-[#050505] transition hover:-translate-y-0.5 hover:bg-white disabled:cursor-wait disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Working..." : registering && registerStep === 1 ? "Next" : registering ? "Create account" : "Login"}
        </button>
      </form>
    </section>
  );
}

export default AuthPanel;
