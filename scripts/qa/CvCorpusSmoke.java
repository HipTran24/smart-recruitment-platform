import com.recruitment.app.modules.candidates.infrastructure.document.LocalResumeDocuments;
import java.nio.file.*;
import java.security.MessageDigest;
import java.util.HexFormat;

/** Run via verify-cv-corpus.sh. Prints metadata only; never logs extracted personal information. */
class CvCorpusSmoke {
    public static void main(String[] directories) throws Exception {
        var parser = new LocalResumeDocuments(System.getProperty("java.io.tmpdir"));
        int failures = 0;
        for (String directory : directories) {
            try (var files = Files.walk(Path.of(directory))) {
                for (Path file : files.filter(p -> p.toString().toLowerCase().endsWith(".pdf") || p.toString().toLowerCase().endsWith(".docx")).sorted().toList()) {
                    long start = System.nanoTime();
                    try {
                        byte[] bytes = Files.readAllBytes(file);
                        String text = parser.extract(bytes, file.getFileName().toString());
                        String hash = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(text.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
                        System.out.printf("{\"file\":\"%s\",\"bytes\":%d,\"characters\":%d,\"extractMs\":%.2f,\"textSha256\":\"%s\",\"ok\":true}%n",
                                file.getFileName().toString().replace("\\", "\\\\").replace("\"", "\\\""), bytes.length, text.codePointCount(0, text.length()), (System.nanoTime()-start)/1_000_000.0, hash);
                    } catch (Exception e) { failures++; System.err.println("Rejected CV: " + file.getFileName() + " (" + e.getClass().getSimpleName() + ")"); }
                }
            }
        }
        if (failures != 0) System.exit(1);
    }
}
