import React, { useState, useRef, useEffect } from 'react';
import { CreditCard, Menu, X, MessageSquare, Info, PlusCircle, Trash2 } from 'lucide-react';
import { GenerateContentResponse } from "@google/genai";
import MessageBubble from './components/MessageBubble';
import InputArea from './components/InputArea';
import TypingIndicator from './components/TypingIndicator';
import { streamGeminiResponse } from './services/geminiService';
import { Message, Role, QuickPrompt } from './types';
import { QUICK_PROMPTS } from './constants';

const App: React.FC = () => {
  const INITIAL_MESSAGE: Message = {
    id: 'welcome',
    role: Role.MODEL,
    text: '¡Hola! Soy tu asistente virtual de COPECOM. 🏦\n\nEstoy aquí para resolver tus dudas sobre nuestras Tarjetas de Crédito y Débito VISA. ¿En qué puedo ayudarte hoy?',
    timestamp: new Date()
  };

  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Create a placeholder for the bot response
    const botMessageId = (Date.now() + 1).toString();
    
    try {
      const stream = await streamGeminiResponse(text, messages);
      
      let fullText = "";
      
      // Initialize the bot message
      setMessages(prev => [
        ...prev, 
        {
          id: botMessageId,
          role: Role.MODEL,
          text: "",
          timestamp: new Date()
        }
      ]);

      for await (const chunk of stream) {
        const c = chunk as GenerateContentResponse;
        const newText = c.text;
        if (newText) {
          fullText += newText;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === botMessageId 
                ? { ...msg, text: fullText } 
                : msg
            )
          );
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: Role.MODEL,
          text: "Lo siento, tuve un problema al procesar tu solicitud. Por favor intenta de nuevo.",
          timestamp: new Date(),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: QuickPrompt) => {
    handleSendMessage(prompt.query);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleNewChat = () => {
    setMessages([INITIAL_MESSAGE]);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:relative inset-y-0 left-0 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out z-30 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-gray-100 bg-micoope-900">
            <CreditCard className="text-brand-orange mr-2" size={24} />
            <span className="font-bold text-lg text-white tracking-wide">MICOOPE</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            
            <button
              onClick={handleNewChat}
              className="w-full mb-6 bg-brand-orange hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle size={18} />
              Nueva Conversación
            </button>

            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
                Consultas Frecuentes
              </h3>
              <div className="space-y-2">
                {QUICK_PROMPTS.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="w-full text-left p-3 rounded-lg text-sm text-gray-600 hover:bg-micoope-50 hover:text-micoope-700 transition-colors flex items-start group"
                  >
                    <MessageSquare size={16} className="mt-0.5 mr-3 text-gray-400 group-hover:text-micoope-500 flex-shrink-0" />
                    <span>{prompt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-start">
                <Info size={18} className="text-micoope-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-micoope-800 mb-1">¿Sabías qué?</h4>
                  <p className="text-xs text-micoope-700 leading-relaxed">
                    Puedes realizar retiros GRATIS en toda la Red MICOOPE con tu tarjeta de débito.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 text-center">
             <p className="text-xs text-gray-400">© 2025 MICOOPE Assistant</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-white border-b border-gray-200 shadow-sm z-10">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 -ml-2 mr-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex flex-col">
              <h1 className="font-semibold text-gray-800 text-lg">Asistente Virtual</h1>
              <span className="text-xs text-green-600 flex items-center font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                En línea
              </span>
            </div>
          </div>
          <button 
            onClick={handleNewChat}
            className="lg:hidden text-gray-500 hover:text-brand-orange p-2"
            title="Nueva Conversación"
          >
            <Trash2 size={20} />
          </button>
        </header>

        {/* Chat Area */}
        <div 
          className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar bg-slate-50"
          ref={chatContainerRef}
        >
          <div className="max-w-4xl mx-auto">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-6">
                 <div className="flex flex-row items-end gap-2">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-brand-orange flex items-center justify-center">
                       <CreditCard size={16} className="text-white" />
                    </div>
                    <TypingIndicator />
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
      </main>
    </div>
  );
};

export default App;