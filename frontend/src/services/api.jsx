const API_BASE_URL = "http://localhost:8081/api"; // Spring Boot Port

export const fetchTransactions = async (token) => {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });
    if (!response.ok) throw new Error("Fehler beim Laden der Transaktionen");
    return await response.json();
};

// Later add AI Advisor functions
export const fetchAiAdvice = async (token, days = 30) => {
    // Calls the API Controller for AI Advisor
};