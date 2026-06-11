package com.moola.backend.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

@Service
// talks to the external frankfurter currency api and returns converted money amounts
public class CurrencyService {

    @Value("${FRANKFURTER_URL}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public BigDecimal convertCurrency(String from, String to, BigDecimal amount) {
        if (from == null || to == null || from.equalsIgnoreCase(to)) {
            return amount;
        }

        try {

            String url = String.format("%s/rate/%s/%s", apiUrl, from.toUpperCase(), to.toUpperCase());

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);


            if (response != null && response.containsKey("rate")) {
                Object rateObj = response.get("rate");
                BigDecimal exchangeRate = new BigDecimal(rateObj.toString());

                return amount.multiply(exchangeRate).setScale(2, RoundingMode.HALF_UP);
            }
        } catch (Exception e) {
            System.err.println("Frankfurter v2 API Error: " + e.getMessage());
        }
        return amount;
    }
}
