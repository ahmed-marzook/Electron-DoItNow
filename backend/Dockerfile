FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /app

COPY gradle gradle
COPY gradlew .
COPY settings.gradle .
COPY build.gradle .

# Download dependencies (this step will be cached unless build files change)
RUN ./gradlew dependencies --no-daemon || return 0

COPY src src

# Build the application
RUN ./gradlew bootJar --no-daemon -x test

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
