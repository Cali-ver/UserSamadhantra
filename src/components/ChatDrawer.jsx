import { useState, useEffect, useRef } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { getChatHistory, sendChatMessage } from "../services/api";
import { 
  X, 
  Send, 
  MessageSquare, 
  Loader2, 
  User, 
  Clock,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

const ChatDrawer = ({ isOpen, onClose, sessionId, recipientName, requirementId }) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const scrollRef = useRef(null);
  const currentUserId = localStorage.getItem('registeredUserId');
  const authToken = localStorage.getItem('authToken');

  // WebSocket URL: wss://api.samadhantra.com/api/ws/chat/{session_id}?token={token}
  const wsUrl = sessionId ? `wss://api.samadhantra.com/api/ws/chat/${sessionId}?token=${authToken}` : null;

  const { isConnected, messages: liveMessages, sendMessage } = useWebSocket(wsUrl, {
    onMessage: (data) => {
        // Handle incoming live message
        setChatMessages(prev => [...prev, data]);
    }
  });

  useEffect(() => {
    if (isOpen && sessionId) {
      fetchHistory();
    }
  }, [isOpen, sessionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const history = await getChatHistory(sessionId);
      setChatMessages(Array.isArray(history) ? history : (history?.data || []));
    } catch (error) {
      console.error("❌ History fetch error:", error);
      toast({ title: "Error", description: "Failed to load chat history.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const payload = {
        session_id: sessionId,
        requirement_id: requirementId,
        content: inputMessage,
        sender_id: currentUserId,
        timestamp: new Date().toISOString()
    };

    try {
        // OPTIONAL: Send via REST as fallback, though WS is preferred for live
        await sendChatMessage(payload);
        
        // Send via WebSocket for live update
        sendMessage(payload);
        
        // Locally update UI immediately if WS echo is slow
        setInputMessage("");
    } catch (error) {
        toast({ title: "Error", description: "Failed to send message." });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white shadow-2xl z-[100] flex flex-col border-l border-slate-100 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-900 text-white">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-xl font-black">
                {recipientName ? recipientName[0].toUpperCase() : "S"}
            </div>
            <div>
                <h4 className="font-black tracking-tight">{recipientName || "Support Crew"}</h4>
                <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-rose-500"}`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {isConnected ? "Live Session" : "Reconnecting..."}
                    </span>
                </div>
            </div>
        </div>
        <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/10 rounded-xl px-2 h-10 w-10">
            <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Info Badge */}
      <div className="px-6 py-3 bg-blue-50/50 flex items-center justify-between border-b border-blue-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">End-to-End Encrypted</span>
          </div>
          {requirementId && (
            <Badge variant="outline" className="border-blue-100 text-blue-600 font-bold text-[10px] uppercase">
                REQ: {requirementId.slice(0, 8)}
            </Badge>
          )}
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-6 space-y-6">
        {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="font-black text-slate-300 uppercase text-[10px] tracking-widest">Securing History...</p>
            </div>
        ) : chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-4">
                <div className="p-6 bg-slate-50 rounded-full shadow-inner">
                    <MessageSquare className="w-10 h-10 text-slate-200" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-black text-slate-800 tracking-tight">Start the conversation</h3>
                    <p className="text-xs text-slate-400 font-medium">Be the first to say something about your needs.</p>
                </div>
            </div>
        ) : (
            <div className="space-y-6">
                {chatMessages.map((msg, i) => {
                    const isMe = String(msg.sender_id) === String(currentUserId);
                    return (
                        <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"} group animate-in slide-in-from-bottom duration-300`}>
                            <div className={`max-w-[85%] space-y-2`}>
                                <div className={`p-4 rounded-[2rem] text-sm font-medium leading-relaxed ${
                                    isMe 
                                    ? "bg-blue-600 text-white rounded-tr-none shadow-xl shadow-blue-100" 
                                    : "bg-slate-100 text-slate-800 rounded-tl-none"
                                }`}>
                                    {msg.content}
                                </div>
                                <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${isMe ? "justify-end text-blue-400" : "justify-start text-slate-300"}`}>
                                    <Clock className="w-3 h-3" />
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-6 border-t border-slate-50 bg-white">
        <form onSubmit={handleSend} className="flex gap-3">
            <Input 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white font-bold transition-all px-6"
            />
            <Button 
                type="submit" 
                disabled={!inputMessage.trim()}
                className="w-14 h-14 bg-blue-600 hover:bg-slate-900 text-white rounded-2xl shadow-xl shadow-blue-100"
            >
                <Send className="w-6 h-6" />
            </Button>
        </form>
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-4 text-center">
            Avoid sharing private security credentials in the ecosystem.
        </p>
      </div>
    </div>
  );
};

export default ChatDrawer;
