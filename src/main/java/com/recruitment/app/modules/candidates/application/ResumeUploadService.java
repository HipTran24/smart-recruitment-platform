package com.recruitment.app.modules.candidates.application;

import com.recruitment.app.modules.candidates.application.port.out.CandidateProfileStore;
import com.recruitment.app.modules.candidates.application.port.out.ResumeDocuments;
import com.recruitment.app.modules.candidates.domain.model.ResumeSnapshot;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.UUID;

@Service
public class ResumeUploadService {
    private final CandidateProfileStore profiles;
    private final ResumeDocuments documents;
    public ResumeUploadService(CandidateProfileStore profiles, ResumeDocuments documents) {
        this.profiles = profiles;
        this.documents = documents;
    }

    @Transactional
    public ResumeSnapshot upload(Long user, String filename, byte[] bytes) {
        if (filename == null || filename.isBlank() || filename.length() > 255)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid CV filename");
        String text = documents.extract(bytes, filename);
        String key = "cv/" + user + "/" + UUID.randomUUID() + (filename.toLowerCase().endsWith(".pdf") ? ".pdf" : ".docx");
        String type = key.endsWith(".pdf") ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        documents.save(key, bytes);
        return profiles.saveResume(user, filename, key, type, (long) bytes.length, text);
    }

    @Transactional(readOnly = true)
    public Download download(Long user, Long id) {
        var profile = profiles.findByUserId(user).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        var resume = profiles.findResumeById(id).filter(r -> r.profileId().equals(profile.id()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return new Download(resume.originalFileName(), resume.contentType(), documents.read(resume.storageKey()));
    }
    public record Download(String filename, String contentType, byte[] bytes) {}
}
