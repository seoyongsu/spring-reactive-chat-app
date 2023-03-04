'use strict';

const loginPage = document.querySelector('#login-page');
const chatPage = document.querySelector('#chat-page');
const loginForm = document.querySelector('#loginForm');
const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#message');
const messageArea = document.querySelector('#messageArea');
const connectingElement = document.querySelector('.connecting');
const searchText = document.querySelector('#search');

let username = null;
let socket = null;


const colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];


/**
 * WebSocket Connect
 */
const connect = (event) => {
    username = document.querySelector('#name').value.trim();
    console.log(username);
    if (username) {
        loginPage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        socket = new WebSocket("ws://localhost:8080/chat");

        // Socket Open!
        socket.onopen = () => {
            socket.send(JSON.stringify({sender: username, type: 'JOIN'}));
            connectingElement.classList.add('hidden');
        };

        // Socket On Message!
        socket.onmessage = (event) => onMessageReceived(event.data);

        //Socket Close
        socket.onclose = (event) => {
            username = null;
            if (event.wasClean) {
                console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
            } else {
                alert('[close] Connection died');
            }
        };

        // Error
        socket.onerror =  (error) => {
            console.error(`[error] ${error.message}`);
            connectingElement.textContent = 'Unable to connect to server! Please refresh the page and try again';
            connectingElement.style.color = 'red';
        }
    }
    event.preventDefault();
}


/**
 * 메세지 전송
 */
const send = (event) => {
    const messageContent = messageInput.value;

    if (messageContent) {
        const chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };

        socket.send(JSON.stringify(chatMessage));
        messageInput.value = '';
        event.preventDefault();
    }
}

/**
 * 소켓 메세지 수신
 */
const onMessageReceived = (payload) => {
    const message = JSON.parse(payload);
    renderMessage(message);
}

/**
 * 메세지 랜더링
 */
const renderMessage = (message) => {

    const messageElement = document.createElement('li');
    switch (message.type) {
        case 'JOIN':
            messageElement.classList.add('event-message');
            message.content = message.sender + ' Join!';
            break;
        case 'LEAVE':
            messageElement.classList.add('event-message');
            message.content = message.sender + ' leave~~';
            break;
        default:
            messageElement.classList.add('chat-message');

            const avatarElement = document.createElement('i');
            const avatarText = document.createTextNode(message.sender[0]);
            avatarElement.appendChild(avatarText);
            avatarElement.style['background-color'] = getAvatarColor(getHash(message.sender));

            messageElement.appendChild(avatarElement);

            const usernameElement = document.createElement('span');
            const usernameText = document.createTextNode(message.sender);
            usernameElement.appendChild(usernameText);
            messageElement.appendChild(usernameElement);
            break;
    }
    const textElement = document.createElement('p');
    const messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}

/**
 * 메세지 내용 검색을 위한 해시 추출
 */
const getHash = (messageSender) => {
    let hash = 0;
    for (let i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    return hash;
}

/**
 * 채팅방 프로필 색상
 */
const getAvatarColor = (hash) => {
    const index = Math.abs(hash % colors.length);
    return colors[index];
}

searchText.addEventListener('keyup', (ev) => {
    let text = ev.target.value;
    let pat = new RegExp(text, 'i');

    for(const element of messageArea.children) {
        if (pat.test(element.innerText)) {
            element.classList.remove("hidden");
        } else {
            element.classList.add("hidden");
        }

    }
});

loginForm.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', send, true)