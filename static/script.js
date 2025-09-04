document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const typingIndicator = document.getElementById('typingIndicator');
    const resourcesButton = document.getElementById('resourcesButton');
    const resourcesContent = document.getElementById('resourcesContent');
    
    let chatHistory = [];
    
    // Initialize the chat
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

    // Send user message and get response
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        addMessage(message, 'user');
        chatHistory.push({
            role: 'user',
            content: message
        });
        
        // Clear input
        userInput.value = '';
        
        // Show typing indicator
        showTyping();
        
        try {
            // Send message to backend
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
    // Add message to chat UI
    function addMessage(text, sender) {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('chat-message', sender + '-message');

        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.textContent = text;
        
        messageContainer.appendChild(messageContent);
        chatMessages.appendChild(messageContainer);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Show typing indicator
    function showTyping() {
        typingIndicator.style.display = 'flex';
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Hide typing indicator
    function hideTyping() {
        typingIndicator.style.display = 'none';
    }
    
    // Load crisis resources
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