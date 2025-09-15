'use client';

import Image from "next/image";
import { UserData } from "@/shared/types/user";

interface ChatHeaderProps {
  otherUser: UserData;
  formatTime: (dateString: string) => string;
}

export default function ChatHeader({ otherUser, formatTime }: ChatHeaderProps) {
  return (
    <div className="p-4 bg-base-200 border-b border-base-300 flex items-center gap-3">
      <div className="relative">
        <div className="avatar">
          <div className="w-10 rounded-full">
            {otherUser.imageUrl ? (
              <Image 
                src={otherUser.imageUrl} 
                alt={otherUser.name}
                width={40}
                height={40}
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
      
      <div>
        <h2 className="font-medium text-base-content">
          {otherUser.name}
        </h2>
        <p className="text-xs text-base-content/50">
          {otherUser.isOnline 
            ? 'Online now' 
            : `Last seen ${formatTime(otherUser.lastSeen.toString())}`}
        </p>
      </div>
    </div>
  );
}