import React, { useState, useRef, useEffect } from 'react';
import { ChatIcon } from './icons/ChatIcon';
import { sendMessage, startChat } from '../services/chatService';

interface Message {
    sender: 'user' | 'bot';
    text: string;
}

const ChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        startChat();
        setMessages([{ sender: 'bot', text: 'Hello! How can I help you today?' }]);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const stream = await sendMessage(input);
        
        let botResponse = '';
        setMessages(prev => [...prev, { sender: 'bot', text: '' }]);

        for await (const chunk of stream) {
            botResponse += chunk.text;
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = botResponse;
                return newMessages;
            });
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed bottom-8 right-8 z-50 no-print">
            <div className={`transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="w-80 h-[28rem] bg-background-secondary rounded-lg border border-border-primary flex flex-col shadow-2xl">
                    <header className="p-3 border-b border-border-primary flex justify-between items-center">
                        <h3 className="font-oswald uppercase text-text-primary">AI Chat Assistant</h3>
                    </header>
                    <div className="flex-1 p-3 overflow-y-auto space-y-3">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-accent text-accent-text' : 'bg-background-tertiary text-text-default'}`}>
                                    {msg.text}
                                    {isLoading && msg.sender === 'bot' && index === messages.length -1 && <span className="inline-block w-1 h-3 bg-current ml-1 animate-pulse"></span>}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-3 border-t border-border-primary">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask something..."
                            className="w-full p-2 bg-background-primary text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-accent-border border border-border-primary"
                            disabled={isLoading}
                        />
                    </form>
                </div>
            </div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="mt-4 float-right w-16 h-16 bg-accent rounded-full flex items-center justify-center text-accent-text shadow-lg hover:bg-accent-hover transition-transform duration-200 hover:scale-110"
                aria-label="Toggle chat"
            >
                <ChatIcon className="w-8 h-8" />
            </button>
        </div>
    );
};

export default ChatBot;
