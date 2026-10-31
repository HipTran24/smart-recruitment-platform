package com.recruitment.app.recovery;

import com.recruitment.app.modules.applications.application.screening.port.out.ScreeningSubmissionStore;
import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.font.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.web.server.ResponseStatusException;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ResumePipelineIntegrationTests extends RecoveryDatabaseTest {
    static final Path UPLOADS = temporaryDirectory();
    @Autowired ScreeningSubmissionStore screenings;
    @DynamicPropertySource static void uploads(DynamicPropertyRegistry registry) { registry.add("app.resumes.directory", UPLOADS::toString); }
    static Path temporaryDirectory() { try { return Files.createTempDirectory("smartrecruit-resumes-"); } catch (Exception e) { throw new RuntimeException(e); } }

    @Test
    void realPdfUploadPersistsTextAndBytesAndEnforcesDownloadOwnership() throws Exception {
        long candidate = createUser(); long other = createUser(); profile(other);
        byte[] bytes = pdf();
        mvc.perform(multipart("/api/v1/candidates/me/resumes/upload").file(new MockMultipartFile("file", "cv.pdf", "application/pdf", bytes))
                .with(user(Long.toString(candidate)).roles("CANDIDATE")).with(csrf()))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.primaryResume").value(true)).andExpect(jsonPath("$.scanStatus").value("PENDING"));
        entityManager.flush();
        long id = jdbc.queryForObject("SELECT r.id FROM candidate_resumes r JOIN candidate_profiles p ON p.id=r.candidate_profile_id WHERE p.user_id=?", Long.class, candidate);
        assertTrue(jdbc.queryForObject("SELECT parsed_text FROM candidate_resumes WHERE id=?", String.class, id).contains("Java Spring SQL"));
        mvc.perform(get("/api/v1/candidates/me/resumes/"+id+"/file").with(user(Long.toString(candidate)).roles("CANDIDATE")))
                .andExpect(status().isOk()).andExpect(content().bytes(bytes));
        mvc.perform(get("/api/v1/candidates/me/resumes/"+id+"/file").with(user(Long.toString(other)).roles("CANDIDATE"))).andExpect(status().isNotFound());
    }

    @Test
    void changingPrimaryResumeKeepsExactlyOnePrimary() throws Exception {
        long candidate = createUser();
        for (int i = 0; i < 2; i++) {
            mvc.perform(multipart("/api/v1/candidates/me/resumes/upload").file(new MockMultipartFile("file", "cv"+i+".pdf", "application/pdf", pdf()))
                    .with(user(Long.toString(candidate)).roles("CANDIDATE")).with(csrf())).andExpect(status().isCreated());
        }
        entityManager.flush();
        long target = jdbc.queryForObject("SELECT MAX(r.id) FROM candidate_resumes r JOIN candidate_profiles p ON p.id=r.candidate_profile_id WHERE p.user_id=?", Long.class, candidate);
        mvc.perform(post("/api/v1/candidates/me/resumes/"+target+"/primary").with(user(Long.toString(candidate)).roles("CANDIDATE")).with(csrf())).andExpect(status().isNoContent());
        entityManager.flush();
        assertEquals(target, jdbc.queryForObject("SELECT r.id FROM candidate_resumes r JOIN candidate_profiles p ON p.id=r.candidate_profile_id WHERE p.user_id=? AND r.is_primary=1", Long.class, candidate));
    }

    @Test
    void malformedPdfIsRejectedWithoutCreatingAResume() throws Exception {
        long candidate = createUser();
        mvc.perform(multipart("/api/v1/candidates/me/resumes/upload").file(new MockMultipartFile("file", "broken.pdf", "application/pdf", "not a pdf".getBytes()))
                .with(user(Long.toString(candidate)).roles("CANDIDATE")).with(csrf())).andExpect(status().isUnprocessableEntity());
        assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM candidate_resumes r JOIN candidate_profiles p ON p.id=r.candidate_profile_id WHERE p.user_id=?", Integer.class, candidate));
    }

    @Test
    void screeningPreparationRequiresConsentAndDeduplicatesIdenticalInputs() throws Exception {
        long candidate = createUser(); long recruiter = createUser(); long job = job(recruiter); long profile = profile(candidate);
        jdbc.update("UPDATE jobs SET requirements='Java;SQL' WHERE id=?", job);
        jdbc.update("INSERT INTO candidate_resumes(version,created_at,updated_at,candidate_profile_id,original_file_name,storage_key,content_type,file_size_bytes,is_primary,scan_status,parsed_text) VALUES(0,NOW(),NOW(),?,'cv.pdf',?,'application/pdf',100,1,'PENDING','Java Spring SQL experience')", profile, java.util.UUID.randomUUID().toString());
        long resume = lastId(); long application = application(job, profile);
        jdbc.update("UPDATE job_applications SET candidate_resume_id=? WHERE id=?", resume, application);
        assertThrows(ResponseStatusException.class, () -> screenings.prepare(recruiter, application));
        jdbc.update("UPDATE candidate_profiles SET ai_processing_consented=1,consented_at=NOW() WHERE id=?", profile);
        var first = screenings.prepare(recruiter, application);
        assertTrue(first.dispatch());
        var second = screenings.prepare(recruiter, application);
        // Pending attempts can be redispatched after a restart; the same audit row is reused.
        assertTrue(second.dispatch()); assertEquals(first.id(), second.id());
        assertThrows(ResponseStatusException.class, () -> screenings.status(createUser(), application));
    }

    @Test
    void oldLanguagePolicyIsNotReusedForVietnameseScreening() {
        long candidate = createUser(); long recruiter = createUser(); long job = job(recruiter); long profile = profile(candidate);
        jdbc.update("UPDATE jobs SET requirements='Java;SQL' WHERE id=?", job);
        jdbc.update("UPDATE candidate_profiles SET ai_processing_consented=1,consented_at=NOW() WHERE id=?", profile);
        jdbc.update("INSERT INTO candidate_resumes(version,created_at,updated_at,candidate_profile_id,original_file_name,storage_key,content_type,file_size_bytes,is_primary,scan_status,parsed_text) VALUES(0,NOW(),NOW(),?,'cv.pdf',?,'application/pdf',100,1,'PENDING','Java Spring SQL experience')", profile, java.util.UUID.randomUUID().toString());
        long resume = lastId(); long application = application(job, profile);
        jdbc.update("UPDATE job_applications SET candidate_resume_id=? WHERE id=?", resume, application);
        var original = screenings.prepare(recruiter, application);
        jdbc.update("UPDATE application_screenings SET prompt_version='gemini-cv-screening-v1',status='COMPLETED' WHERE id=?", original.id());
        entityManager.clear();
        var vietnamese = screenings.prepare(recruiter, application);
        assertTrue(vietnamese.dispatch());
        assertNotEquals(original.id(), vietnamese.id());
        assertEquals("gemini-cv-screening-v2-vi", jdbc.queryForObject("SELECT prompt_version FROM application_screenings WHERE id=?", String.class, vietnamese.id()));
    }

    static byte[] pdf() throws Exception {
        try (var document = new PDDocument(); var bytes = new ByteArrayOutputStream()) {
            var page = new PDPage(); document.addPage(page);
            try (var stream = new PDPageContentStream(document, page)) {
                stream.beginText(); stream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                stream.newLineAtOffset(40, 700); stream.showText("Java Spring SQL experience in software development and testing."); stream.endText();
            }
            document.save(bytes); return bytes.toByteArray();
        }
    }
}
