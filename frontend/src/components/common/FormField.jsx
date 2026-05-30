function FormField({ label, ...inputProps }) {
  return (
    <label className="grid gap-2 text-base font-extrabold text-white">
      {label}
      <input
        className="min-h-14 w-full rounded-xl border border-[#2c2c2c] bg-[#020202] px-4 text-white outline-none transition focus:border-[#deff9a]/70 focus:shadow-[0_0_0_3px_rgba(222,255,154,0.12)]"
        {...inputProps}
      />
    </label>
  );
}

export default FormField;
