export const formatAmount = (amount, currencyCode = "EUR") =>
  new Intl.NumberFormat("en-DE", {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount ?? 0));