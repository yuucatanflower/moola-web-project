function AuthTabs({ authMode, onModeChange }) {
  const tabs = [
    { id: "login", label: "Login" },
    { id: "register", label: "Register" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 rounded-[14px] border border-[#222] bg-[#090909] p-1.5 lg:col-start-2">
      {tabs.map((tab) => {
        const active = authMode === tab.id;

        return (
          <button
            className={`min-h-12 rounded-[10px] font-bold transition ${
              active
                ? "bg-[#deff9a] text-[#050505]"
                : "text-[#daffde]/70 hover:bg-white/5"
            }`}
            key={tab.id}
            onClick={() => onModeChange(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default AuthTabs;