# syntax=docker/dockerfile:1.7
# Build context is the verified bundle; tests/build ran before this packaging step.
FROM eclipse-temurin:25-jre-alpine@sha256:56f273059de6b13a6b49fe0ded691ed2d0399bbee76156a8f2d385f7524a3d43
RUN addgroup -g 10001 -S app && adduser -u 10001 -S -G app app
WORKDIR /app
COPY --chown=10001:10001 api.jar /app/application.jar
USER 10001:10001
EXPOSE 8080
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75.0"
ENTRYPOINT ["java", "-jar", "/app/application.jar"]
