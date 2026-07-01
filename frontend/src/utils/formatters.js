export const formatAmount = (amount, currencyCode = "EUR") =>
  new Intl.NumberFormat("en-DE", {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount ?? 0));

// 1 -> "1st", 2 -> "2nd", 3 -> "3rd", 4 -> "4th", 11-13 -> "th" (no 11st/12nd/13rd)
export const ordinal = (day) => {
  const n = Number(day);
  if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;

  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
};