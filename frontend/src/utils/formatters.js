export const formatAmount = (amount) =>
  new Intl.NumberFormat("en-DE", {
    style: "currency",
    currency: "EUR",
  }).format(Number(amount ?? 0));
