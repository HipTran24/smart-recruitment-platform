import com.recruitment.app.modules.identity.infrastructure.security.Argon2idMigratingPasswordEncoder;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

/** Passwords arrive only on stdin, never in command arguments or source code. */
class HashFixturePasswords {
    public static void main(String[] args) throws Exception {
        var encoder = new Argon2idMigratingPasswordEncoder();
        var input = new BufferedReader(new InputStreamReader(System.in, StandardCharsets.UTF_8));
        for (String password = input.readLine(); password != null; password = input.readLine())
            System.out.println(encoder.encode(password));
    }
}
