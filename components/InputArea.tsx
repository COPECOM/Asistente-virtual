import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface InputAreaProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading }) => {
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText.trim());
      setInputText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto flex items-end gap-2">
        <div className="relative flex-grow">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pregunta sobre tu tarjeta Visa MICOOPE..."
            className="w-full py-3 pl-4 pr-12 bg-gray-50 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-micoope-500 focus:border-transparent outline-none resize-none overflow-hidden min-h-[48px] max-h-[120px] text-gray-800 placeholder-gray-400"
            rows={1}
            disabled={isLoading}
          />
          <div className="absolute right-3 bottom-3 text-gray-400">
           {isLoading && <Sparkles size={18} className="animate-pulse text-brand-orange" />}
          </div>
        </div>
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className={`p-3 rounded-full flex-shrink-0 transition-colors ${
            !inputText.trim() || isLoading
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-micoope-600 hover:bg-micoope-700 text-white shadow-md'
          }`}
        >
          <Send size={20} />
        </button>
      </form>
      <div className="text-center mt-2">
         <p className="text-xs text-gray-400">
           El asistente puede cometer errores. Verifica la información importante con tu agencia.
         </p>
      </div>
    </div>
  );
};

export default InputArea;