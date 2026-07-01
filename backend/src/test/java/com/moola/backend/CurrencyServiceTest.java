package com.moola.backend;

import com.moola.backend.services.CurrencyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
// tests exchange rate lookups without calling the real frankfurter api
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
    void getExchangeRate_WhenSameCurrency_ShouldReturnOne() {
        BigDecimal result = currencyService.getExchangeRate("USD", "USD");
        assertEquals(BigDecimal.ONE, result);
    }

    @Test
    void getExchangeRate_WithValidApiResponse_ShouldReturnRate() {
        // fake the frankfurter response with a sample rate
        Map<String, Object> mockResponse = new HashMap<>();
        mockResponse.put("rate", 1.08);

        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(new ResponseEntity<>(mockResponse, org.springframework.http.HttpStatus.OK));

        BigDecimal result = currencyService.getExchangeRate("EUR", "USD");

        assertEquals(new BigDecimal("1.08"), result);
    }

    @Test
    void getExchangeRate_WhenApiFails_ShouldFallbackToOne() {
        // pretend the external api is down
        when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class), eq(Map.class)))
                .thenThrow(new RuntimeException("API Down"));

        BigDecimal result = currencyService.getExchangeRate("EUR", "USD");

        assertEquals(BigDecimal.ONE, result);
    }
}
