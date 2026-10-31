package com.recruitment.app.modules.candidates.api;

import com.recruitment.app.modules.candidates.application.ResumeUploadService;
import com.recruitment.app.modules.candidates.api.dto.CandidateDtos.ResumeResponse;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/v1/candidates/me/resumes")
@PreAuthorize("hasAuthority('ROLE_CANDIDATE')")
public class ResumeFileController {
    private final ResumeUploadService resumes;
    public ResumeFileController(ResumeUploadService resumes) { this.resumes = resumes; }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResumeResponse> upload(Authentication auth, @RequestPart("file") MultipartFile file) throws IOException {
        var r = resumes.upload(Long.parseLong(auth.getName()), file.getOriginalFilename(), file.getBytes());
        return ResponseEntity.status(HttpStatus.CREATED).body(new ResumeResponse(r.id(), r.originalFileName(),
                r.contentType(), r.fileSizeBytes(), r.primaryResume(), r.scanStatus(), r.createdAt()));
    }

    @GetMapping("/{id}/file")
    public ResponseEntity<byte[]> download(Authentication auth, @PathVariable("id") Long id) {
        var file = resumes.download(Long.parseLong(auth.getName()), id);
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(file.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(file.filename(), StandardCharsets.UTF_8).build().toString())
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(file.bytes());
    }
}
