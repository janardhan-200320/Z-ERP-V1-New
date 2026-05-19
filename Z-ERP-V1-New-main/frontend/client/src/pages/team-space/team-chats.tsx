import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  Send,
  Smile,
  Paperclip,
  Search,
  Plus,
  Users,
  User,
  Hash,
  MoreVertical,
  Phone,
  Video,
  Pin,
  Image,
  FileText,
  Link as LinkIcon,
  Check,
  CheckCheck,
  Circle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: "text" | "file" | "image" | "link";
  fileUrl?: string;
  fileName?: string;
  read: boolean;
  reactions?: { emoji: string; users: string[] }[];
}

interface Chat {
  id: string;
  name: string;
  type: "direct" | "group";
  participants: string[];
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline?: boolean;
  department?: string;
  messages: Message[];
  isPinned?: boolean;
}

const currentUser = {
  id: "user-1",
  name: "You",
  avatar: "YO",
};

const initialChats: Chat[] = [
  {
    id: "chat-1",
    name: "Sarah Johnson",
    type: "direct",
    participants: ["user-1", "user-2"],
    avatar: "SJ",
    lastMessage: "Sure, I'll send the proposal by EOD",
    lastMessageTime: "10:35 AM",
    unreadCount: 2,
    isOnline: true,
    department: "Sales",
    isPinned: true,
    messages: [
      {
        id: "msg-1",
        senderId: "user-2",
        senderName: "Sarah Johnson",
        content: "Hi! Have you reviewed the Q1 proposal?",
        timestamp: "10:15 AM",
        type: "text",
        read: true,
      },
      {
        id: "msg-2",
        senderId: "user-1",
        senderName: "You",
        content: "Yes, looks great! Can you add the pricing breakdown for the enterprise tier?",
        timestamp: "10:20 AM",
        type: "text",
        read: true,
      },
      {
        id: "msg-3",
        senderId: "user-2",
        senderName: "Sarah Johnson",
        content: "Sure, I'll send the proposal by EOD",
        timestamp: "10:35 AM",
        type: "text",
        read: false,
      },
      {
        id: "msg-4",
        senderId: "user-2",
        senderName: "Sarah Johnson",
        content: "Also, the client wants a demo next week. Can you join?",
        timestamp: "10:36 AM",
        type: "text",
        read: false,
      },
    ],
  },
  {
    id: "chat-2",
    name: "Development Team",
    type: "group",
    participants: ["user-1", "user-3", "user-4", "user-5"],
    avatar: "DT",
    lastMessage: "Alex: PR #247 is ready for review",
    lastMessageTime: "9:45 AM",
    unreadCount: 5,
    department: "Development",
    isPinned: true,
    messages: [
      {
        id: "msg-5",
        senderId: "user-3",
        senderName: "Mike Chen",
        content: "Morning team! Sprint standup notes shared in Confluence.",
        timestamp: "9:00 AM",
        type: "text",
        read: true,
      },
      {
        id: "msg-6",
        senderId: "user-4",
        senderName: "Alex Kumar",
        content: "Thanks Mike. I've pushed the auth module changes.",
        timestamp: "9:15 AM",
        type: "text",
        read: true,
      },
      {
        id: "msg-7",
        senderId: "user-1",
        senderName: "You",
        content: "Great work! Let me review the auth changes today.",
        timestamp: "9:30 AM",
        type: "text",
        read: true,
      },
      {
        id: "msg-8",
        senderId: "user-4",
        senderName: "Alex Kumar",
        content: "PR #247 is ready for review",
        timestamp: "9:45 AM",
        type: "text",
        read: false,
        reactions: [{ emoji: "👍", users: ["Mike Chen"] }],
      },
    ],
  },
  {
    id: "chat-3",
    name: "Mike Chen",
    type: "direct",
    participants: ["user-1", "user-3"],
    avatar: "MC",
    lastMessage: "Can we discuss the API architecture?",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    isOnline: true,
    department: "Development",
    messages: [
      {
        id: "msg-9",
        senderId: "user-3",
        senderName: "Mike Chen",
        content: "Hey, do you have a moment?",
        timestamp: "Yesterday 3:00 PM",
        type: "text",
        read: true,
      },
      {
        id: "msg-10",
        senderId: "user-1",
        senderName: "You",
        content: "Sure, what's up?",
        timestamp: "Yesterday 3:05 PM",
        type: "text",
        read: true,
      },
      {
        id: "msg-11",
        senderId: "user-3",
        senderName: "Mike Chen",
        content: "Can we discuss the API architecture?",
        timestamp: "Yesterday 3:10 PM",
        type: "text",
        read: true,
      },
    ],
  },
  {
    id: "chat-4",
    name: "Marketing Team",
    type: "group",
    participants: ["user-1", "user-4", "user-6", "user-7"],
    avatar: "MT",
    lastMessage: "Emily: New campaign designs ready for review",
    lastMessageTime: "Yesterday",
    unreadCount: 3,
    department: "Marketing",
    messages: [
      {
        id: "msg-12",
        senderId: "user-6",
        senderName: "Emily Davis",
        content: "Team, I've uploaded the Q1 campaign designs to the shared drive.",
        timestamp: "Yesterday 2:00 PM",
        type: "text",
        read: true,
      },
      {
        id: "msg-13",
        senderId: "user-6",
        senderName: "Emily Davis",
        content: "Campaign_Q1_v3.pdf",
        timestamp: "Yesterday 2:01 PM",
        type: "file",
        fileName: "Campaign_Q1_v3.pdf",
        fileUrl: "#",
        read: true,
      },
      {
        id: "msg-14",
        senderId: "user-6",
        senderName: "Emily Davis",
        content: "New campaign designs ready for review",
        timestamp: "Yesterday 2:05 PM",
        type: "text",
        read: false,
      },
    ],
  },
  {
    id: "chat-5",
    name: "Emily Davis",
    type: "direct",
    participants: ["user-1", "user-6"],
    avatar: "ED",
    lastMessage: "The banner looks perfect now!",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    isOnline: false,
    department: "Design",
    messages: [
      {
        id: "msg-15",
        senderId: "user-1",
        senderName: "You",
        content: "Emily, can you update the hero banner?",
        timestamp: "Yesterday 11:00 AM",
        type: "text",
        read: true,
      },
      {
        id: "msg-16",
        senderId: "user-6",
        senderName: "Emily Davis",
        content: "Sure! I'll have it ready by afternoon.",
        timestamp: "Yesterday 11:15 AM",
        type: "text",
        read: true,
      },
      {
        id: "msg-17",
        senderId: "user-6",
        senderName: "Emily Davis",
        content: "The banner looks perfect now!",
        timestamp: "Yesterday 4:30 PM",
        type: "text",
        read: true,
      },
    ],
  },
  {
    id: "chat-6",
    name: "Operations Team",
    type: "group",
    participants: ["user-1", "user-8", "user-5", "user-3"],
    avatar: "OT",
    lastMessage: "Ryan: Logistics update for next shipment",
    lastMessageTime: "Feb 14",
    unreadCount: 0,
    department: "Operations",
    messages: [
      {
        id: "msg-18",
        senderId: "user-8",
        senderName: "Ryan Wilson",
        content: "Logistics update for next shipment",
        timestamp: "Feb 14 4:00 PM",
        type: "text",
        read: true,
      },
    ],
  },
  {
    id: "chat-7",
    name: "Lisa Park",
    type: "direct",
    participants: ["user-1", "user-5"],
    avatar: "LP",
    lastMessage: "Invoice has been processed",
    lastMessageTime: "Feb 14",
    unreadCount: 0,
    isOnline: true,
    department: "Accounts",
    messages: [
      {
        id: "msg-19",
        senderId: "user-5",
        senderName: "Lisa Park",
        content: "Invoice has been processed",
        timestamp: "Feb 14 2:30 PM",
        type: "text",
        read: true,
      },
    ],
  },
];

