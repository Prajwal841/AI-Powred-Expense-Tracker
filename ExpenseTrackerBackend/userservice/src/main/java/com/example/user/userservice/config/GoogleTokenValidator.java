package com.example.user.userservice.config;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.GeneralSecurityException;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;

/**
 * Verifies Google ID tokens received from frontend (Google Identity Services).
 * One-time verification: after success, you mint your own app JWT.
 */
@Slf4j
@Component
public class GoogleTokenValidator {

    private final GoogleIdTokenVerifier verifier;
    private final Collection<String> allowedAudiences;

    public GoogleTokenValidator(
            @Value("${google.client-ids:${google.client-id:}}") String clientIds,
            @Value("${google.acceptable-skew-seconds:60}") long acceptableSkewSeconds
    ) throws Exception {

        this.allowedAudiences = parseClientIds(clientIds);

        log.info("GoogleTokenValidator: allowed audiences = {}", allowedAudiences);

        this.verifier = new GoogleIdTokenVerifier.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance())
                .setAudience(allowedAudiences)
                // Accept canonical issuer; the library already handles both, but explicit is fine.
                .setIssuer("https://accounts.google.com")
                .setAcceptableTimeSkewSeconds(acceptableSkewSeconds)
                .build();
    }

    /**
     * Validate the raw ID token string and return its payload.
     * Throws RuntimeException with context on failure.
     */
    public GoogleIdToken.Payload validate(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            log.warn("GoogleTokenValidator: received null/blank idToken.");
            throw new RuntimeException("Invalid Google ID Token: empty");
        }

        try {
            GoogleIdToken parsed = verifier.verify(idToken);
            if (parsed == null) {
                // signature, audience, issuer, or expiry issue
                log.warn("GoogleTokenValidator: verifier returned null (signature/audience/issuer/expiry failure).");
                throw new RuntimeException("Invalid Google ID Token");
            }

            GoogleIdToken.Payload payload = parsed.getPayload();

            // Defensive; should already match because of .setAudience()
            Object aud = payload.getAudience();
            if (aud != null && !allowedAudiences.contains(String.valueOf(aud))) {
                log.warn("GoogleTokenValidator: payload aud='{}' not in allowed {}", aud, allowedAudiences);
                throw new RuntimeException("Invalid Google ID Token: audience mismatch");
            }

            log.debug("GoogleTokenValidator: verified. sub={}, email={}, emailVerified={}, exp={}, iat={}",
                    payload.getSubject(), payload.getEmail(), payload.getEmailVerified(),
                    payload.getExpirationTimeSeconds(), payload.getIssuedAtTimeSeconds());

            return payload;

        } catch (GeneralSecurityException gse) {
            log.error("GoogleTokenValidator: security error verifying token: {}", gse.getMessage(), gse);
            throw new RuntimeException("Invalid Google ID Token: security error", gse);
        } catch (Exception e) {
            log.error("GoogleTokenValidator: error verifying token: {}", e.getMessage(), e);
            throw new RuntimeException("Invalid Google ID Token", e);
        }
    }

    private static Collection<String> parseClientIds(String raw) {
        if (raw == null || raw.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.stream(raw.split("[,\\s]+"))
                .filter(s -> !s.isBlank())
                .toList();
    }
}
