import MaterialIcon from './common/material-icon';

interface ChatMessageProps {
    type: 'user' | 'ai';
    content: string;
    card?: React.ReactNode;
}

export default function ChatMessage({ type, content, card }: ChatMessageProps) {
    if (type === 'user') {
        return (
            <div className="flex justify-end">
                <div className="bg-primary text-white rounded-xl rounded-br-none p-4 max-w-lg">
                    <p className="text-sm">{content}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-start">
            <div className="bg-background rounded-xl rounded-bl-none p-4 max-w-lg">
                {content && (
                    <p className="text-sm text-secondary mb-4">{content}</p>
                )}
                {card && card}
            </div>
        </div>
    );
}
