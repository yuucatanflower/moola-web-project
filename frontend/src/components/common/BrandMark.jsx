function BrandMark({ className = "" }) {
  return (
    <p className={`m-0 text-xl font-extrabold text-white sm:text-2xl ${className}`}>
      moola<span className="text-[#deff9a]">.</span>
    </p>
  );
}

export default BrandMark;
