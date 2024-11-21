FROM openjdk:17-jdk-slim

WORKDIR /home/chat-app

COPY build/libs/chat-app-0.0.1-SNAPSHOT.jar /home/chat-app/application.jar

CMD ["java", "-jar", "application.jar"]


EXPOSE 8080