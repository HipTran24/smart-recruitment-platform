package com.recruitment.app.modules.identity.application.command;

public record RegisterAccountCommand(String fullName, String email, String password) {
}