const emojiList = ["😀", "😂", "❤️", "👍", "👏", "🔥", "🎉", "💯", "🙏", "😊", "🤔", "😎", "✅", "⭐", "💡", "🚀"];

const availableMembers = [
  { id: "user-2", name: "Sarah Johnson", avatar: "SJ", department: "Sales" },
  { id: "user-3", name: "Mike Chen", avatar: "MC", department: "Development" },
  { id: "user-4", name: "Alex Kumar", avatar: "AK", department: "Marketing" },
  { id: "user-5", name: "Lisa Park", avatar: "LP", department: "Accounts" },
  { id: "user-6", name: "Emily Davis", avatar: "ED", department: "Design" },
  { id: "user-7", name: "James Taylor", avatar: "JT", department: "Marketing" },
  { id: "user-8", name: "Ryan Wilson", avatar: "RW", department: "Operations" },
  { id: "user-9", name: "Nina Patel", avatar: "NP", department: "Development" },
];

export default function TeamChatsModule() {
  const { toast } = useToast();
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(initialChats[0]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [newDirectOpen, setNewDirectOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChat) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      content: messageInput.trim(),
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      type: "text",
      read: true,
    };

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === selectedChat.id
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessage:
                selectedChat.type === "group"
                  ? `You: ${messageInput.trim()}`
                  : messageInput.trim(),
              lastMessageTime: "Just now",
            }
          : chat
      )
    );

    setSelectedChat((prev) =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages, newMessage],
            lastMessage:
              prev.type === "group" ? `You: ${messageInput.trim()}` : messageInput.trim(),
            lastMessageTime: "Just now",
          }
        : null
    );

    setMessageInput("");
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emoji: string) => {
    setMessageInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedMembers.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a group name and select members.",
        variant: "destructive",
      });
      return;
    }

    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      name: groupName,
      type: "group",
      participants: ["user-1", ...selectedMembers],
      avatar: groupName.slice(0, 2).toUpperCase(),
      lastMessage: "Group created",
      lastMessageTime: "Just now",
      unreadCount: 0,
      department: "",
      messages: [],
    };

    setChats((prev) => [newChat, ...prev]);
    setSelectedChat(newChat);
    setCreateGroupOpen(false);
    setGroupName("");
    setSelectedMembers([]);
    toast({ title: "Group Created", description: `"${groupName}" group created successfully.` });
  };

  const handleStartDirect = (member: (typeof availableMembers)[0]) => {
    const existing = chats.find(
      (c) => c.type === "direct" && c.name === member.name
    );
    if (existing) {
      setSelectedChat(existing);
    } else {
      const newChat: Chat = {
        id: `chat-${Date.now()}`,
        name: member.name,
        type: "direct",
        participants: ["user-1", member.id],
        avatar: member.avatar,
        lastMessage: "",
        lastMessageTime: "",
        unreadCount: 0,
        isOnline: true,
        department: member.department,
        messages: [],
      };
      setChats((prev) => [newChat, ...prev]);
      setSelectedChat(newChat);
    }
    setNewDirectOpen(false);
  };

  const filteredChats = chats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredChats.filter((c) => c.isPinned);
  const otherChats = filteredChats.filter((c) => !c.isPinned);

  return (
    <div className="flex h-[600px] rounded-lg border bg-white overflow-hidden">
      {/* Chat List Sidebar */}
      <div className="w-80 border-r flex flex-col bg-slate-50">
        {/* Sidebar Header */}
        <div className="p-3 border-b space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Chats</h3>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setNewDirectOpen(true)}
                title="New Direct Chat"
              >
                <User className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setCreateGroupOpen(true)}
                title="New Group Chat"
              >
                <Users className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1">
          {pinnedChats.length > 0 && (
            <div className="px-3 pt-2">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Pin className="h-3 w-3 text-slate-400" />
                <span className="text-xs text-slate-400 font-medium">PINNED</span>
              </div>
              {pinnedChats.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  isSelected={selectedChat?.id === chat.id}
                  onClick={() => setSelectedChat(chat)}
                />
              ))}
            </div>
          )}

          <div className="px-3 pt-2 pb-2">
            {pinnedChats.length > 0 && (
              <div className="flex items-center gap-1.5 mb-1.5">
                <MessageSquare className="h-3 w-3 text-slate-400" />
                <span className="text-xs text-slate-400 font-medium">ALL CHATS</span>
              </div>
            )}
            {otherChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isSelected={selectedChat?.id === chat.id}
                onClick={() => setSelectedChat(chat)}
              />
            ))}
          </div>

          {filteredChats.length === 0 && (
            <div className="p-4 text-center text-sm text-slate-500">
              No chats found
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback
                      className={`text-xs font-semibold ${
                        selectedChat.type === "group"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      {selectedChat.avatar}
                    </AvatarFallback>
                  </Avatar>
                  {selectedChat.type === "direct" && selectedChat.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{selectedChat.name}</h4>
                  <p className="text-xs text-slate-500">
                    {selectedChat.type === "group"
                      ? `${selectedChat.participants.length} members`
                      : selectedChat.isOnline
                      ? "Online"
                      : "Offline"}
                    {selectedChat.department && ` · ${selectedChat.department}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Phone className="h-4 w-4 text-slate-500" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Video className="h-4 w-4 text-slate-500" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Search className="h-4 w-4 text-slate-500" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {selectedChat.messages.map((message) => {
                  const isOwn = message.senderId === currentUser.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] ${
                          isOwn ? "order-2" : "order-1"
                        }`}
                      >
                        {!isOwn && selectedChat.type === "group" && (
                          <p className="text-xs text-slate-500 mb-1 ml-1">
                            {message.senderName}
                          </p>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isOwn
                              ? "bg-indigo-600 text-white rounded-br-md"
                              : "bg-slate-100 text-slate-900 rounded-bl-md"
                          }`}
                        >
                          {message.type === "file" ? (
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span className="text-sm underline cursor-pointer">
                                {message.fileName}
                              </span>
                            </div>
                          ) : message.type === "image" ? (
                            <div className="flex items-center gap-2">
                              <Image className="h-4 w-4" />
                              <span className="text-sm">{message.content}</span>
                            </div>
                          ) : (
                            <p className="text-sm">{message.content}</p>
                          )}
                        </div>
                        <div
                          className={`flex items-center gap-1 mt-1 ${
                            isOwn ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span className="text-[10px] text-slate-400">
                            {message.timestamp}
                          </span>
                          {isOwn && (
                            <CheckCheck
                              className={`h-3 w-3 ${
                                message.read ? "text-blue-500" : "text-slate-300"
                              }`}
                            />
                          )}
                        </div>
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {message.reactions.map((reaction, i) => (
                              <span
                                key={i}
                                className="text-xs bg-slate-100 rounded-full px-2 py-0.5 border"
                              >
                                {reaction.emoji} {reaction.users.length}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-3 border-t bg-white">
              {showEmojiPicker && (
                <div className="mb-2 p-2 bg-slate-50 rounded-lg border">
                  <div className="grid grid-cols-8 gap-1">
                    {emojiList.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleEmojiClick(emoji)}
                        className="h-8 w-8 flex items-center justify-center rounded hover:bg-slate-200 transition-colors text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="h-5 w-5 text-slate-400" />
                </Button>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <Paperclip className="h-5 w-5 text-slate-400" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  size="sm"
                  className="h-9"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">Select a chat to start messaging</p>
              <p className="text-sm mt-1">Choose from existing conversations or start a new one</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Group Dialog */}
      <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Group Chat</DialogTitle>
            <DialogDescription>Create a new group conversation with your team members.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="groupName">Group Name</Label>
              <Input
                id="groupName"
                placeholder="e.g., Project Alpha Team"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Select Members</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableMembers.map((member) => (
                  <label
                    key={member.id}
                    className="flex items-center gap-3 p-2 rounded-lg border hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMembers((prev) => [...prev, member.id]);
                        } else {
                          setSelectedMembers((prev) => prev.filter((id) => id !== member.id));
                        }
                      }}
                      className="rounded"
                    />
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-700">
                        {member.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.department}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateGroupOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGroup}>Create Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Direct Chat Dialog */}
      <Dialog open={newDirectOpen} onOpenChange={setNewDirectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Direct Chat</DialogTitle>
            <DialogDescription>Start a conversation with a team member.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto py-2">
            {availableMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => handleStartDirect(member)}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 w-full text-left transition-colors"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">
                    {member.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.department}</p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Extracted Chat List Item component
function ChatListItem({
  chat,
  isSelected,
  onClick,
}: {
  chat: Chat;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full p-2.5 rounded-lg text-left transition-colors mb-0.5 ${
        isSelected
          ? "bg-indigo-50 border border-indigo-200"
          : "hover:bg-white border border-transparent"
      }`}
    >
      <div className="relative flex-shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarFallback
            className={`text-xs font-semibold ${
              chat.type === "group"
                ? "bg-purple-100 text-purple-700"
                : "bg-indigo-100 text-indigo-700"
            }`}
          >
            {chat.avatar}
          </AvatarFallback>
        </Avatar>
        {chat.type === "direct" && chat.isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium truncate">{chat.name}</span>
          <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">
            {chat.lastMessageTime}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-slate-500 truncate">{chat.lastMessage || "Start a conversation"}</p>
          {chat.unreadCount > 0 && (
            <Badge className="h-5 min-w-[20px] flex items-center justify-center text-[10px] bg-indigo-600 ml-2 flex-shrink-0">
              {chat.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}
