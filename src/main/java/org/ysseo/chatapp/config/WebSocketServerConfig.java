package org.ysseo.chatapp.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.HandlerMapping;
import org.springframework.web.reactive.handler.SimpleUrlHandlerMapping;
import org.ysseo.chatapp.handler.ChatWebSocketHandler;

import java.util.Map;

@Configuration
@Slf4j
public class WebSocketServerConfig {
    @Bean
    public HandlerMapping webSocketMapping(ChatWebSocketHandler webSocketHandler) {
        return new SimpleUrlHandlerMapping(Map.of("/chat", webSocketHandler), -1);
    }


}
