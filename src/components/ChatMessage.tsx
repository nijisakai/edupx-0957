
import React, { useState, useEffect } from 'react';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  botAvatarUrl: string;
  userName: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, botAvatarUrl, userName }) => {
  const isUser = message.sender === 'user';
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (message.imageFile) {
      objectUrl = URL.createObjectURL(message.imageFile);
      setImageUrl(objectUrl);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [message.imageFile]);

  const formatText = (text: string) => {
    let formattedText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/```([\s\S]*?)```/g, '<pre><code class="block whitespace-pre-wrap bg-slate-200 dark:bg-slate-700 rounded p-2 text-sm font-mono">$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-200 dark:bg-slate-700 rounded px-1 py-0.5 text-sm font-mono">$1</code>')
      .replace(/\n/g, '<br />');
    return { __html: formattedText };
  };

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <img src={botAvatarUrl} alt="bot avatar" className="w-8 h-8 rounded-full flex-shrink-0" />
      )}
      <div
        className={`flex flex-col max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-lg'
            : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-lg'
        }`}
      >
        {imageUrl && (
            <img src={imageUrl} alt="User upload" className="rounded-lg mb-2 max-h-60 w-full object-cover" />
        )}
        {message.text ? <div className="text-sm break-words" dangerouslySetInnerHTML={formatText(message.text)}></div> : <div className="w-2 h-2"></div>}
      </div>
       {isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 text-white flex items-center justify-center font-bold">
          {userName.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};
