
import React, { useState, useRef } from 'react';

interface ChatInputProps {
  onSend: (text: string, imageFile?: File) => void;
  disabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [text, setText] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const resetInput = () => {
      setText('');
      setPreviewImage(null);
      setImageFile(null);
      if (fileInputRef.current) {
          fileInputRef.current.value = "";
      }
      if(textAreaRef.current){
        textAreaRef.current.style.height = 'auto';
      }
  };

  const handleSend = () => {
    if (imageFile && !text.trim()) {
      alert('Please enter a prompt for the image.');
      return;
    }

    if (text.trim() || imageFile) {
      onSend(text.trim(), imageFile || undefined);
      resetInput();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if(file.size > 4 * 1024 * 1024){
        alert("File is too large. Please select an image smaller than 4MB.");
        return;
      }
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
      textAreaRef.current?.focus();
    }
  };

  const removeImage = () => {
      setPreviewImage(null);
      setImageFile(null);
      if (fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  };
  
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  return (
    <div className="p-2 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      {previewImage && (
        <div className="relative w-24 h-24 mb-2 ml-12 rounded-md overflow-hidden">
            <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
            <button 
              onClick={removeImage} 
              className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-0 w-5 h-5 flex items-center justify-center text-xs"
              aria-label="Remove image"
            >
                &times;
            </button>
        </div>
      )}
      <div className="flex items-end space-x-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 self-end mb-1"
          aria-label="Attach file"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        <textarea
          ref={textAreaRef}
          value={text}
          onInput={handleInput}
          onKeyDown={handleKeyPress}
          placeholder={imageFile ? "Describe the image..." : "Type a message..."}
          className="flex-1 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white resize-none"
          rows={1}
          style={{ maxHeight: '120px' }}
          disabled={disabled}
        />
        
        <button
          onClick={handleSend}
          disabled={disabled || (!text.trim() && !imageFile)}
          className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors self-end mb-1"
          aria-label="Send message"
        >
         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};
