package com.recruitment.app.modules.identity.infrastructure.security;

import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Encodes newly created or updated passwords with Argon2id while transparently
 * matching and signaling upgrades for existing BCrypt hashes.
 */
public class Argon2idMigratingPasswordEncoder implements PasswordEncoder {

    private final Argon2PasswordEncoder argon2;
    private final BCryptPasswordEncoder bcrypt;

    public Argon2idMigratingPasswordEncoder() {
        this.argon2 = new Argon2PasswordEncoder(16, 32, 1, 19456, 2);
        this.bcrypt = new BCryptPasswordEncoder(12);
    }

    Argon2idMigratingPasswordEncoder(Argon2PasswordEncoder argon2, BCryptPasswordEncoder bcrypt) {
        this.argon2 = argon2;
        this.bcrypt = bcrypt;
    }

    @Override
    public String encode(CharSequence rawPassword) {
        return argon2.encode(rawPassword);
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        if (encodedPassword == null) {
            return false;
        }
        if (encodedPassword.startsWith("$argon2id$") || encodedPassword.startsWith("$argon2i$")) {
            return argon2.matches(rawPassword, encodedPassword);
        }
        if (encodedPassword.startsWith("$2a$") || encodedPassword.startsWith("$2b$") || encodedPassword.startsWith("$2y$")) {
            return bcrypt.matches(rawPassword, encodedPassword);
        }
        return false;
    }

    @Override
    public boolean upgradeEncoding(String encodedPassword) {
        if (encodedPassword == null) {
            return false;
        }
        return !encodedPassword.startsWith("$argon2id$") || argon2.upgradeEncoding(encodedPassword);
    }
}
