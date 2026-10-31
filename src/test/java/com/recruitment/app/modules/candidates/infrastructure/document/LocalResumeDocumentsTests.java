package com.recruitment.app.modules.candidates.infrastructure.document;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.web.server.ResponseStatusException;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.zip.*;
import static org.junit.jupiter.api.Assertions.*;

class LocalResumeDocumentsTests {
    @TempDir Path directory;
    @Test void docxPreservesParagraphsAndVietnameseText() throws Exception {
        var documents = new LocalResumeDocuments(directory.toString());
        String xml = "<w:document xmlns:w='http://schemas.openxmlformats.org/wordprocessingml/2006/main'><w:body><w:p><w:r><w:t>Kỹ sư phần mềm có kinh nghiệm Java Spring Boot</w:t></w:r></w:p><w:p><w:r><w:t>SQL và kiểm thử phần mềm</w:t></w:r></w:p></w:body></w:document>";
        assertEquals("Kỹ sư phần mềm có kinh nghiệm Java Spring Boot\nSQL và kiểm thử phần mềm", documents.extract(docx(xml), "cv.docx"));
    }
    @Test void rejectsExternalEntitiesUnsupportedExtensionsAndUnreadableDocuments() throws Exception {
        var documents = new LocalResumeDocuments(directory.toString());
        assertThrows(ResponseStatusException.class, () -> documents.extract(docx("<!DOCTYPE x [<!ENTITY ext SYSTEM 'file:///etc/passwd'>]><x>&ext;</x>"), "cv.docx"));
        assertThrows(ResponseStatusException.class, () -> documents.extract(new byte[]{1,2,3}, "cv.exe"));
        assertThrows(ResponseStatusException.class, () -> documents.extract(new byte[0], "cv.pdf"));
        assertThrows(ResponseStatusException.class, () -> documents.read("../../outside"));
    }
    @Test void rawFilesRoundTripWithoutOverwritingExistingFiles() {
        var documents = new LocalResumeDocuments(directory.toString());
        byte[] bytes = {1,2,3}; documents.save("cv/1/file.pdf", bytes);
        assertArrayEquals(bytes, documents.read("cv/1/file.pdf"));
        assertThrows(IllegalStateException.class, () -> documents.save("cv/1/file.pdf", bytes));
    }
    private byte[] docx(String xml) throws Exception {
        var bytes = new ByteArrayOutputStream();
        try (var zip = new ZipOutputStream(bytes)) { zip.putNextEntry(new ZipEntry("word/document.xml")); zip.write(xml.getBytes(StandardCharsets.UTF_8)); zip.closeEntry(); }
        return bytes.toByteArray();
    }
}
