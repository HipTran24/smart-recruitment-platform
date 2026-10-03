# syntax=docker/dockerfile:1.7

# Build with the same Java major version declared by pom.xml.
FROM maven:3.9.16-eclipse-temurin-25 AS build

WORKDIR /workspace

# Cache dependencies separately from source code for faster iterative builds.
COPY pom.xml ./
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B -ntp -DskipTests dependency:go-offline

COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B -ntp -DskipTests package

FROM eclipse-temurin:25-jre-alpine AS runtime

RUN apk add --no-cache wget \
    && addgroup -S app \
    && adduser -S app -G app
WORKDIR /app

COPY --from=build /workspace/target/*.jar /app/application.jar

USER app
EXPOSE 8080

ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["java", "-jar", "/app/application.jar"]
