export const DEMO_TRANSACTION = {
  id: "demo-netflix",
  amount: 17.99,
  description: "Netflix Subscription",
  regret: true,
  impulseBuy: false,
};

export const DASHBOARD_TRANSACTIONS = [
  {
    id: "demo-income-upwork",
    amount: 513.23,
    category: "Freelancing",
    date: "17.01.26",
    description: "Website development for Luke from Upwork.",
    type: "Income",
  },
  {
    id: "demo-groceries",
    amount: 27.3,
    category: "Groceries",
    date: "13.01.26",
    description: "Soup ingredients and lots of beer",
    type: "Expense",
  },
  {
    id: "demo-rent",
    amount: 530,
    category: "Rent",
    date: "04.01.26",
    description: "Rent payment",
    type: "Bills",
  },
  {
    id: "demo-uncategorized",
    amount: 6.7,
    category: "Categorize",
    date: "02.01.26",
    description: "Add description...",
    type: "Expense",
  },
];

export const CATEGORY_BREAKDOWN = [
  { amount: 978.34, color: "#deff9a", label: "Expenses" },
  { amount: 150, color: "#8fe9ff", label: "Subscriptions" },
  { amount: 670, color: "#9f7aea", label: "Bills" },
];

export const RECURRING_PAYMENTS = [
  {
    amount: 12.99,
    date: "21.01.26",
    icon: "spotify",
    name: "Spotify",
    status: "Due in 4 days",
  },
  {
    amount: 530,
    date: "04.01.26",
    icon: "home",
    name: "Rent",
    status: "Paid",
  },
];
