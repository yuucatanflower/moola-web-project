package com.moola.backend;

import com.moola.backend.services.CurrencyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
// tests currency conversion without calling the real frankfurter api
public class CurrencyServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private CurrencyService currencyService;

    @BeforeEach
    void setUp() {
        // give the service a fake http client and fake api url
        ReflectionTestUtils.setField(currencyService, "restTemplate", restTemplate);
        ReflectionTestUtils.setField(currencyService, "apiUrl", "https://mock-api.com");
    }

    @Test
    void convertCurrency_WhenSameCurrency_ShouldReturnOriginalAmount() {
        BigDecimal amount = new BigDecimal("100.00");
        BigDecimal result = currencyService.convertCurrency("USD", "USD", amount);
        assertEquals(amount, result);
    }

    @Test
    void convertCurrency_WithValidApiResponse_ShouldReturnConvertedAmount() {
        BigDecimal originalAmount = new BigDecimal("100.00");

        // fake the frankfurter response with a sample rate
        Map<String, Object> mockResponse = new HashMap<>();
        mockResponse.put("rate", 1.08);

        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(mockResponse);

        BigDecimal result = currencyService.convertCurrency("EUR", "USD", originalAmount);

        assertEquals(new BigDecimal("108.00"), result);
    }

    @Test
    void convertCurrency_WhenApiFails_ShouldFallbackToOriginalAmount() {
        BigDecimal originalAmount = new BigDecimal("100.00");

        // pretend the external api is down
        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenThrow(new RuntimeException("API Down"));

        BigDecimal result = currencyService.convertCurrency("EUR", "USD", originalAmount);

        assertEquals(originalAmount, result);
    }
}
