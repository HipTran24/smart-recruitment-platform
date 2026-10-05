package com.recruitment.app.modules.identity.api;

import com.recruitment.app.modules.identity.api.request.OAuthCodeExchangeRequest;
import com.recruitment.app.modules.identity.api.request.PasswordLoginRequest;
import com.recruitment.app.modules.identity.api.request.RefreshTokenRequest;
import com.recruitment.app.modules.identity.api.request.RegistrationRequest;
import com.recruitment.app.modules.identity.api.response.AuthenticatedUserResponse;
import com.recruitment.app.modules.identity.api.response.TokenResponse;
import com.recruitment.app.modules.identity.application.GoogleOAuthCodeExchangeService;
import com.recruitment.app.modules.identity.application.IdentityAuthenticationService;
import com.recruitment.app.modules.identity.application.IssuedTokenPair;
import com.recruitment.app.modules.identity.application.command.PasswordLoginCommand;
import com.recruitment.app.modules.identity.application.command.RegisterAccountCommand;
import com.recruitment.app.modules.identity.application.exception.IdentityAuthenticationException;
import com.recruitment.app.modules.identity.application.exception.OAuthFeatureUnavailableException;
import com.recruitment.app.modules.identity.application.JwtPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/auth", produces = MediaType.APPLICATION_JSON_VALUE)
public class AuthController {

    private final IdentityAuthenticationService identities;
    private final ObjectProvider<GoogleOAuthCodeExchangeService> googleOAuthCodeExchange;
    private final com.recruitment.app.modules.identity.application.AuthenticationThrottlingService throttling;

    public AuthController(
            IdentityAuthenticationService identities,
            ObjectProvider<GoogleOAuthCodeExchangeService> googleOAuthCodeExchange,
            com.recruitment.app.modules.identity.application.AuthenticationThrottlingService throttling
    ) {
        this.identities = identities;
        this.googleOAuthCodeExchange = googleOAuthCodeExchange;
        this.throttling = throttling;
    }

    @PostMapping("/register")
    public ResponseEntity<TokenResponse> register(@Valid @RequestBody RegistrationRequest request) {
        throttling.checkRegistrationThrottled();
        IssuedTokenPair tokens = identities.register(new RegisterAccountCommand(
                request.fullName(),
                request.email(),
                request.password()
        ));
        throttling.recordRegistrationDispatch();
        return tokenResponse(tokens, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody PasswordLoginRequest request) {
        return tokenResponse(
                identities.loginWithPassword(new PasswordLoginCommand(request.email(), request.password())),
                HttpStatus.OK
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        throttling.checkRefreshThrottled();
        try {
            return tokenResponse(identities.refresh(request.refreshToken()), HttpStatus.OK);
        } catch (RuntimeException e) {
            throttling.recordRefreshFailure();
            throw e;
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshTokenRequest request) {
        identities.logout(request.refreshToken());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/oauth/exchange")
    public ResponseEntity<TokenResponse> exchangeGoogleAuthorizationCode(@Valid @RequestBody OAuthCodeExchangeRequest request) {
        throttling.checkOAuthExchangeThrottled();
        GoogleOAuthCodeExchangeService exchange = googleOAuthCodeExchange.getIfAvailable();
        if (exchange == null) {
            throw new OAuthFeatureUnavailableException();
        }
        try {
            return tokenResponse(exchange.exchange(request.code(), request.codeVerifier(), request.transactionId()), HttpStatus.OK);
        } catch (RuntimeException e) {
            throttling.recordOAuthExchangeFailure();
            throw e;
        }
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyAuthority('ROLE_CANDIDATE', 'ROLE_RECRUITER', 'ROLE_PLATFORM_ADMIN')")
    public AuthenticatedUserResponse currentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtPrincipal principal)) {
            throw new IdentityAuthenticationException();
        }
        IdentityAuthenticationService.AuthenticatedAccount account = identities.currentAccount(principal.userId());
        return new AuthenticatedUserResponse(
                account.id(),
                account.email(),
                account.fullName(),
                account.roleCodes()
        );
    }

    private static TokenResponse toResponse(IssuedTokenPair tokens) {
        return new TokenResponse(
                tokens.accessToken(),
                tokens.refreshToken(),
                tokens.tokenType(),
                tokens.accessTokenExpiresAt(),
                tokens.refreshTokenExpiresAt()
        );
    }

    private static ResponseEntity<TokenResponse> tokenResponse(IssuedTokenPair tokens, HttpStatus status) {
        return ResponseEntity.status(status)
                .cacheControl(CacheControl.noStore())
                .header("Pragma", "no-cache")
                .body(toResponse(tokens));
    }
}
