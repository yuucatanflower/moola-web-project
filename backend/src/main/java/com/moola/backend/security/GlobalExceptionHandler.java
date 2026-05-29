package com.moola.backend.security;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice // Intercepts all runtime exceptions thrown across any controller class automatically
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatusException(ResponseStatusException ex) {
        Map<String, String> errorBody = new HashMap<>();
        errorBody.put("error", ex.getReason());

        // This forces Spring to extract the precise status code (like 404) and assign it to the HTTP header
        return new ResponseEntity<>(errorBody, ex.getStatusCode());
    }
}