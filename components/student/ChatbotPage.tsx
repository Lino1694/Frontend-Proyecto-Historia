import React, { useState } from 'react';
import ChatbotView from './ChatbotView';
import ChatbotSelection from './ChatbotSelection';

const ChatbotPage: React.FC = () => {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

    if (selectedTopic) {
        return <ChatbotView topicId={selectedTopic} onBack={() => setSelectedTopic(null)} />;
    }

    return (
        <div className="min-h-full bg-brand-cream p-6 animate-scale-in">
            <ChatbotSelection onSelect={setSelectedTopic} />
        </div>
    );
};

export default ChatbotPage;