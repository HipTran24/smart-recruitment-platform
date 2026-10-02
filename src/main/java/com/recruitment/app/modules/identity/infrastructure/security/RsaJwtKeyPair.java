package com.recruitment.app.modules.identity.infrastructure.security;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;

record RsaJwtKeyPair(RSAPublicKey publicKey, RSAPrivateKey privateKey) {
}
