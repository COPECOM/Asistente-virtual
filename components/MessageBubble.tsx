import React from 'react';
import { Message, Role } from '../types';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-1 ${isUser ? 'bg-micoope-600' : 'bg-brand-orange'}`}>
          {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
        </div>

        {/* Bubble */}
        <div
          className={`px-5 py-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${
            isUser
              ? 'bg-micoope-600 text-white rounded-tr-none'
              : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
          } ${message.isError ? 'bg-red-50 border-red-200 text-red-600' : ''}`}
        >
          {isUser ? (
             <div className="whitespace-pre-wrap">{message.text}</div>
          ) : (
            <ReactMarkdown
              components={{
                p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-3 space-y-1" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-3 space-y-1" {...props} />,
                li: ({node, ...props}) => <li className="pl-1" {...props} />,
                strong: ({node, ...props}) => <span className="font-bold text-micoope-900" {...props} />,
                h3: ({node, ...props}) => <h3 className="font-semibold text-base mt-4 mb-2 text-micoope-800 uppercase tracking-wide" {...props} />,
                h2: ({node, ...props}) => <h2 className="font-bold text-lg mt-4 mb-2 text-micoope-900" {...props} />,
                a: ({node, ...props}) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
              }}
            >
              {message.text}
            </ReactMarkdown>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default MessageBubble;