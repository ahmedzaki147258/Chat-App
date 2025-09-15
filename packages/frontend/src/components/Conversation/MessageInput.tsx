'use client';

import { useRef } from 'react';

interface MessageInputProps {
  newMessage: string;
  isUploadingImage: boolean;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function MessageInput({
  newMessage,
  isUploadingImage,
  onMessageChange,
  onSendMessage,
  onFileSelect
}: MessageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSendMessage();
    }
  };

  return (
    <div className="p-4 bg-base-200 border-t border-base-300">
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileSelect}
        />
        
        <button
          className="btn btn-circle btn-outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingImage}
        >
          {isUploadingImage ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <span className="text-lg">📷</span>
          )}
        </button>
        
        <input
          type="text"
          className="input input-bordered flex-1"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isUploadingImage}
        />
        
        <button 
          className="btn btn-primary"
          onClick={onSendMessage}
          disabled={!newMessage.trim() || isUploadingImage}
        >
          Send
        </button>
      </div>
    </div>
  );
}