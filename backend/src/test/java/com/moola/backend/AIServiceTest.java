package com.moola.backend;

import com.moola.backend.services.AIService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
// tests the ai service without calling the real groq api
public class AIServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private AIService aiService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(aiService, "restTemplate", restTemplate);
        ReflectionTestUtils.setField(aiService, "groqUrl", "https://mock-groq.com");
    }

    @Test
    void getFinancialAdvice_WhenApiKeyIsMissing_ShouldReturnWarning() {
        ReflectionTestUtils.setField(aiService, "apiKey", "");

        String result = aiService.getFinancialAdvice("test data");

        assertEquals("Provide a valid Groq API key to check your spending.", result);
    }

    @Test
    void getFinancialAdvice_WithValidResponse_ShouldReturnAdviceString() {
        ReflectionTestUtils.setField(aiService, "apiKey", "valid-key");

        // fake the nested response shape that groq returns
        Map<String, String> messageMap = Map.of("content", "Stop buying expensive coffee.");
        Map<String, Object> choiceMap = Map.of("message", messageMap);
        Map<String, Object> bodyMap = Map.of("choices", List.of(choiceMap));

        ResponseEntity<Map> mockResponseEntity = new ResponseEntity<>(bodyMap, HttpStatus.OK);

        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(Map.class)))
                .thenReturn(mockResponseEntity);

        String result = aiService.getFinancialAdvice("[Coffee, amt:5.00]");

        assertEquals("Stop buying expensive coffee.", result);
    }

    @Test
    void getFinancialAdvice_WhenApiCrashes_ShouldReturnFallbackMessage() {
        ReflectionTestUtils.setField(aiService, "apiKey", "valid-key");

        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(Map.class)))
                .thenThrow(new RuntimeException("Connection Timeout"));

        String result = aiService.getFinancialAdvice("data");

        assertTrue(result.startsWith("Failed to process data log:"));
    }
}
