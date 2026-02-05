import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { MessageCircle, Send, User } from 'lucide-react';
import { useGetChatUsers, useGetChat, useSendMessage } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';
import type { ChatUser } from '../backend';

export default function ChatDialog() {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { identity } = useInternetIdentity();

  const { data: chatUsers = [] } = useGetChatUsers();
  const { data: messages = [] } = useGetChat(selectedUser?.principal || null);
  const sendMessageMutation = useSendMessage();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedUser) return;

    try {
      await sendMessageMutation.mutateAsync({
        receiver: selectedUser.principal,
        content: message.trim(),
      });
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-300 dark:border-purple-700 hover:scale-110 transition-all duration-300 hover:shadow-glow-purple"
        >
          <MessageCircle className="w-5 h-5 text-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[600px] flex flex-col p-0 border-2 border-purple-300 dark:border-purple-700 shadow-glow-purple">
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
          <DialogTitle className="flex items-center gap-2">
            <img 
              src="/assets/generated/chat-icon-sparkles-transparent.dim_64x64.png" 
              alt="Chat" 
              className="w-8 h-8 animate-pulse"
            />
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Study Buddies Chat
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-1 overflow-hidden">
          {/* User List */}
          <div className="w-1/3 border-r bg-gradient-to-b from-purple-50/50 to-pink-50/50 dark:from-purple-950/30 dark:to-pink-950/30">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Study Buddies</h3>
                {chatUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <img 
                      src="/assets/generated/sleepy-cat-transparent.dim_150x150.png" 
                      alt="Sleepy Cat" 
                      className="w-20 h-20 mx-auto opacity-50 mb-2"
                    />
                    <p className="text-sm text-muted-foreground">
                      No other users yet
                    </p>
                  </div>
                ) : (
                  chatUsers.map((user, index) => (
                    <Button
                      key={index}
                      variant={selectedUser?.principal.toString() === user.principal.toString() ? 'secondary' : 'ghost'}
                      className={`w-full justify-start gap-3 h-auto py-3 transition-all duration-300 hover:scale-105 ${
                        selectedUser?.principal.toString() === user.principal.toString()
                          ? 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 shadow-md'
                          : 'hover:bg-purple-50 dark:hover:bg-purple-950/30'
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-md">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {user.principal.toString().slice(0, 10)}...
                        </div>
                      </div>
                    </Button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-gradient-to-b from-white to-purple-50/30 dark:from-gray-950 dark:to-purple-950/20">
            {selectedUser ? (
              <>
                {/* Messages */}
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-12">
                        <img 
                          src="/assets/generated/chat-bubble-gradient.dim_300x100.png" 
                          alt="Chat Bubble" 
                          className="w-32 h-auto mx-auto opacity-50 mb-4"
                        />
                        <p className="text-muted-foreground">
                          No messages yet. Start the conversation! 💬
                        </p>
                      </div>
                    ) : (
                      messages.map((msg, index) => {
                        const isOwnMessage = identity && msg.sender.toString() === identity.getPrincipal().toString();
                        return (
                          <div
                            key={index}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom duration-300`}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-md transition-all duration-300 hover:scale-105 ${
                                isOwnMessage
                                  ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-violet-500 text-white shadow-glow-purple'
                                  : 'bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-950/50 border border-purple-200 dark:border-purple-800'
                              }`}
                            >
                              <p className="text-sm break-words">{msg.content}</p>
                              <p className={`text-xs mt-1 ${isOwnMessage ? 'text-purple-100' : 'text-muted-foreground'}`}>
                                {new Date(Number(msg.timestamp) / 1_000_000).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 border-purple-300 dark:border-purple-700 focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim() || sendMessageMutation.isPending}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-glow-pink transition-all duration-300 hover:scale-105"
                    >
                      {sendMessageMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <img 
                    src="/assets/generated/study-bunny-transparent.dim_200x200.png" 
                    alt="Study Bunny" 
                    className="w-32 h-32 mx-auto opacity-50 animate-bounce-slow"
                  />
                  <p className="text-muted-foreground">
                    Select a study buddy to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
