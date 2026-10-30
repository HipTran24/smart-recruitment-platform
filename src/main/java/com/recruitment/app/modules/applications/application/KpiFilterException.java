package com.recruitment.app.modules.applications.application;

public class KpiFilterException extends IllegalArgumentException {
    private final String field;
    public KpiFilterException(String field, String message) {
        super(message);
        this.field = field;
    }
    public String field() { return field; }
}
