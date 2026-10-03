package com.recruitment.app;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ModuleArchitectureTests {

    private static final JavaClasses PRODUCTION_CLASSES = new ClassFileImporter()
            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
            .importPackages("com.recruitment.app");

    @Test
    void persistenceEntitiesDoNotReferenceEntitiesFromAnotherModule() throws Exception {
        List<String> violations = new ArrayList<>();

        for (Class<?> source : persistenceEntities()) {
            for (Field field : source.getDeclaredFields()) {
                verifyReference(source, field.getGenericType(), "field " + field.getName(), violations);
            }
            for (Constructor<?> constructor : source.getDeclaredConstructors()) {
                for (Type parameter : constructor.getGenericParameterTypes()) {
                    verifyReference(source, parameter, "constructor parameter", violations);
                }
            }
            for (Method method : source.getDeclaredMethods()) {
                verifyReference(source, method.getGenericReturnType(), "method return " + method.getName(), violations);
                for (Type parameter : method.getGenericParameterTypes()) {
                    verifyReference(source, parameter, "method parameter " + method.getName(), violations);
                }
            }
        }

        assertTrue(violations.isEmpty(), () -> "Cross-module persistence dependencies: " + violations);
    }

    @Test
    void domainHasNoDependenciesOnInfrastructureApplicationOrFrameworks() {
        noClasses().that().resideInAPackage("..domain..")
                .should().dependOnClassesThat().resideInAnyPackage(
                        "..infrastructure..",
                        "..application..",
                        "org.springframework..",
                        "jakarta.persistence.."
                )
                .because("Domain models must remain pure and free from framework/infrastructure bindings")
                .check(PRODUCTION_CLASSES);
    }

    @Test
    void applicationDoesNotDependOnInfrastructure() {
        noClasses().that().resideInAPackage("..application..")
                .should().dependOnClassesThat().resideInAPackage("..infrastructure..")
                .because("Application services must depend only on domain and ports, not infrastructure")
                .check(PRODUCTION_CLASSES);
    }

    @Test
    void apiDoesNotDependDirectlyOnPersistenceEntities() {
        noClasses().that().resideInAPackage("..api..")
                .should().dependOnClassesThat().resideInAPackage("..infrastructure.persistence.entity..")
                .because("API layer must exchange DTOs, never exposing persistence entities")
                .check(PRODUCTION_CLASSES);
    }

    @Test
    void modulesAreFreeOfCyclicDependencies() {
        slices().matching("com.recruitment.app.modules.(*)..")
                .should().beFreeOfCycles()
                .because("Modular monolith slices must never have circular dependencies")
                .check(PRODUCTION_CLASSES);
    }

    @Test
    void sourceAndTestFilesRespectSizeBudgets() throws IOException {
        List<String> violations = new ArrayList<>();

        Path mainRoot = Path.of("src/main/java");
        if (Files.exists(mainRoot)) {
            try (Stream<Path> stream = Files.walk(mainRoot)) {
                stream.filter(p -> p.toString().endsWith(".java")).forEach(file -> {
                    try {
                        List<String> lines = Files.readAllLines(file);
                        int lineCount = lines.size();
                        if (lineCount > 400) {
                            violations.add(file + " exceeds 400 lines: " + lineCount);
                        }
                        if (file.getFileName().toString().endsWith("Controller.java") && lineCount > 200) {
                            violations.add("Controller " + file + " exceeds 200 lines: " + lineCount);
                        }
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                });
            }
        }

        Path testRoot = Path.of("src/test/java");
        if (Files.exists(testRoot)) {
            try (Stream<Path> stream = Files.walk(testRoot)) {
                stream.filter(p -> p.toString().endsWith(".java")).forEach(file -> {
                    try {
                        int lineCount = Files.readAllLines(file).size();
                        if (lineCount > 600) {
                            violations.add("Test file " + file + " exceeds 600 lines: " + lineCount);
                        }
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                });
            }
        }

        assertTrue(violations.isEmpty(), () -> "Size budget violations:\n" + String.join("\n", violations));
    }

    private static List<Class<?>> persistenceEntities() throws URISyntaxException, java.io.IOException, ClassNotFoundException {
        URL modulesRoot = ModuleArchitectureTests.class.getClassLoader().getResource("com/recruitment/app/modules");
        if (modulesRoot == null) {
            throw new IllegalStateException("compiled module classes were not found");
        }

        Path root = Path.of(modulesRoot.toURI());
        List<Class<?>> entities = new ArrayList<>();
        try (Stream<Path> paths = Files.walk(root)) {
            for (Path path : paths.filter(Files::isRegularFile).toList()) {
                String relative = root.relativize(path).toString().replace('/', '.').replace('\\', '.');
                if (!relative.endsWith(".class") || relative.contains("$") || !relative.contains(".infrastructure.persistence.entity.")) {
                    continue;
                }
                String className = "com.recruitment.app.modules." + relative.substring(0, relative.length() - ".class".length());
                entities.add(Class.forName(className));
            }
        }
        return entities;
    }

    private static void verifyReference(Class<?> source, Type type, String location, List<String> violations) {
        if (type instanceof Class<?> target) {
            recordIfCrossModule(source, target, location, violations);
        } else if (type instanceof ParameterizedType parameterizedType) {
            for (Type argument : parameterizedType.getActualTypeArguments()) {
                verifyReference(source, argument, location, violations);
            }
        }
    }

    private static void recordIfCrossModule(Class<?> source, Class<?> target, String location, List<String> violations) {
        if (!isPersistenceEntity(source) || !isPersistenceEntity(target)) {
            return;
        }
        if (!moduleName(source).equals(moduleName(target))) {
            violations.add(source.getName() + " " + location + " references " + target.getName());
        }
    }

    private static boolean isPersistenceEntity(Class<?> type) {
        return type.getPackageName().contains(".modules.")
                && type.getPackageName().contains(".infrastructure.persistence.entity");
    }

    private static String moduleName(Class<?> type) {
        String packageName = type.getPackageName();
        int start = packageName.indexOf(".modules.") + ".modules.".length();
        int end = packageName.indexOf('.', start);
        return packageName.substring(start, end);
    }
}
