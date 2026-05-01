import React, { useState } from 'react';

interface AvatarConfig {
    base: string;
    hair: string;
    eyes: string;
    mouth: string;
    clothing: string;
    accessory: string;
}

interface AvatarEditorProps {
    onClose: () => void;
    onSave: (config: AvatarConfig) => void;
    initialConfig?: AvatarConfig;
}

const options = {
    base: ['🧑🏻‍🦱', '🧑🏼‍🦱', '🧑🏽‍🦱', '🧑🏾‍🦱', '🧑🏿‍🦱'],
    hair: ['👨‍🦰', '👨‍🦱', '👨‍🦳', '👱‍♂️'],
    eyes: ['👀', '👁️', '🤨', '😊'],
    mouth: ['😀', '🙂', '😮', '😐'],
    clothing: ['👕', '👚', '👔', '👘'],
    accessory: ['👓', '🕶️', '🧢', '🎩'],
};

const AvatarEditor: React.FC<AvatarEditorProps> = ({ onClose, onSave }) => {
    // For this demo, we use emojis. In a real app, these would be layerable SVG parts.
    const [config, setConfig] = useState({
        preview: '🧑‍🎓',
    });

    const handleSave = () => {
        // In a real implementation, we'd pass back the detailed config object
        onSave({} as any);
    }
    
    return (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-30 backdrop-blur-sm">
            <div className="bg-brand-offwhite rounded-2xl p-6 shadow-xl w-full max-w-sm animate-scale-in flex flex-col" style={{maxHeight: '90vh'}}>
                <div className="text-center mb-4">
                     <div className="relative inline-block">
                        <div className="w-32 h-32 rounded-full bg-brand-yellow-orange flex items-center justify-center text-6xl shadow-inner">
                            <span>{config.preview}</span>
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mt-2">Personaliza tu Avatar</h2>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2">
                    <AvatarOptionCategory title="Base / Cabello" options={options.base.concat(options.hair)} onSelect={(val) => setConfig(c => ({...c, preview: val}))}/>
                    <AvatarOptionCategory title="Ojos / Expresión" options={options.eyes.concat(options.mouth)} onSelect={(val) => setConfig(c => ({...c, preview: val}))}/>
                    <AvatarOptionCategory title="Ropa / Accesorios" options={options.clothing.concat(options.accessory)} onSelect={(val) => setConfig(c => ({...c, preview: val}))}/>
                </div>

                <div className="mt-6 flex gap-3">
                    <button onClick={onClose} className="flex-1 bg-slate-200 text-slate-700 font-bold py-3 rounded-lg hover:bg-slate-300 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSave} className="flex-1 bg-brand-red-orange text-white font-bold py-3 rounded-lg hover:bg-brand-orange transition-colors">
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};

const AvatarOptionCategory: React.FC<{title: string, options: string[], onSelect: (value: string) => void}> = ({ title, options, onSelect }) => (
    <div>
        <h3 className="font-bold text-slate-600 mb-2">{title}</h3>
        <div className="flex flex-wrap gap-2">
            {options.map(option => (
                <button 
                    key={option} 
                    onClick={() => onSelect(option)}
                    className="w-12 h-12 text-2xl bg-brand-cream rounded-lg flex items-center justify-center hover:bg-brand-yellow-orange transition-colors focus:ring-2 focus:ring-brand-orange focus:outline-none">
                    {option}
                </button>
            ))}
        </div>
    </div>
);

export default AvatarEditor;
