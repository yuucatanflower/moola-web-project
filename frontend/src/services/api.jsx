const API_BASE_URL = "http://localhost:8081/api";

const readResponseBody = async (response) => {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return response.text();
};

const request = async (path, options) => {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const body = await readResponseBody(response);

  if (!response.ok) {
    const message =
      typeof body === "string" && body.trim()
        ? body
        : "The backend rejected the request.";
    throw new Error(message);
  }

  return body;
};

export const loginUser = async ({ username, password }) =>
  request("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

export const registerUser = async ({ username, password, hourlyWage }) =>
  request("/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
      hourlyWage,
    }),
  });

export const fetchTransactions = async (token) =>
  request("/transactions", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

export const fetchAiAdvice = async (token, days = 30) =>
  request(`/features/advice?days=${days}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
