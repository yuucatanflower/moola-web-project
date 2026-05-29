package com.moola.backend.security;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
// turns selected backend errors into small JSON responses that are easier for the frontend to read
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatusException(ResponseStatusException ex) {
        Map<String, String> errorBody = new HashMap<>();
        errorBody.put("error", ex.getReason());

        // keep the original HTTP status, like 404 for not found
        return new ResponseEntity<>(errorBody, ex.getStatusCode());
    }
}
