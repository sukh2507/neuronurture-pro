import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Loader2 } from 'lucide-react';

const baseUrl = import.meta.env.VITE_BACKEND_PORT;

interface ChatModalProps {
  doctorId: string;
  doctorName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  _id: string;
  content: string;
  senderRole: 'doctor' | 'mother';
  createdAt: string;
  seen?: boolean;
  doctorId?: {
    _id: string;
    fullName: string;
    email: string;
  };
  motherId?: {
    _id: string;
    fullName: string;
  };
}

const ChatModal: React.FC<ChatModalProps> = ({ doctorId, doctorName, isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [motherId, setMotherId] = useState<string>('');
  const [error, setError] = useState<string>('');

  const userId = localStorage.getItem('userId') ?? '';
  const token = localStorage.getItem('authToken') ?? '';

  // Debug function to log all relevant data
  const debugLog = (message: string, data?: any) => {
    console.log(`[ChatModal Debug] ${message}`, data);
  };

  // Fetch motherId when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      debugLog('Modal opened, fetching mother ID', { userId, doctorId });
      fetchMotherId(userId);
    }
  }, [isOpen, userId]);

  const fetchMotherId = async (userId: string) => {
    try {
      setError('');
      debugLog('Fetching mother profile for userId:', userId);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const url = `${baseUrl}/api/mother/by-user/${userId}`;
      debugLog('Fetching from URL:', url);
      
      const res = await fetch(url, { headers });
      debugLog('Response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        debugLog('API Error:', errorText);
        throw new Error(`Failed to fetch mother profile: ${res.status} - ${errorText}`);
      }
      
      const data = await res.json();
      debugLog('Mother profile data:', data);
      
      if (data && data._id) {
        setMotherId(data._id);
        debugLog('Mother ID set to:', data._id);
      } else {
        debugLog('No _id found in mother profile data');
        setError('Mother profile found but no ID available');
      }
    } catch (err) {
      debugLog('Error fetching mother profile:', err);
      setError(`Failed to load mother profile: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    if (isOpen && motherId && doctorId) {
      debugLog('Fetching messages for:', { motherId, doctorId });
      fetchMessages();
    }
  }, [isOpen, motherId, doctorId]);

  const fetchMessages = async () => {
    if (!motherId || !doctorId) {
      debugLog('Missing IDs, not fetching messages', { motherId, doctorId });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(''); // Clear previous errors
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = `${baseUrl}/api/messages/${doctorId}/${motherId}`;
      debugLog('Fetching messages from URL:', url);
      debugLog('Request headers:', headers);

      const res = await fetch(url, { headers });
      debugLog('Messages response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        debugLog('Messages API Error:', { status: res.status, error: errorText });
        throw new Error(`Failed to fetch messages: ${res.status} - ${errorText}`);
      }
      
      const response = await res.json();
      debugLog('Messages response:', response);
      
      // Handle the response structure
      if (response.success) {
        setMessages(response.data || []);
        debugLog('Messages set successfully:', response.data?.length || 0);
      } else {
        debugLog('Response not successful:', response);
        setMessages([]);
        setError(response.error || 'Failed to load messages');
      }
    } catch (err) {
      debugLog('Error fetching messages:', err);
      setError(`Failed to load messages: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !motherId || !doctorId) {
      debugLog('Cannot send message - missing data', { 
        hasMessage: !!newMessage.trim(), 
        motherId, 
        doctorId 
      });
      return;
    }
    
    setSending(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const payload = {
        doctorId,
        motherId,
        content: newMessage.trim(),
        senderRole: 'mother'
      };

      debugLog('Sending message with payload:', payload);

      const res = await fetch(`${baseUrl}/api/messages/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const response = await res.json();
      debugLog('Send message response:', response);

      if (response.success) {
        // Add the new message to the list
        setMessages((prev) => [...prev, response.data]);
        setNewMessage('');
        setError(''); // Clear any previous errors
      } else {
        debugLog('Failed to send message:', response.error);
        setError(response.error || 'Failed to send message');
      }
    } catch (err) {
      debugLog('Error sending message:', err);
      setError(`Failed to send message: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Debug info display (remove in production)
  const debugInfo = (
    <div className="bg-gray-50 p-2 text-xs text-gray-600 rounded border">
      <div>BaseURL: {baseUrl}</div>
      <div>UserID: {userId}</div>
      <div>MotherID: {motherId}</div>
      <div>DoctorID: {doctorId}</div>
      <div>Token: {token ? 'Present' : 'Missing'}</div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full p-4 flex flex-col gap-4">
        <div className="font-semibold text-lg">Chat with Dr. {doctorName}</div>

        {/* Debug info - remove in production */}
        {debugInfo}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded">
            {error}
          </div>
        )}

        <ScrollArea className="h-64 bg-gray-100 rounded-md p-3 overflow-y-auto border">
          {loading ? (
            <div className="text-center py-6 text-gray-500">
              <Loader2 className="animate-spin mx-auto" />
              Loading messages...
            </div>
          ) : !motherId ? (
            <div className="text-center py-6 text-red-500">
              Unable to load mother profile. Please try refreshing the page.
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-gray-500">No messages yet. Start a conversation!</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`mb-2 p-2 rounded-lg max-w-[75%] ${
                  msg.senderRole === 'mother'
                    ? 'bg-pink-200 self-end ml-auto'
                    : 'bg-white border self-start'
                }`}
              >
                <div className="text-sm">{msg.content}</div>
                <div className="text-xs text-right text-gray-500">
                  {new Date(msg.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </ScrollArea>

        <div className="flex gap-2 items-start">
          <Textarea
            rows={2}
            className="flex-1 resize-none"
            placeholder={motherId ? "Type your message..." : "Loading..."}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!motherId || !doctorId}
          />
          <Button 
            onClick={handleSend} 
            disabled={sending || !newMessage.trim() || !motherId || !doctorId}
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;