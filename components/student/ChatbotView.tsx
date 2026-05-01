import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { PaperAirplaneIcon } from '../icons/PaperAirplaneIcon';

const topics: Record<string, { name: string; character: { name: string; avatar: string; }; introMessage: string }> = {
    'inka': {
        name: 'Imperio Inca',
        character: { name: 'Apu Huallpa', avatar: '🦙' },
        introMessage: '¡Saludos, joven explorador! Soy Apu Huallpa, guardián de los quipus. En mi tiempo, construimos caminos que unían el imperio y templos que tocaban el cielo. ¿Qué deseas saber sobre el Tahuantinsuyo?'
    },
    'caral': {
        name: 'Civilización Caral',
        character: { name: 'Sacerdote de Caral', avatar: '🏛️' },
        introMessage: '¡Bienvenido, joven aprendiz! Soy un sacerdote de Caral. Construimos pirámides que aún se yerguen y vivimos en paz junto al río. ¿Te gustaría conocer nuestras tradiciones y arquitectura?'
    },
    'viceroyalty': {
        name: 'El Virreinato del Perú',
        character: { name: 'Don Francisco de Toledo', avatar: '🏰' },
        introMessage: '¡Buen día, joven súbdito! Soy Don Francisco de Toledo, Virrey del Perú. Goberné con justicia y orden, organizando esta gran colonia. ¿Qué deseas saber sobre mi tiempo como virrey?'
    },
    'conquistador': {
        name: 'La Conquista Española',
        character: { name: 'Don Francisco de Ávila', avatar: '⚔️' },
        introMessage: '¡Por la corona española! Soy Don Francisco de Ávila. Estuve presente en la llegada al Perú y vi el encuentro de dos mundos. ¿Quieres oír sobre las expediciones y batallas que forjaron esta nueva era?'
    },
    'independencia': {
        name: 'La Independencia',
        character: { name: 'Don José de la Mar', avatar: '🕊️' },
        introMessage: '¡Por la libertad, joven patriota! Soy Don José de la Mar. Luché por la independencia y vi nacer a nuestra nación libre. ¡Es un honor contarte sobre los valientes que nos dieron una patria soberana!'
    }
};

interface Message {
    sender: 'user' | 'bot';
    text: string;
}

interface ChatbotViewProps {
    topicId: string;
    onBack: () => void;
}

const ChatbotView: React.FC<ChatbotViewProps> = ({ topicId, onBack }) => {
    const topic = topics[topicId] || topics['pre-inca'];
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages([{ sender: 'bot', text: topic.introMessage }]);
    }, [topicId, topic.introMessage]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            // Build conversation history
            const conversation = messages.concat(userMessage).map(msg => {
                if (msg.sender === 'bot') {
                    return `Asistente: ${msg.text}`;
                } else {
                    return `Usuario: ${msg.text}`;
                }
            }).join('\n');

            const fullPrompt = `${topic.systemPrompt}\n\nConversación anterior:\n${conversation}\n\nAsistente:`;

            const response = await fetch('http://localhost:5000/api/ollama/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    character: topicId,
                    prompt: fullPrompt,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response from Ollama');
            }

            const data = await response.json();
            const botMessage: Message = { sender: 'bot', text: data.response };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = { sender: 'bot', text: 'Tuve un problema al procesar tu pregunta. Intenta de nuevo.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-brand-cream animate-scale-in">
            <header className="p-4 bg-brand-offwhite shadow-sm flex items-center justify-between sticky top-0 z-10">
                <button onClick={onBack} className="flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-800 transition-colors text-base">
                    <ArrowLeftIcon className="h-4 w-4" />
                    <span>Clases</span>
                </button>
                <div className="text-center">
                    <h1 className="font-bold text-slate-800">{topic.name}</h1>
                    <p className="text-sm text-slate-500">con {topic.character.name}</p>
                </div>
                <div className="w-16"></div> {/* Spacer */}
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'bot' && (
                            <div className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center flex-shrink-0">{topic.character.avatar}</div>
                        )}
                        <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-brand-orange text-white rounded-br-none' : 'bg-brand-offwhite text-slate-800 rounded-bl-none shadow-sm'}`}>
                            <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex items-end gap-2 justify-start">
                        <div className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center flex-shrink-0">{topic.character.avatar}</div>
                        <div className="max-w-[80%] p-3 rounded-2xl bg-brand-offwhite text-slate-800 rounded-bl-none shadow-sm">
                            <div className="flex gap-1.5 items-center">
                                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-2 bg-brand-offwhite/90 backdrop-blur-lg border-t border-brand-cream">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Escribe tu pregunta..."
                        className="flex-1 bg-brand-cream px-4 py-3 rounded-full border-2 border-transparent focus:border-brand-light-orange focus:outline-none"
                        disabled={isLoading}
                    />
                    <button type="submit" className="bg-brand-red-orange text-white p-3 rounded-full hover:bg-brand-orange transition-colors disabled:bg-slate-400" disabled={isLoading || !input.trim()}>
                        <PaperAirplaneIcon className="h-6 w-6" />
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default ChatbotView;