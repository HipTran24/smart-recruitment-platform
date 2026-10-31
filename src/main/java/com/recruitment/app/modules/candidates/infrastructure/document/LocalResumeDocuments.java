package com.recruitment.app.modules.candidates.infrastructure.document;

import com.recruitment.app.modules.candidates.application.port.out.ResumeDocuments;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.*;
import java.nio.file.*;
import java.util.Locale;
import java.util.zip.ZipInputStream;

@Component
public class LocalResumeDocuments implements ResumeDocuments {
    private final Path root;
    public LocalResumeDocuments(@Value("${app.resumes.directory:uploads}") String directory) {
        root = Path.of(directory).toAbsolutePath().normalize();
    }

    @Override
    public String extract(byte[] content, String filename) {
        if (content.length == 0 || content.length > 10 * 1024 * 1024)
            throw rejected("CV phải có dung lượng từ 1 byte đến 10 MB.");
        try {
            String name = filename.toLowerCase(Locale.ROOT);
            String text;
            if (name.endsWith(".pdf")) text = pdf(content);
            else if (name.endsWith(".docx")) text = docx(content);
            else throw rejected("Chỉ hỗ trợ PDF và DOCX.");
            text = text.replace("\u0000", "").strip();
            if (text.length() < 30)
                throw rejected("Không đọc được nội dung CV. Với bản scan, hãy OCR trước khi tải lên.");
            if (text.length() > 60000) throw rejected("CV vượt quá giới hạn 60.000 ký tự.");
            return text;
        } catch (ResponseStatusException e) { throw e; }
        catch (Exception e) { throw rejected("File CV bị lỗi, được mã hóa hoặc không đúng định dạng."); }
    }

    private String pdf(byte[] bytes) throws IOException {
        try (var doc = Loader.loadPDF(bytes)) {
            if (doc.getNumberOfPages() > 100) throw rejected("CV không được vượt quá 100 trang.");
            if (!doc.getCurrentAccessPermission().canExtractContent()) throw rejected("PDF không cho phép đọc nội dung.");
            var stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            return stripper.getText(doc);
        }
    }

    private String docx(byte[] bytes) throws Exception {
        try (var zip = new ZipInputStream(new ByteArrayInputStream(bytes))) {
            for (var entry = zip.getNextEntry(); entry != null; entry = zip.getNextEntry()) {
                if (!entry.getName().equals("word/document.xml")) continue;
                byte[] xml = zip.readNBytes(2 * 1024 * 1024 + 1);
                if (xml.length > 2 * 1024 * 1024) throw rejected("Nội dung DOCX quá lớn.");
                var factory = DocumentBuilderFactory.newInstance();
                factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
                factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
                factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");
                factory.setNamespaceAware(true);
                var document = factory.newDocumentBuilder().parse(new ByteArrayInputStream(xml));
                var paragraphs = document.getElementsByTagNameNS("*", "p");
                var output = new StringBuilder();
                for (int i = 0; i < paragraphs.getLength(); i++) output.append(paragraphs.item(i).getTextContent()).append('\n');
                return output.toString();
            }
        }
        throw rejected("Không tìm thấy nội dung DOCX.");
    }

    @Override
    public void save(String key, byte[] content) {
        try {
            Path target = resolve(key);
            Files.createDirectories(target.getParent());
            Files.write(target, content, StandardOpenOption.CREATE_NEW);
        } catch (IOException e) { throw new IllegalStateException("Could not store resume"); }
    }

    @Override
    public byte[] read(String key) {
        try { return Files.readAllBytes(resolve(key)); }
        catch (IOException e) { throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV file not found"); }
    }

    private Path resolve(String key) {
        Path target = root.resolve(key).normalize();
        if (!target.startsWith(root)) throw rejected("Invalid file path");
        return target;
    }

    private static ResponseStatusException rejected(String message) {
        return new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, message);
    }
}
