package org.ysseo.chatapp.model;


import lombok.*;

@Setter
@Getter
@NoArgsConstructor
@ToString
public class ChatEvent {

    private Type type;
    private String content;
    private String sender;

    public enum Type {
        CHAT, JOIN, LEAVE
    }
}
