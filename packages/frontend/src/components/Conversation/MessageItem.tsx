'use client';

import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { MessageData } from "@/shared/types/message";
import {
  PencilIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  CheckIcon,
  ClockIcon,
  EllipsisVerticalIcon
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

interface MessageItemProps {
  message: MessageData;
  isOwnMessage: boolean;
  currentUserId: number;
  onImageClick: (imageUrl: string) => void;
  onEditMessage: (messageId: number, content: string) => void;
  onDeleteMessage: (messageId: number) => void;
  onReplyToMessage: (message: MessageData) => void;
  formatTime: (dateString: string) => string;
}

export default function MessageItem({ 
  message, 
  isOwnMessage,
  currentUserId,
  onImageClick, 
  onEditMessage,
  onDeleteMessage,
  onReplyToMessage,
  formatTime 
}: MessageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Auto-focus edit input when editing starts
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setShowContextMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEditSubmit = () => {
    if (editContent.trim() && editContent.trim() !== message.content) {
      onEditMessage(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const getMessageStatus = () => {
    if (!isOwnMessage) return null;

    if (message.readAt) {
      return <CheckBadgeIcon className="w-4 h-4 text-blue-500" title="Read" />;
    } else if (message.deliveredAt) {
      return (
        <div className="flex" title="Delivered">
          <CheckIcon className="w-3 h-3 text-gray-500 -mr-1" />
          <CheckIcon className="w-3 h-3 text-gray-500" />
        </div>
      );
    } else {
      return <CheckIcon className="w-4 h-4 text-gray-500" title="Sent" />;
    }
  };

  const canEdit = () => {
    if (!isOwnMessage || message.isDeleted) return false;
    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    const editTimeLimit = 15 * 60 * 1000; // 15 minutes
    return messageAge <= editTimeLimit;
  };

  const renderReplyPreview = () => {
    if (!message.replyToMessage) return null;

    return (
      <div className="bg-gray-100 dark:bg-gray-700 rounded p-2 mb-2 border-l-4 border-primary">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
          Replying to {message.replyToMessage.sender?.name || 'Unknown'}
        </div>
        <div className="text-sm text-gray-800 dark:text-gray-200 truncate">
          {message.replyToMessage.isDeleted 
            ? "This message was deleted" 
            : message.replyToMessage.content
          }
        </div>
      </div>
    );
  };

  const renderMessageContent = () => {
    if (message.isDeleted) {
      return (
        <div className="italic text-gray-500 dark:text-gray-400">
          <TrashIcon className="w-4 h-4 inline mr-1" />
          This message was deleted
        </div>
      );
    }

    if (isEditing && message.messageType === 'text') {
      return (
        <div className="space-y-2">
          {renderReplyPreview()}
          <textarea
            ref={editInputRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-2 rounded border resize-none bg-white dark:bg-gray-800 text-black dark:text-white"
            rows={3}
            placeholder="Edit your message..."
          />
          <div className="flex gap-2">
            <button
              onClick={handleEditSubmit}
              className="px-3 py-1 bg-primary text-primary-content rounded text-sm hover:bg-primary/80"
              disabled={!editContent.trim()}
            >
              Save
            </button>
            <button
              onClick={handleEditCancel}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    if (message.messageType === 'image') {
      return (
        <div className="space-y-2">
          {renderReplyPreview()}
          <div className="relative max-w-xs">
            <Image
              src={message.content}
              alt="Shared image"
              width={300}
              height={200}
              className="rounded-lg object-cover cursor-pointer"
              onClick={() => onImageClick(message.content)}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {renderReplyPreview()}
        <div>
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
          {message.isEdited && (
            <span className="text-xs opacity-60 ml-2">(edited)</span>
          )}
        </div>
      </div>
    );
  };

  const renderContextMenu = () => {
    if (!showContextMenu) return null;

    return (
      <div 
        ref={contextMenuRef}
        className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50 min-w-[120px]"
      >
        <button
          onClick={() => {
            onReplyToMessage(message);
            setShowContextMenu(false);
          }}
          className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
        >
          <ArrowUturnLeftIcon className="w-4 h-4" />
          Reply
        </button>
        
        {isOwnMessage && canEdit() && message.messageType === 'text' && !message.isDeleted && (
          <button
            onClick={() => {
              setIsEditing(true);
              setShowContextMenu(false);
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
          >
            <PencilIcon className="w-4 h-4" />
            Edit
          </button>
        )}
        
        {isOwnMessage && !message.isDeleted && (
          <button
            onClick={() => {
              onDeleteMessage(message.id);
              setShowContextMenu(false);
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm text-red-600"
          >
            <TrashIcon className="w-4 h-4" />
            Delete
          </button>
        )}
      </div>
    );
  };

  return (
    <motion.div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative ${
        isOwnMessage 
          ? 'bg-primary text-primary-content' 
          : 'bg-base-300 text-base-content'
      }`}>
        {/* Context menu button */}
        <button
          onClick={() => setShowContextMenu(!showContextMenu)}
          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-600 hover:bg-gray-700 text-white rounded-full p-1"
          title="Message options"
        >
          <EllipsisVerticalIcon className="w-4 h-4" />
        </button>

        {renderContextMenu()}
        
        {/* Sender info for received messages */}
        {!isOwnMessage && message.sender && (
          <div className="text-xs font-medium mb-1 opacity-80">
            {message.sender.name}
          </div>
        )}

        {renderMessageContent()}
        
        {/* Message footer with time and status */}
        <div className={`flex items-center justify-between mt-2 text-xs opacity-70 ${
          isEditing ? 'hidden' : ''
        }`}>
          <div className="flex items-center gap-1">
            <span>{formatTime(message.createdAt)}</span>
            {message.editedAt && (
              <span className="text-xs opacity-60">(edited)</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {getMessageStatus()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}