package com.moola.backend.controllers;

import com.moola.backend.models.User;
import com.moola.backend.services.AdminService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public List<User> getUsers(
            @RequestHeader("X-ADMIN-PASSWORD") String password
    ) {

        if (!"admin123".equals(password)) {
            throw new RuntimeException("Access denied");
        }

        return adminService.getAllUsers();
    }

    @PutMapping("/users/{id}")
    public User updateUser(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @RequestHeader("X-ADMIN-PASSWORD") String password
    ) {

        if (!"admin123".equals(password)) {
            throw new RuntimeException("Access denied");
        }

        return adminService.updateUsername(id, body.get("username"));
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(
            @PathVariable UUID id,
            @RequestHeader("X-ADMIN-PASSWORD") String password
    ) {

        if (!"admin123".equals(password)) {
            throw new RuntimeException("Access denied");
        }

        adminService.deleteUser(id);
    }
}