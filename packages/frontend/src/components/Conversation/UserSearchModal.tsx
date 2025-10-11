'use client';

import Image from 'next/image';
import { UserData } from '@/shared/types/user';

interface UserSearchModalProps {
  isOpen: boolean;
  searchQuery: string;
  searchResults: UserData[];
  isSearching: boolean;
  onSearchChange: (query: string) => void;
  onSelectUser: (user: UserData) => void;
  onClose: () => void;
}

export default function UserSearchModal({
  isOpen,
  searchQuery,
  searchResults,
  isSearching,
  onSearchChange,
  onSelectUser,
  onClose
}: UserSearchModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-md">
        <h3 className="font-bold text-base md:text-lg mb-4">Start a New Conversation</h3>
        
        <div className="form-control mb-4">
          <input
            type="text"
            placeholder="Search users..."
            className="input input-bordered text-sm md:text-base"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            autoFocus
          />
        </div>

        <div className="max-h-60 md:max-h-80 overflow-y-auto">
          {isSearching ? (
            <div className="text-center p-4">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          ) : searchResults.length === 0 && searchQuery ? (
            <div className="text-center p-4 text-base-content/50">
              No users found
            </div>
          ) : (
            searchResults.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 hover:bg-base-200 active:bg-base-300 cursor-pointer rounded-lg transition-colors"
                onClick={() => onSelectUser(user)}
              >
                <div className="avatar">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-full">
                    {user.imageUrl ? (
                      <Image 
                        src={user.imageUrl} 
                        alt={user.name}
                        width={40}
                        height={40}
                        className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="bg-primary text-white flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full font-bold text-sm md:text-base">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm md:text-base truncate">{user.name}</h4>
                  <p className="text-xs md:text-sm text-base-content/70 truncate">{user.email}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="modal-action">
          <button 
            className="btn btn-sm md:btn-md"
            onClick={onClose}
            aria-label="Cancel"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}