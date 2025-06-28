import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ChatModal from '@/components/ChatModal';

const baseUrl = import.meta.env.VITE_BACKEND_PORT;

const MessagesView = () => {
  const [newMessages, setNewMessages] = useState([]);
  const [seenMessages, setSeenMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ FIXED: Parse user object to get doctorId
  const getUserId = () => {
    // Try to get userId directly first
    const directUserId = localStorage.getItem('userId');
    if (directUserId) return directUserId;
    
    // Fallback: parse user object
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user._id || user.id || '';
      }
    } catch (err) {
      console.error('Error parsing user from localStorage:', err);
    }
    
    return '';
  };
  
  const doctorId = getUserId();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      if (!doctorId) {
        throw new Error('Doctor ID not found. Please log in again.');
      }

      console.log('Fetching messages for doctor:', doctorId);
      
      const res = await fetch(`${baseUrl}/api/messages/for-doctor/${doctorId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('Messages data received:', data);
      
      setNewMessages(data.new || []);
      setSeenMessages(data.seen || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openChat = async (mother, wasNew) => {
    setActiveChat(mother);

    if (wasNew) {
      // Move from new to seen immediately
      setNewMessages((prev) => prev.filter((m) => m.motherId !== mother.motherId));
      setSeenMessages((prev) => [...prev, mother]);

      // Mark as seen on backend
      try {
        const response = await fetch(`${baseUrl}/api/messages/mark-seen`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({ doctorId, motherId: mother.motherId }),
        });

        if (!response.ok) {
          console.error('Failed to mark messages as seen');
        }
      } catch (err) {
        console.error('Error marking messages as seen:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Messages</h1>
        <div className="text-center">Loading messages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Messages</h1>
        <div className="text-center text-red-500">
          <p>Error: {error}</p>
          <button 
            onClick={fetchMessages}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Messages</h1>

      <section>
        <h2 className="text-xl font-semibold mb-4">🆕 New Messages ({newMessages.length})</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {newMessages.length === 0 ? (
            <p className="text-gray-500">No new messages</p>
          ) : (
            newMessages.map((msg) => (
              <Card
                key={msg.motherId}
                onClick={() => openChat(msg, true)}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <p className="font-bold">{msg.name}</p>
                  <p className="text-gray-500 line-clamp-1">{msg.latestMessage}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(msg.sentAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">✅ Seen Messages ({seenMessages.length})</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {seenMessages.length === 0 ? (
            <p className="text-gray-500">No seen messages</p>
          ) : (
            seenMessages.map((msg) => (
              <Card
                key={msg.motherId}
                onClick={() => openChat(msg, false)}
                className="cursor-pointer hover:shadow-sm transition-shadow"
              >
                <CardContent className="p-4">
                  <p className="font-bold">{msg.name}</p>
                  <p className="text-gray-500 line-clamp-1">{msg.latestMessage}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(msg.sentAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      {activeChat && (
        <ChatModal
          doctorId={doctorId}
          motherId={activeChat.motherId}
          doctorName="You"
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  );
};

export default MessagesView;