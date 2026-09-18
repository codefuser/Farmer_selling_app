import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Conversation, Message } from '../../types';
import api from '../../services/api';
import {
  X,
  Send,
  Camera,
  MessageCircle,
  ArrowLeft,
  Clock,
  User,
  Check,
  CheckCheck,
} from 'lucide-react';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId?: string | null;
  conversationId?: string | null;
  initialTargetUser?: any;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  targetUserId,
  conversationId,
  initialTargetUser,
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(conversationId || null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [recipient, setRecipient] = useState<any>(initialTargetUser || null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Initialize or load conversations
  useEffect(() => {
    if (!isOpen || !user) return;

    if (conversationId) {
      setActiveConversationId(conversationId);
      if (initialTargetUser) setRecipient(initialTargetUser);
    } else if (targetUserId || initialTargetUser?.id) {
      const tid = targetUserId || initialTargetUser?.id;
      setLoading(true);
      if (initialTargetUser) setRecipient(initialTargetUser);
      api
        .startConversation(tid)
        .then((res) => {
          if (res.conversation) {
            setActiveConversationId(res.conversation.id);
            const other = res.conversation.members?.find((m: any) => m.userId !== user.id)?.user;
            setRecipient(other || initialTargetUser || { name: 'Chat Member' });
          }
        })
        .catch((err) => console.error('Failed to start conversation:', err))
        .finally(() => setLoading(false));
    } else {
      // Load all conversations
      loadConversations();
    }
  }, [isOpen, targetUserId, conversationId, initialTargetUser, user]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await api.getConversations();
      setConversations(res.conversations || []);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch messages for active conversation
  const fetchMessages = async (convId: string) => {
    try {
      const res = await api.getChatMessages(convId);
      setMessages(res.messages || []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  useEffect(() => {
    if (!activeConversationId) return;

    fetchMessages(activeConversationId).then(scrollToBottom);

    // Poll for new messages every 4 seconds while conversation is open
    const interval = setInterval(() => {
      fetchMessages(activeConversationId);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachmentUrl) return;
    if (!activeConversationId) return;

    const content = inputText.trim() || (language === 'ta' ? 'புகைப்படம் அனுப்பப்பட்டது' : 'Photo sent');
    const attachments = attachmentUrl ? [{ fileUrl: attachmentUrl, fileType: 'IMAGE' }] : undefined;

    setInputText('');
    setAttachmentUrl(null);

    try {
      setSending(true);
      const res = await api.sendChatMessage(activeConversationId, content, attachments);
      setMessages((prev) => [...prev, res.message]);
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const file = files[0];
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const res = await api.uploadImage(base64, file.name);
          setAttachmentUrl(res.url);
        } catch (err) {
          console.error(err);
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
      <div className="bg-white w-full sm:max-w-md h-full flex flex-col shadow-2xl border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5 min-w-0">
            {activeConversationId && !targetUserId && (
              <button
                onClick={() => {
                  setActiveConversationId(null);
                  loadConversations();
                }}
                className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {recipient?.name ? recipient.name.charAt(0).toUpperCase() : '💬'}
            </div>

            <div className="min-w-0">
              <h2 className="text-xs font-bold text-slate-900 truncate">
                {recipient?.name || (language === 'ta' ? 'செய்திகள்' : 'Direct Messages')}
              </h2>
              <span className="text-[10px] text-emerald-700 font-semibold block truncate">
                {recipient?.role ? `${recipient.role} · KisanDirect` : 'Active thread'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View 1: Conversation List */}
        {!activeConversationId ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {language === 'ta' ? 'அனைத்து உரையாடல்கள்' : 'Recent Conversations'}
            </h3>

            {loading ? (
              <div className="text-center py-8 text-xs text-slate-400 animate-pulse">
                {language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading chats...'}
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 space-y-2 text-slate-400 text-xs">
                <MessageCircle className="w-10 h-10 mx-auto text-slate-300" />
                <p>{language === 'ta' ? 'உரையாடல்கள் எதுவும் இல்லை' : 'No messages yet.'}</p>
                <p className="text-[11px] text-slate-500">
                  {language === 'ta'
                    ? 'முகப்பு ஊட்டத்தில் உள்ள விவசாயிகளிடம் இருந்து செய்தியை தொடங்கவும்.'
                    : 'Click "Chat" on any farmer post or product to start a conversation.'}
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setActiveConversationId(conv.id);
                    setRecipient(conv.recipient);
                  }}
                  className="w-full p-3 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition text-left flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                      {conv.recipient.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">
                        {conv.recipient.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {conv.lastMessage?.content || 'No messages yet'}
                      </div>
                    </div>
                  </div>

                  {conv.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        ) : (
          /* View 2: Active 1-on-1 Chat Thread */
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {/* Messages Thread Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs space-y-1">
                  <div className="text-2xl">🤝</div>
                  <p className="font-bold text-slate-700">
                    {language === 'ta' ? 'உரையாடலைத் தொடங்குங்கள்' : 'Say Hello!'}
                  </p>
                  <p className="text-[11px]">
                    {language === 'ta'
                      ? 'அறுவடை, தரம், விலை அல்லது டெலிவரி குறித்து நேரடியாக கேளுங்கள்.'
                      : 'Ask about harvest quantity, quality, packaging, or pickup schedules.'}
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === user?.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-3 shadow-2xs ${
                          isMine
                            ? 'bg-emerald-700 text-white rounded-br-xs'
                            : 'bg-slate-100 text-slate-900 rounded-bl-xs'
                        }`}
                      >
                        {/* Photo Attachment if present */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mb-2 rounded-xl overflow-hidden max-h-48">
                            <img
                              src={msg.attachments[0].fileUrl}
                              alt="Attachment"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>

                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 px-1">
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isMine && <CheckCheck className="w-3 h-3 text-emerald-600" />}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Attached Photo Preview */}
            {attachmentUrl && (
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={attachmentUrl} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />
                  <span className="text-[11px] text-slate-600">{language === 'ta' ? 'புகைப்படம் இணைக்கப்பட்டது' : 'Photo attached'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachmentUrl(null)}
                  className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]"
                >
                  ×
                </button>
              </div>
            )}

            {/* Message Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
              <label className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer transition shrink-0">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              <input
                type="text"
                placeholder={language === 'ta' ? 'செய்தி அனுப்புக...' : 'Type a message...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
              />

              <button
                type="submit"
                disabled={sending || (!inputText.trim() && !attachmentUrl)}
                className="w-10 h-10 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white flex items-center justify-center shadow-xs transition shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatDrawer;
