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
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Start a New Conversation</h3>
        
        <div className="form-control mb-4">
          <input
            type="text"
            placeholder="Search users..."
            className="input input-bordered"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="max-h-60 overflow-y-auto">
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
                className="flex items-center gap-3 p-3 hover:bg-base-200 cursor-pointer rounded-lg"
                onClick={() => onSelectUser(user)}
              >
                <div className="avatar">
                  <div className="w-10 rounded-full">
                    {user.imageUrl ? (
                      <Image 
                        src={user.imageUrl} 
                        alt={user.name}
                        width={40}
                        height={40}
                      />
                    ) : (
                      <div className={"bg-primary text-white flex items-center justify-center w-10 h-10 rounded-full font-bold"}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">{user.name}</h4>
                  <p className="text-sm text-base-content/70">{user.email}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="modal-action">
          <button 
            className="btn"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}