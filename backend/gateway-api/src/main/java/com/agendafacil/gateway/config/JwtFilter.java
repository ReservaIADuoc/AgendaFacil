package com.agendafacil.gateway.config;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
public class JwtFilter implements GlobalFilter, Ordered {

    private static final String SECRET = "agendafacil_super_secret_key_123456789";
    private final Algorithm algorithm = Algorithm.HMAC256(SECRET);

    // Endpoints públicos que no requieren JWT
    private static final List<String> PUBLIC_PREFIXES = List.of(
            "/api/auth/login",
            "/api/auth/register",
            "/api/bookings",
            "/api/professionals"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();

        // Si es endpoint público, omitir validación
        boolean isPublic = PUBLIC_PREFIXES.stream().anyMatch(path::startsWith);
        if (isPublic) {
            return chain.filter(exchange);
        }

        // Obtener header de autorización
        String authHeader = request.getHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return onError(exchange, HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);
        String email;
        try {
            JWT.require(algorithm)
                    .withIssuer("auth-service")
                    .build()
                    .verify(token);
            email = JWT.decode(token).getSubject();
        } catch (Exception e) {
            return onError(exchange, HttpStatus.UNAUTHORIZED);
        }

        ServerHttpRequest mutatedRequest = request.mutate()
                .header("X-Professional-Email", email)
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    private Mono<Void> onError(ServerWebExchange exchange, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        return response.setComplete();
    }

    @Override
    public int getOrder() {
        return -1; // Prioridad alta
    }
}
