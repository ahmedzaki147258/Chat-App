'use client';

interface WelcomeScreenProps {
  onNewConversation: () => void;
}

export default function WelcomeScreen({ onNewConversation }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-2xl font-bold mb-2">Welcome to Conversations</h3>
        <p className="text-base-content/70 mb-6">
          Select a conversation from the sidebar or start a new one
        </p>
        <button 
          className="btn btn-primary"
          onClick={onNewConversation}
        >
          <span className="mr-2">🚀</span>
          Start a new conversation
        </button>
      </div>
    </div>
  );
}