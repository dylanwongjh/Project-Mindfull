document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const typingIndicator = document.getElementById('typingIndicator');
    const resourcesButton = document.getElementById('resourcesButton');
    const resourcesContent = document.getElementById('resourcesContent');
    
    let chatHistory = [];
    
    // this function makes it so that the latest message sent is always targeted.
    function smoothScrollToBottom() {
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
            chatContainer.scrollTo({
                top: chatContainer.scrollHeight,
                behavior: 'smooth'
            });
        }
    }
    
    // initialising the chat
    async function initChat() {
        showTyping();
        try {
            const response = await fetch('/api/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            hideTyping();
            
            if (data.response) {
                addMessage(data.response, 'bot');
                chatHistory.push({
                    role: 'assistant',
                    content: data.response
                });
            } else if (data.error) {
                addMessage("I'm having trouble connecting right now. Please try again later.", 'bot');
            }
        } catch (error) {
            hideTyping();
            addMessage("Sorry, I'm experiencing technical difficulties. Please refresh the page and try again.", 'bot');
            console.error('Error:', error);
        }
    }
    
    // send user message and get a response
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // add user message to chat
        addMessage(message, 'user');
        chatHistory.push({
            role: 'user',
            content: message
        });
        
        // clear input
        userInput.value = '';
        
        // Show typing indicator
        showTyping();
        
        try {
            // send message to backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_history: chatHistory
                })
            });
            
            const data = await response.json();
            hideTyping();
            
            if (data.response) {
                addMessage(data.response, 'bot');
                chatHistory.push({
                    role: 'assistant',
                    content: data.response
                });
            } else if (data.error) {
                addMessage("I'm having trouble processing your request. Please try again.", 'bot');
            }
        } catch (error) {
            hideTyping();
            addMessage("Sorry, I'm experiencing connection issues. Please check your internet and try again.", 'bot');
            console.error('Error:', error);
        }
    }
    
    function addMessage(text, sender) {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('chat-message', sender + '-message');

        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.textContent = text;
        
        messageContainer.appendChild(messageContent);
        chatMessages.appendChild(messageContainer);
        
        setTimeout(() => {
            smoothScrollToBottom();
        }, 100);
    }
    
    // show typing indicator
    function showTyping() {
        typingIndicator.style.display = 'flex';
        // Enhanced scrolling for typing indicator
        setTimeout(() => {
            smoothScrollToBottom();
        }, 100);
    }
    
    // hide typing indicator
    function hideTyping() {
        typingIndicator.style.display = 'none';
    }
    
    // load the mental health resources
    async function loadResources() {
        if (resourcesContent.style.display === 'block') {
            resourcesContent.style.display = 'none';
            resourcesButton.textContent = 'Show Crisis Resources';
            return;
        }
        
        try {
            const response = await fetch('/api/resources?country=Singapore');
            const data = await response.json();
            
            if (data.resources) {
                resourcesContent.innerHTML = data.resources.replace(/\n/g, '<br>');
                resourcesContent.style.display = 'block';
                resourcesButton.textContent = 'Hide Resources';
            }
        } catch (error) {
            resourcesContent.innerHTML = 'Unable to load resources at this time.';
            resourcesContent.style.display = 'block';
            console.error('Error:', error);
        }
    }
    
    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    resourcesButton.addEventListener('click', loadResources);
    
    // Initialize the chat
    initChat();
});
