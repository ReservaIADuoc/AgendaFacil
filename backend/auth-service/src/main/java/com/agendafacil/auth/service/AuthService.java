package com.agendafacil.auth.service;

import com.agendafacil.auth.model.User;

public interface AuthService {
    User register(String email, String password, String name);
    String login(String email, String password);
    User findByToken(String token);
    User updateProfileByToken(String token, String name, String avatarUrl);
}
