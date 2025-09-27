'use client';

import { UserData } from '@/shared/types/user';
import { formatDistanceToNow } from 'date-fns';

interface UserStatusProps {
  user: UserData;
  className?: string;
}

export default function UserStatus({ user, className = '' }: UserStatusProps) {
  const formatLastSeen = (lastSeen: Date) => {
    try {
      const lastSeenDate = new Date(lastSeen);
      return formatDistanceToNow(lastSeenDate, { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  if (user.isOnline) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-xs text-green-600 dark:text-green-400">Online</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        Last seen {formatLastSeen(user.lastSeen)}
      </span>
    </div>
  );
}
