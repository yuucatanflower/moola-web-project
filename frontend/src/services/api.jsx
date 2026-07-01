const API_BASE_URL = "/api";

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
        const jsonMessage =
            body && typeof body === "object"
                ? body.message || body.error || body.detail || null
                : null;
        const message =
            jsonMessage ||
            (typeof body === "string" && body.trim()
                ? body
                : "The backend rejected the request.");
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

export const registerUser = async ({
                                       username,
                                       password,
                                       hourlyWage,
                                       startingBalance,
                                   }) =>
    request("/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            password,
            hourlyWage,
            startingBalance,
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

// --- NEW: Fetch custom categories ---
export const fetchCategories = async (token) =>
    request("/categories", {
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

export const createTransaction = async (token, transaction) =>
    request("/transactions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(transaction),
    });

export const updateTransaction = async (token, id, transaction) =>
    request(`/transactions/${id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(transaction),
    });

export const deleteTransaction = async (token, id) =>
    request(`/transactions/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

export const fetchUsers = async (token) =>
    request("/admin/users", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

export const deleteUser = async (token, userId) =>
    request(`/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

export const updateUser = async (token, userId, username) =>
    request(`/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
        }),
    });

export const updateUserProfile = async (token, profileData) =>
    request("/auth/profile", {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
    });

export const fetchSavingsJars = async (token) =>
    request("/jars", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

export const createSavingsJar = async (token, jar) =>
    request("/jars", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(jar),
    });

export const updateSavingsJar = async (token, id, jar) =>
    request(`/jars/${id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(jar),
    });

export const deleteSavingsJar = async (token, id) =>
    request(`/jars/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

export const depositToSavingsJar = async (token, id, amount) =>
    request(`/jars/${id}/deposit`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
    });

export const withdrawFromSavingsJar = async (token, id, amount) =>
    request(`/jars/${id}/withdraw`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
    });