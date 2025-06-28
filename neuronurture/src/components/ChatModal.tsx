import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SendHorizonal } from 'lucide-react';
import io from 'socket.io-client';

const baseUrl = import.meta.env.VITE_BACKEND_PORT;
const socket = io(baseUrl);

const ChatModal = ({ doctorId, motherId, doctorName = 'You', onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    // Fetch chat history
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/messages/history/${doctorId}/${motherId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error('Error loading messages:', err);
      }
    };

    fetchMessages();
  }, [doctorId, motherId]);

  useEffect(() => {
    // Join socket room
    const room = `${doctorId}_${motherId}`;
    socket.emit('joinRoom', room);

    socket.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('receiveMessage');
      socket.emit('leaveRoom', room);
    };
  }, [doctorId, motherId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const msg = {
      senderId: doctorId,
      receiverId: motherId,
      senderModel: 'Doctor',
      receiverModel: 'MotherProfile',
      content: input.trim(),
    };

    socket.emit('sendMessage', msg);
    setMessages((prev) => [...prev, { ...msg, sentAt: new Date() }]);
    setInput('');
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 flex flex-col">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-lg">Chat with Mother</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4 space-y-2 overflow-y-auto max-h-[400px]">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-sm px-4 py-2 rounded-xl text-sm ${
                msg.senderId === doctorId
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white self-end ml-auto'
                  : 'bg-gray-200 text-gray-900 self-start'
              }`}
            >
              {msg.content}
            </div>
          ))}
          <div ref={scrollRef} />
        </ScrollArea>

        <div className="flex gap-2 p-4 border-t">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend}>
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;
