'use client';

import Image from "next/image";
import { UserData } from "@/shared/types/user";
import UserStatus from "./UserStatus";

interface ChatHeaderProps {
  otherUser: UserData;
  isTyping?: boolean;
  formatTime: (dateString: string) => string;
}

export default function ChatHeader({ 
  otherUser, 
  isTyping = false,
  formatTime 
}: ChatHeaderProps) {
  return (
    <div className="p-4 bg-base-200 border-b border-base-300 flex items-center gap-3">
      <div className="relative flex-shrink-0">
        <div className="avatar">
          <div className="w-10 rounded-full">
            {otherUser.imageUrl ? (
              <Image 
                src={otherUser.imageUrl} 
                alt={otherUser.name}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="bg-primary text-primary-content flex items-center justify-center w-10 h-10 rounded-full font-bold">
                {otherUser.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
        {otherUser.isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-200"></div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h2 className="font-medium text-base-content">
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