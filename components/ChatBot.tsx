import React, { useState, useRef, useEffect } from 'react';
import type { Chat } from '@google/genai';
import { ChatMessage } from '../types';
import { createChat, continueChat } from '../services/geminiService';

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
);

const ChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { sender: 'bot', text: "Hi! I'm LoreBot. How can I help you learn about the Lore platform today?" }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chatRef.current) {
            chatRef.current = createChat();
        }
    }, []);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (userInput.trim() === '' || isLoading) return;

        const newUserMessage: ChatMessage = { sender: 'user', text: userInput };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);

        if (chatRef.current) {
            const botResponseText = await continueChat(chatRef.current, userInput);
            const newBotMessage: ChatMessage = { sender: 'bot', text: botResponseText };
            setMessages(prev => [...prev, newBotMessage]);
        }
        
        setIsLoading(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-5 right-5 h-16 w-16 bg-emerald-500 rounded-full text-white flex items-center justify-center shadow-lg transition-transform transform hover:scale-110 z-50 ${isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}
                aria-label="Open chat"
            >
                <ChatIcon />
            </button>

            <div className={`fixed bottom-5 right-5 w-[calc(100%-2.5rem)] max-w-sm h-[70vh] max-h-[600px] bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out z-50 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                <header className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h3 className="font-bold text-lg text-slate-200">Chat with LoreBot</h3>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white" aria-label="Close chat">
                        <CloseIcon />
                    </button>
                </header>

                <div className="flex-1 p-4 overflow-y-auto bg-slate-900">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`rounded-2xl py-2 px-4 max-w-xs ${msg.sender === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start mb-4">
                            <div className="rounded-2xl py-2 px-4 bg-slate-700 text-slate-200 rounded-bl-none">
                                <div className="flex items-center space-x-1">
                                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <footer className="p-4 border-t border-slate-700">
                    <div className="flex items-center bg-slate-700 rounded-lg">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask about Lore..."
                            className="w-full bg-transparent p-3 focus:outline-none text-sm text-slate-200 placeholder-slate-400"
                            disabled={isLoading}
                        />
                        <button onClick={handleSend} disabled={isLoading || userInput.trim() === ''} className="p-3 text-emerald-500 disabled:text-slate-500 disabled:cursor-not-allowed" aria-label="Send message">
                           <SendIcon/>
                        </button>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default ChatBot;
