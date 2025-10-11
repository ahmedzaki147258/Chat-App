'use client';

import Image from "next/image";
import { UserData } from "@/shared/types/user";
import UserStatus from "./UserStatus";

interface ChatHeaderProps {
  otherUser: UserData;
  isTyping?: boolean;
  showBackButton?: boolean;
  onBackClick?: () => void;
  formatTime: (dateString: string) => string;
}

export default function ChatHeader({ 
  otherUser, 
  isTyping = false,
  showBackButton = false,
  onBackClick
}: ChatHeaderProps) {
  return (
    <div className="p-3 md:p-4 bg-base-200 border-b border-base-300 flex items-center gap-2 md:gap-3">
      {/* Back button for mobile */}
      {showBackButton && (
        <button
          onClick={onBackClick}
          className="btn btn-ghost btn-sm btn-circle md:hidden flex-shrink-0"
          aria-label="Back to conversations"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      
      <div className="relative flex-shrink-0">
        <div className="avatar">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full">
            {otherUser.imageUrl ? (
              <Image 
                src={otherUser.imageUrl} 
                alt={otherUser.name}
                width={40}
                height={40}
                className="rounded-full object-cover w-9 h-9 md:w-10 md:h-10"
              />
            ) : (
              <div className="bg-primary text-primary-content flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full font-bold text-sm md:text-base">
                {otherUser.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
        {otherUser.isOnline && (
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-success rounded-full border-2 border-base-200"></div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h2 className="text-sm md:text-base font-medium text-base-content truncate">
          {otherUser.name}
        </h2>
        
        {/* Show typing indicator or user status */}
        <div className="text-xs">
          {isTyping ? (
            <div className="flex items-center gap-1 text-primary">
              <span>typing</span>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-current rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1 h-1 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          ) : (
            <UserStatus user={otherUser} />
          )}
        </div>
      </div>
    </div>
  );
}