'use client';

import { toast } from 'sonner';
import { apiClient } from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import useSocket from '@/hooks/useSocket';
import { useRouter } from 'next/navigation';
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
  const { isAuthenticated, isLoading, user } = useAuth();
  const { socket, isConnected, sendMessage, onNewMessage, offNewMessage } = useSocket();

  // State
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationData | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserData[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [showNewMessagesIndicator, setShowNewMessagesIndicator] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
      setShowNewMessagesIndicator(false);
    }
  }, []);

  const handleScroll = useCallback(() => {
    checkIfAtBottom();
  }, [checkIfAtBottom]);

  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoadingConversations(true);
      const { data } = await apiClient.get<{ data: ConversationData[] }>('/api/conversations');
      setConversations(data.data);
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

  const handleNewMessage = useCallback((message: MessageData) => {
    if (selectedConversation && message.conversationId === selectedConversation.id) {
      setMessages(prev => [...prev, message]);
      
      if (!isAtBottom) {
        setNewMessagesCount(prev => prev + 1);
        setShowNewMessagesIndicator(true);
      }
    }
    
    setConversations(prev => prev.map(conv => {
      if (conv.id === message.conversationId) {
        return {
          ...conv,
          messages: [message]
        };
      }
      return conv;
    }));
  }, [selectedConversation, isAtBottom]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const otherUser = selectedConversation.userOne.id === user?.id 
      ? selectedConversation.userTwo 
      : selectedConversation.userOne;

    sendMessage({
      content: newMessage.trim(),
      messageType: 'text',
      receiverId: otherUser.id
    });

    const tempMessage: MessageData = {
      id: Date.now(),
      content: newMessage.trim(),
      messageType: 'text',
      senderId: user!.id,
      createdAt: new Date().toISOString(),
      conversationId: selectedConversation.id,
      updatedAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
  }, [newMessage, selectedConversation, user, sendMessage]);

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
        const newConversation: ConversationData = {
          id: Date.now(),
          userOneId: user!.id,
          userTwoId: selectedUser.id,
          createdAt: new Date().toISOString(),
          userOne: user as UserData,
          userTwo: selectedUser,
          messages: []
        };
        
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
        receiverId: otherUser.id
      });

      const tempMessage: MessageData = {
        id: Date.now(),
        content: imageUrl,
        messageType: 'image',
        senderId: user!.id,
        createdAt: new Date().toISOString(),
        conversationId: selectedConversation.id,
        updatedAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, tempMessage]);
    }
  }, [selectedConversation, user, sendMessage, uploadImage]);

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

  // Effects
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
        setShowNewMessagesIndicator(false);
      }, 100);
    }
  }, [selectedConversation, scrollToBottom]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    onNewMessage(handleNewMessage);
    return () => offNewMessage(handleNewMessage);
  }, [onNewMessage, offNewMessage, handleNewMessage]);

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

  // Render
  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleBackToWelcomeConversations = () => {
    setSelectedConversation(null);
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-base-100 flex overflow-hidden">
      {/* Left Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        isLoadingConversations={isLoadingConversations}
        isConnected={isConnected}
        user={user ?? null}
        onSelectConversation={(conversation) => {
          setSelectedConversation(conversation);
          fetchMessages(conversation.id);
        }}
        onBackToConversations={handleBackToWelcomeConversations}
        onNewConversation={() => setShowNewChatModal(true)}
        formatTime={formatTime}
      />

      {/* Right Side - Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <ChatHeader
              otherUser={getOtherUser(selectedConversation)}
              formatTime={formatTime}
            />

            {/* Messages Container */}
            <MessagesContainer
              messages={messages}
              currentUserId={user?.id}
              isAtBottom={isAtBottom}
              onScroll={handleScroll}
              onImageClick={setSelectedImage}
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
              onMessageChange={setNewMessage}
              onSendMessage={handleSendMessage}
              onFileSelect={handleFileSelect}
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