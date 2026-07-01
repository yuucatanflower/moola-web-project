import { useState } from "react";

const BrandIcon = ({ name }) => {
  const [hasError, setHasError] = useState(false);

  // Guess the domain by taking the first word and adding .com
  // Example: "Netflix Premium" -> "netflix.com"
  const getDomain = (rawName) => {
    if (!rawName) return null;
    const cleanName = rawName.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    return `${cleanName}.com`;
  };

  const domain = getDomain(name);
  const logoUrl = `https://logo.clearbit.com/${domain}`;

  // If the image fails to load or no name is provided, show a fallback circle
  if (hasError || !domain) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2b2b2b] bg-[#1a1a1a] text-sm font-bold text-white shadow-sm">
        {name ? name.charAt(0).toUpperCase() : "?"}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`${name} logo`}
      onError={() => setHasError(true)}
      className="h-10 w-10 shrink-0 rounded-full border border-[#2b2b2b] bg-white object-contain p-1 shadow-sm"
    />
  );
};

export default BrandIcon;