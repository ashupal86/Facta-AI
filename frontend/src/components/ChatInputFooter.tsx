'use client';

import { useState, KeyboardEvent } from 'react';
import MaterialIcon from './common/material-icon';

interface ChatInputFooterProps {
    onSendMessage: (message: string) => void;
    isLoading?: boolean;
    placeholder?: string;
}

export default function ChatInputFooter({
    onSendMessage,
    isLoading = false,
    placeholder = 'Type your message...'
}: ChatInputFooterProps) {
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <footer className="pt-6 flex-shrink-0">
            <div className="relative">
                <input
                    className="w-full bg-background border-transparent rounded-lg pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    placeholder={placeholder}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                />
                <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                >
                    <MaterialIcon icon="send" />
                </button>
            </div>
        </footer>
    );
}
