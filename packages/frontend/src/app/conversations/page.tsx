'use client';

import { toast } from 'sonner';
import { apiClient } from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import useSocket from '@/hooks/useSocket';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { UserData } from '@/shared/types/user';
import { useEffect, useState, useCallback, useRef } from 'react';
import { ConversationData, MessageData } from '@/shared/types/message';
import { allowedImageFormat, maxImageSize } from '@/shared/types/image';

// Import components
import LoadingScreen from '@/components/Conversation/LoadingScreen';
import ConversationSidebar from '@/components/Conversation/ConversationSidebar';
import ChatHeader from '@/components/Conversation/ChatHeader';
import MessagesContainer from '@/components/Conversation/MessagesContainer';
import NewMessagesIndicator from '@/components/Conversation/NewMessagesIndicator';
import MessageInput from '@/components/Conversation/MessageInput';
import UserSearchModal from '@/components/Conversation/UserSearchModal';
import ImagePreviewModal from '@/components/Conversation/ImagePreviewModal';
import WelcomeScreen from '@/components/Conversation/WelcomeScreen';

export default function ConversationsPage() {
  // Hooks
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading, user } = useAuth();
  const {
    socket,
    isConnected,
    sendMessage,
    editMessage,
    deleteMessage,
    markMessageRead,
    sendTyping,
    onNewMessage,
    offNewMessage,
    onMessageEdited,
    offMessageEdited,
    onMessageDeleted,
    offMessageDeleted,
    onMessageRead,
    offMessageRead,
    onUserTyping,
    offUserTyping,
    onUserStatusChanged,
    offUserStatusChanged,
    onNewConversation,
    offNewConversation
  } = useSocket(isAuthenticated);

  // State
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationData | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserData[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyToMessage, setReplyToMessage] = useState<MessageData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<number, UserData>>(new Map());
  const [userStatuses, setUserStatuses] = useState<Map<number, UserData>>(new Map());
  const [isMobileSidebarVisible, setIsMobileSidebarVisible] = useState(true);

  // Refs
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Callbacks
  const scrollToBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  const checkIfAtBottom = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    const container = messagesContainerRef.current;
    const threshold = 100;
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    
    setIsAtBottom(isAtBottom);
  
    if (isAtBottom) {
      setNewMessagesCount(0);
    }
  }, []);

  const handleScroll = useCallback(() => {
    checkIfAtBottom();
  }, [checkIfAtBottom]);

  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoadingConversations(false);
      return;
    }

    try {
      setIsLoadingConversations(true);
      const { data } = await apiClient.get<{ data: ConversationData[] }>('/api/conversations');
      setConversations(data.data);

      // Initialize user statuses
      const statusMap = new Map<number, UserData>();
      data.data.forEach(conv => {
        statusMap.set(conv.userOne.id, conv.userOne);
        statusMap.set(conv.userTwo.id, conv.userTwo);
      });
      setUserStatuses(statusMap);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoadingConversations(false);
    }
  }, [isAuthenticated]);

  const fetchMessages = useCallback(async (conversationId: number) => {
    try {
      const { data } = await apiClient.get<{ data: MessageData[] }>(
        `/api/conversations/${conversationId}/messages`
      );
      setMessages(data.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  }, []);

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const { data } = await apiClient.get<UserData[]>(`/api/users?search=${encodeURIComponent(query)}`);
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setIsSearching(false);
    }
  }, []);

  // ==================== SOCKET EVENT HANDLERS ====================
  
  const handleNewMessage = useCallback((message: MessageData) => {
    if (selectedConversation && message.conversationId === selectedConversation.id) {
      setMessages(prev => [...prev, message]);

      if (!isAtBottom) {
        setNewMessagesCount(prev => prev + 1);
      }
    }

    // Update conversations list
    setConversations(prev => {
      const updated = prev.map(conv => {
        if (conv.id === message.conversationId) {
          return {
            ...conv,
            messages: [message],
            unreadCount: message.senderId === user?.id ? 0 : (conv.unreadCount || 0) + 1
          };
        }
        return conv;
      });

      // Sort by last message time
      return updated.sort((a, b) => {
        const aTime = a.messages[0]?.createdAt || a.createdAt;
        const bTime = b.messages[0]?.createdAt || b.createdAt;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });
    });
  }, [selectedConversation, isAtBottom, user?.id]);

  const handleMessageSent = useCallback((message: MessageData) => {
    if (selectedConversation && message.conversationId === selectedConversation.id) {
      // Add the confirmed message to the messages list
      setMessages(prev => [...prev, message]);

      // Update conversations list
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              messages: [message],
              unreadCount: 0 // Sent messages don't increase unread count
            };
          }
          return conv;
        });

        // Sort by last message time
        return updated.sort((a, b) => {
          const aTime = a.messages[0]?.createdAt || a.createdAt;
          const bTime = b.messages[0]?.createdAt || b.createdAt;
          return new Date(bTime).getTime() - new Date(aTime).getTime();
        });
      });
    }
  }, [selectedConversation]);

  const handleMessageEdited = useCallback((editedMessage: MessageData) => {
    setMessages(prev => prev.map(msg => 
      msg.id === editedMessage.id ? editedMessage : msg
    ));
  }, []);

  const handleMessageDeleted = useCallback((data: { messageId: number; conversationId: number }) => {
    setMessages(prev => prev.map(msg => 
      msg.id === data.messageId 
        ? { ...msg, isDeleted: true, content: "This message was deleted" }
        : msg
    ));
  }, []);

  const handleMessageRead = useCallback((data: { messageId: number; readBy: number; readAt: Date }) => {
    setMessages(prev => prev.map(msg => 
      msg.id === data.messageId 
        ? { ...msg, readAt: data.readAt.toString() }
        : msg
    ));
  }, []);

  const handleUserTyping = useCallback((data: { conversationId: number; userId: number; isTyping: boolean }) => {
    if (!selectedConversation || data.conversationId !== selectedConversation.id) return;
    
    const user = userStatuses.get(data.userId);
    if (!user) return;

    setTypingUsers(prev => {
      const updated = new Map(prev);
      if (data.isTyping) {
        updated.set(data.userId, user);
      } else {
        updated.delete(data.userId);
      }
      return updated;
    });
  }, [selectedConversation, userStatuses]);

  const handleUserStatusChanged = useCallback((data: { userId: number; isOnline: boolean; lastSeen?: Date }) => {
    setUserStatuses(prev => {
      const updated = new Map(prev);
      const existingUser = updated.get(data.userId);
      if (existingUser) {
        updated.set(data.userId, {
          ...existingUser,
          isOnline: data.isOnline,
          lastSeen: data.lastSeen || existingUser.lastSeen
        });
      }
      return updated;
    });

    // Update conversations with new user status
    setConversations(prev => prev.map(conv => ({
      ...conv,
      userOne: conv.userOne.id === data.userId 
        ? { ...conv.userOne, isOnline: data.isOnline, lastSeen: data.lastSeen || conv.userOne.lastSeen }
        : conv.userOne,
      userTwo: conv.userTwo.id === data.userId 
        ? { ...conv.userTwo, isOnline: data.isOnline, lastSeen: data.lastSeen || conv.userTwo.lastSeen }
        : conv.userTwo
    })));
  }, []);

  const handleNewConversation = useCallback((conversation: ConversationData) => {
    // Add the new conversation to the list if it doesn't already exist
    setConversations(prev => {
      const exists = prev.some(conv => conv.id === conversation.id);
      if (exists) return prev;

      // Add new conversation to the top of the list
      return [conversation, ...prev];
    });

    // Update user statuses
    setUserStatuses(prev => {
      const updated = new Map(prev);
      updated.set(conversation.userOne.id, conversation.userOne);
      updated.set(conversation.userTwo.id, conversation.userTwo);
      return updated;
    });
  }, []);

  // ==================== MESSAGE OPERATIONS ====================

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const otherUser = selectedConversation.userOne.id === user?.id
      ? selectedConversation.userTwo
      : selectedConversation.userOne;

    try {
      sendMessage({
        content: newMessage.trim(),
        messageType: 'text',
        receiverId: otherUser.id,
        replyToMessageId: replyToMessage?.id
      });

      // Clear the input immediately - message will be added when socket confirms
      setNewMessage('');
      setReplyToMessage(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  }, [newMessage, selectedConversation, user, sendMessage, replyToMessage]);

  const handleEditMessage = useCallback((messageId: number, content: string) => {
    if (!selectedConversation) return;
    
    editMessage({
      messageId,
      content,
      conversationId: selectedConversation.id
    });
  }, [selectedConversation, editMessage]);

  const handleDeleteMessage = useCallback((messageId: number) => {
    if (!selectedConversation) return;
    
    deleteMessage({
      messageId,
      conversationId: selectedConversation.id
    });
  }, [selectedConversation, deleteMessage]);

  const handleReplyToMessage = useCallback((message: MessageData) => {
    setReplyToMessage(message);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyToMessage(null);
  }, []);

  const handleMarkMessageRead = useCallback((messageId: number) => {
    if (!selectedConversation) return;
    
    markMessageRead({
      messageId,
      conversationId: selectedConversation.id
    });
  }, [selectedConversation, markMessageRead]);

  const handleTyping = useCallback((isTyping: boolean) => {
    if (!selectedConversation) return;
    
    sendTyping({
      conversationId: selectedConversation.id,
      isTyping
    });
  }, [selectedConversation, sendTyping]);

  // ==================== OTHER HANDLERS ====================

  const startNewConversation = useCallback(async (selectedUser: UserData) => {
    try {
      const existingConversation = conversations.find(conv =>
        (conv.userOne.id === selectedUser.id && conv.userTwo.id === user?.id) ||
        (conv.userOne.id === user?.id && conv.userTwo.id === selectedUser.id)
      );

      if (existingConversation) {
        setSelectedConversation(existingConversation);
        await fetchMessages(existingConversation.id);
      } else {
        // Create conversation on the backend
        const { data } = await apiClient.post<{ data: ConversationData }>(
          '/api/conversations',
          { receiverId: selectedUser.id }
        );

        const newConversation = data.data;
        setConversations(prev => [newConversation, ...prev]);
        setSelectedConversation(newConversation);
        setMessages([]);
      }

      setShowNewChatModal(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
    }
  }, [conversations, user, fetchMessages]);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);

      const { data } = await apiClient.post<{ data: string }>(
        '/api/conversations/uploadImage',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      return data.data;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  }, []);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedConversation) return;

    if (!allowedImageFormat.map(ext => `image/${ext}`).includes(file.type)) {
      toast.warning('Please select an image file');
      return;
    }

    if (file.size > maxImageSize) {
      toast.warning('File size must be less than 1MB');
      return;
    }

    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      const otherUser = selectedConversation.userOne.id === user?.id 
        ? selectedConversation.userTwo 
        : selectedConversation.userOne;

      sendMessage({
        content: imageUrl,
        messageType: 'image',
        receiverId: otherUser.id,
        replyToMessageId: replyToMessage?.id
      });

      // Clear reply state - message will be added when socket confirms
      setReplyToMessage(null);
    }
  }, [selectedConversation, user, sendMessage, uploadImage, replyToMessage]);

  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return date.toLocaleDateString('en');
  }, []);

  const getOtherUser = useCallback((conversation: ConversationData) => {
    return conversation.userOne.id === user?.id ? conversation.userTwo : conversation.userOne;
  }, [user]);

  // ==================== UI HANDLERS ====================

  const handleBackToWelcomeConversations = useCallback(() => {
    setSelectedConversation(null);
    setReplyToMessage(null);
    setTypingUsers(new Map());
    setIsMobileSidebarVisible(true);
  }, []);

  const handleSelectConversation = useCallback((conversation: ConversationData) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
    // Hide sidebar on mobile when conversation is selected
    setIsMobileSidebarVisible(false);
  }, [fetchMessages]);

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom, scrollToBottom]);

  useEffect(() => {
    if (selectedConversation) {
      setTimeout(() => {
        scrollToBottom();
        setIsAtBottom(true);
        setNewMessagesCount(0);
        setTypingUsers(new Map()); // Clear typing indicators when switching conversations
      }, 100);
    }
  }, [selectedConversation, scrollToBottom]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Clear any cached auth data to prevent loops
      queryClient.setQueryData(['auth', 'user'], null);
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router, queryClient]);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchConversations();
    }
  }, [fetchConversations, isAuthenticated, isLoading]);

  // Socket event listeners
  useEffect(() => {
    // Add messageSent listener
    const handleMessageSentEvent = (message: MessageData) => handleMessageSent(message);
    socket?.on('messageSent', handleMessageSentEvent);

    onNewMessage(handleNewMessage);
    onMessageEdited(handleMessageEdited);
    onMessageDeleted(handleMessageDeleted);
    onMessageRead(handleMessageRead);
    onUserTyping(handleUserTyping);
    onUserStatusChanged(handleUserStatusChanged);
    onNewConversation(handleNewConversation);

    return () => {
      socket?.off('messageSent', handleMessageSentEvent);
      offNewMessage(handleNewMessage);
      offMessageEdited(handleMessageEdited);
      offMessageDeleted(handleMessageDeleted);
      offMessageRead(handleMessageRead);
      offUserTyping(handleUserTyping);
      offUserStatusChanged(handleUserStatusChanged);
      offNewConversation(handleNewConversation);
    };
  }, [
    socket, handleMessageSent,
    onNewMessage, offNewMessage, handleNewMessage,
    onMessageEdited, offMessageEdited, handleMessageEdited,
    onMessageDeleted, offMessageDeleted, handleMessageDeleted,
    onMessageRead, offMessageRead, handleMessageRead,
    onUserTyping, offUserTyping, handleUserTyping,
    onUserStatusChanged, offUserStatusChanged, handleUserStatusChanged,
    onNewConversation, offNewConversation, handleNewConversation
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  // ==================== RENDER ====================

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-[calc(100vh-64px)] bg-base-100 flex overflow-hidden relative">
      {/* Left Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        isLoadingConversations={isLoadingConversations}
        isConnected={isConnected}
        user={user ?? null}
        isMobileVisible={isMobileSidebarVisible}
        onSelectConversation={handleSelectConversation}
        onBackToConversations={handleBackToWelcomeConversations}
        onNewConversation={() => setShowNewChatModal(true)}
        formatTime={formatTime}
      />

      {/* Right Side - Chat Area */}
      <div className={`flex-1 flex flex-col relative ${isMobileSidebarVisible ? 'hidden md:flex' : 'flex'}`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <ChatHeader
              otherUser={getOtherUser(selectedConversation)}
              isTyping={typingUsers.has(getOtherUser(selectedConversation).id)}
              showBackButton={true}
              onBackClick={handleBackToWelcomeConversations}
              formatTime={formatTime}
            />

            {/* Messages Container */}
            <MessagesContainer
              messages={messages}
              currentUserId={user?.id}
              isAtBottom={isAtBottom}
              typingUsers={typingUsers}
              onScroll={handleScroll}
              onImageClick={setSelectedImage}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
              onReplyToMessage={handleReplyToMessage}
              onMarkMessageRead={handleMarkMessageRead}
              formatTime={formatTime}
              ref={messagesContainerRef}
            />

            {/* New Messages Indicator */}
            <NewMessagesIndicator
              newMessagesCount={newMessagesCount}
              onScrollToBottom={scrollToBottom}
            />

            {/* Message Input */}
            <MessageInput
              newMessage={newMessage}
              isUploadingImage={isUploadingImage}
              replyToMessage={replyToMessage}
              onMessageChange={setNewMessage}
              onSendMessage={handleSendMessage}
              onFileSelect={handleFileSelect}
              onCancelReply={handleCancelReply}
              onTyping={handleTyping}
            />
          </>
        ) : (
          <WelcomeScreen onNewConversation={() => setShowNewChatModal(true)} />
        )}
      </div>

      {/* Modals */}
      <UserSearchModal
        isOpen={showNewChatModal}
        searchQuery={searchQuery}
        searchResults={searchResults}
        isSearching={isSearching}
        onSearchChange={setSearchQuery}
        onSelectUser={startNewConversation}
        onClose={() => {
          setShowNewChatModal(false);
          setSearchQuery('');
          setSearchResults([]);
        }}
      />

      <ImagePreviewModal
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
}