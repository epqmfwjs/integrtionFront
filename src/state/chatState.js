// src/state/chatState.js
let chatting = false;

export const setChatting = (value) => {
  chatting = value;
};

export const getChatting = () => chatting;