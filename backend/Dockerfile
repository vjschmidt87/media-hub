FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests -B

FROM eclipse-temurin:21-jre
WORKDIR /app
# Import the corporate Zscaler CA so outbound HTTPS requests from the JVM succeed
# on networks that use Zscaler SSL inspection (the JVM has its own truststore
# separate from the OS, so it must be updated explicitly).
COPY zscaler-ca.pem /tmp/zscaler-ca.pem
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends ca-certificates ca-certificates-java && \
    cp /tmp/zscaler-ca.pem /usr/local/share/ca-certificates/zscaler-root-ca.crt && \
    update-ca-certificates && \
    cp /etc/ssl/certs/java/cacerts $JAVA_HOME/lib/security/cacerts && \
    rm -rf /var/lib/apt/lists/* /tmp/zscaler-ca.pem
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8091
ENTRYPOINT ["java", "-jar", "app.jar"]
