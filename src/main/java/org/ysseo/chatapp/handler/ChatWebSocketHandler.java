package org.ysseo.chatapp.handler;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.common.lang.NonNullApi;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.socket.WebSocketHandler;
import org.springframework.web.reactive.socket.WebSocketMessage;
import org.springframework.web.reactive.socket.WebSocketSession;
import org.ysseo.chatapp.model.ChatEvent;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;
import java.util.concurrent.atomic.AtomicReference;


@Slf4j
@Component
@NonNullApi
public class ChatWebSocketHandler implements WebSocketHandler {

    private final Sinks.Many<ChatEvent> chatHistory = Sinks.many().replay().limit(1000);

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Mono<Void> handle(WebSocketSession session) {
        AtomicReference<ChatEvent> lastReceivedEvent = new AtomicReference<>();
        /*  세션 메세지 받기
            1. WebSocket Message 에서 Payload 추출
            2. payload ChatEvent 객체로 변환
            3. chatHistory에 이벤트 방출
         */
        Mono<Void> messageReceive = session.receive()
                .map(WebSocketMessage::getPayloadAsText)
                .map(this::toEvent)
                .doOnNext(chatEvent -> {
                    lastReceivedEvent.set(chatEvent);
                    chatHistory.tryEmitNext(chatEvent);
                })
                .doOnComplete(() -> {
                    if (lastReceivedEvent.get() != null) {
                        lastReceivedEvent.get().setType(ChatEvent.Type.LEAVE);
                        chatHistory.tryEmitNext(lastReceivedEvent.get());
                    }
                })
                .doOnError(e->log.error("error : {}",e.getMessage()))
                .then();

        
        // 세션 메세지 전송
        Mono<Void> messageSend = session.send(chatHistory.asFlux()
                .map(this::toString)
                .map(session::textMessage))
                .doOnError(e->log.error("error : {}",e.getMessage()));
        
        return Mono.when(messageReceive, messageSend);
    }


    private ChatEvent toEvent(String payload){
        try {
            return objectMapper.readValue(payload, ChatEvent.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    private String toString(ChatEvent chatEvent) {
        try {
            return objectMapper.writeValueAsString(chatEvent);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

}
