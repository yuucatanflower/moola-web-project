package com.moola.backend.controllers;

import com.moola.backend.models.User;
import com.moola.backend.services.AdminService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
// exposes admin-only user management endpoints
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;

    }

    // authorization for this whole controller is enforced by SecurityConfig,
    // which requires ROLE_ADMIN for every /api/admin/** request

    @GetMapping("/users")
    public List<User> getUsers() {
        return adminService.getAllUsers();
    }

    @PatchMapping("/users/{id}")
    public User updateUser(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body
    ) {
        return adminService.updateUsername(id, body.get("username"));
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable UUID id) {
        adminService.deleteUser(id);
    }
}
