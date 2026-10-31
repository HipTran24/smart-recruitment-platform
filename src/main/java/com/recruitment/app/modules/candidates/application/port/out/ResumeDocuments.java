package com.recruitment.app.modules.candidates.application.port.out;

public interface ResumeDocuments {
    String extract(byte[] content, String filename);
    void save(String key, byte[] content);
    byte[] read(String key);
}
