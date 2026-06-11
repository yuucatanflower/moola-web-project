package com.moola.backend.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.Map;

@Service
// calls the groq rest api and turns recent transactions into short spending advice
public class AIService {

    @Value("${GROQ_KEY}")
    private String apiKey;

    @Value("${GROQ_URL}")
    private String groqUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String getFinancialAdvice(String automatedTransactionData, String advisorTone) {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.contains("YOUR_GROQ")) {
            return "Provide a valid Groq API key to check your spending.";
        }

        // check the requested personality mode
        boolean isZen = advisorTone != null && advisorTone.trim().equalsIgnoreCase("zen");

        // assign the system instructions based on the selected tone
        String systemPrompt = isZen
                ? "You are a calm, highly supportive, and gentle financial advisor named 'Moola'. Praise the user for any good habits, gently suggest improvements without any judgment or harshness. Keep it peaceful and encouraging. Maximum 3 sentences."
                : "You are 'Moola', a brutal, savage, no-filter financial advisor. Your job is to somewhat aggressively judge the user's spending. Look at the raw transaction data, call out the exact dollar amounts they wasted, and brutally mock any items marked as 'impulse=true'. Be cynical and sharp. Maximum 3 sentences.";

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> requestBody = Map.of(
                    "model", "llama-3.1-8b-instant",
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", "Analyze these raw student transaction records: " + automatedTransactionData)
                    ),
                    "temperature", 0.95,
                    "max_tokens", 150
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(groqUrl, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<?> choices = (List<?>) response.getBody().get("choices");
                if (!choices.isEmpty()) {
                    Map<?, ?> firstChoice = (Map<?, ?>) choices.get(0);
                    Map<?, ?> message = (Map<?, ?>) firstChoice.get("message");
                    return (String) message.get("content");
                }
            }
        } catch (Exception e) {
            return "Failed to process data log: " + e.getMessage();
        }
        return "Transaction database analysis unavailable.";
    }
}
