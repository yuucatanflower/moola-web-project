package com.moola.backend.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Map;

@Service
// Talks to the external Frankfurter v2 currency API and returns the conversion rate
public class CurrencyService {

    @Value("${FRANKFURTER_URL:https://api.frankfurter.dev/v2}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public BigDecimal getExchangeRate(String from, String to) {
        if (from == null || to == null || from.equalsIgnoreCase(to)) {
            return BigDecimal.ONE;
        }

        try {
            String url = String.format("%s/rate/%s/%s", apiUrl, from.toUpperCase(), to.toUpperCase());

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "MoolaApp/1.0");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> responseEntity = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            Map<String, Object> response = responseEntity.getBody();

            if (response != null && response.containsKey("rate")) {
                System.out.println("Successfully fetched live v2 rate: " + from + " -> " + to);
                return new BigDecimal(response.get("rate").toString());
            }
        } catch (Exception e) {
            System.err.println("Frankfurter v2 API Failed: " + e.getMessage());
        }

        // Return 1.0 multiplier if the API request fails so the app doesn't crash
        return BigDecimal.ONE;
    }
}