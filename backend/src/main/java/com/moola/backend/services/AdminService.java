package com.moola.backend.services;

import com.moola.backend.models.User;
import com.moola.backend.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
// contains the admin user lookup, update, and delete logic
public class AdminService {

    private final UserRepository userRepository;

    public AdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUsername(UUID id, String username) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setUsername(username);

        return userRepository.save(user);
    }

    public void deleteUser(UUID id) {
        try {
            userRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("User has transactions and cannot be deleted");
        }
    }
}
