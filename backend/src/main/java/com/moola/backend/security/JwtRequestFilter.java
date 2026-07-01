package com.moola.backend.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Component
// reads the bearer token from each request and logs the user into spring security for that request
public class JwtRequestFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtRequestFilter.class);

    private final JwtUtils jwtUtils;

    public JwtRequestFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwtToken = null;

        // tokens come from the frontend as: authorization: bearer <token>
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwtToken = authorizationHeader.substring(7);

            try {
                // safely attempt to extract the username
                username = jwtUtils.getUsernameFromToken(jwtToken);
            } catch (ExpiredJwtException e) {
                // catch expired tokens cleanly
                logger.debug("JWT token has expired for this request.");
            } catch (JwtException | IllegalArgumentException e) {
                // covers malformed tokens, signature mismatches (e.g. after a JWT_SECRET
                // rotation), and null/blank tokens -- treat as an anonymous request instead
                // of letting the exception crash the filter chain
                logger.warn("Rejected invalid JWT: {}", e.getMessage());
            }
        }

        // a valid token makes this request count as authenticated
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtUtils.validateToken(jwtToken)) {
                String role = jwtUtils.getRoleFromToken(jwtToken);
                List<GrantedAuthority> authorities = role != null
                        ? List.of(new SimpleGrantedAuthority("ROLE_" + role))
                        : List.of();

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        username, null, authorities);
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // continue the filter chain
        chain.doFilter(request, response);
    }
}
