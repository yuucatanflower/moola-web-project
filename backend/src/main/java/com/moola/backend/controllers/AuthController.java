package com.moola.backend.controllers;

import com.moola.backend.models.User;
import com.moola.backend.repositories.UserRepository;
import com.moola.backend.services.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        return ResponseEntity.ok(authService.register(user));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        // generate token
        String username = body.get("username");
        String token = authService.login(username, body.get("password"));

        // getting user from db
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // safe user object
        Map<String, Object> safeUserData = new HashMap<>();
        safeUserData.put("id", user.getId());
        safeUserData.put("username", user.getUsername());
        safeUserData.put("hourlyWage", user.getHourlyWage());

        //packing it all
        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", token);
        response.put("user", safeUserData);

        return ResponseEntity.ok(response);
    }
}