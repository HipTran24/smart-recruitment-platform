package com.recruitment.app;

import org.junit.jupiter.api.Test;

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

import static org.junit.jupiter.api.Assertions.assertTrue;

class ModuleArchitectureTests {

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
