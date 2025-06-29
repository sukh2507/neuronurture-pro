import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Clock, User, RefreshCw } from 'lucide-react';

const baseUrl = import.meta.env.VITE_BACKEND_PORT;

interface MessageData {
  motherId: string;
  name: string;
  latestMessage: {
    content: string;
    sentAt: string;
    seen: boolean;
    messageId: string;
  } | null;
  sentAt: string;
  messageCount: number;
  unreadCount: number;
}

const MessagesView = () => {
  const [doctorId, setDoctorId] = useState<string>('');
  const [newMessages, setNewMessages] = useState<MessageData[]>([]);
  const [seenMessages, setSeenMessages] = useState<MessageData[]>([]);
  const [activeChat, setActiveChat] = useState<MessageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const getToken = () => {
    return localStorage.getItem('token') || 
           localStorage.getItem('authToken') || 
           localStorage.getItem('accessToken') || '';
  };

  useEffect(() => {
    const fetchDoctorProfileId = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('User ID not found in localStorage');
        setLoading(false);
        return;
      }

      try {
        const token = getToken();
const response = await fetch(`${baseUrl}/api/doctor/profile-id/${userId}`, {
  headers: {
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  }
});


        if (!response.ok) throw new Error('Failed to fetch doctor profile');
        const data = await response.json();
        setDoctorId(data.doctorId || '');

      } catch (err) {
        console.error('Error fetching doctor profile ID:', err);
        setError('Failed to retrieve doctor profile');
        setLoading(false);
      }
    };

    fetchDoctorProfileId();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        const res = await fetch(`${baseUrl}/api/messages/for-doctor/${doctorId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();
        if (data.success) {
          setNewMessages(data.new || []);
          setSeenMessages(data.seen || []);
        } else {
          setError(data.error || 'Failed to load messages');
        }
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    // Get doctorId from local storage or context
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user && user._id) setDoctorId(user._id);
    }

    if (doctorId) fetchMessages();
  }, [doctorId]);

  const fetchMessages = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      } else {
        setRefreshing(true);
      }

      const token = getToken();
      if (!token) throw new Error('No authentication token found.');
      if (!doctorId) throw new Error('Doctor ID not found.');

      const res = await fetch(`${baseUrl}/api/messages/for-doctor/${doctorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error: ${res.status} - ${text}`);
      }

      const data = await res.json();
      if (data.success) {
        setNewMessages(data.new || []);
        setSeenMessages(data.seen || []);
      } else {
        throw new Error(data.error || 'Failed to fetch messages');
      }
    } catch (err: any) {
      if (!silent) {
        setError(err.message || 'Unknown error');
      }
    } finally {
      if (!silent) setLoading(false);
      else setRefreshing(false);
    }
  };

  const openChat = async (mother: MessageData, wasNew: boolean) => {
    setActiveChat(mother);

    if (wasNew && mother.unreadCount > 0) {
      const updatedMother = { ...mother, unreadCount: 0 };
      setNewMessages(prev => prev.filter(m => m.motherId !== mother.motherId));
      setSeenMessages(prev => [updatedMother, ...prev.filter(m => m.motherId !== mother.motherId)]);

      try {
        const token = getToken();
        await fetch(`${baseUrl}/api/messages/mark-seen`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ doctorId, motherId: mother.motherId }),
        });
      } catch (err) {
        console.error('Error marking messages as seen:', err);
      }
    }

    console.log('Opening chat with:', mother.name, mother.motherId);
  };

  const refreshMessages = () => fetchMessages();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diff < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff < 168) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Messages</h1>
        <div className="flex justify-center items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-gray-600">Loading messages...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Messages</h1>
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 inline-block">
          <p className="text-red-600">{error}</p>
          <button onClick={refreshMessages} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Messages</h1>
        <button onClick={refreshMessages} disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50">
          <RefreshCw className={`${refreshing ? 'animate-spin' : ''} w-4 h-4`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* New Messages */}
      <section>
        <h2 className="text-xl font-semibold flex items-center gap-2 text-red-600 mb-4">
          <MessageSquare className="w-5 h-5" /> New Messages ({newMessages.length})
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {newMessages.length === 0 ? (
            <div className="text-gray-500 col-span-full text-center py-8">No new messages</div>
          ) : (
            newMessages.map(msg => (
              <Card key={msg.motherId} onClick={() => openChat(msg, true)}
                className="cursor-pointer hover:shadow border-l-4 border-red-400 bg-red-50 hover:bg-red-100 transition">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <p className="font-bold text-gray-800">{msg.name}</p>
                    </div>
                    {msg.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{msg.unreadCount}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
  {msg.latestMessage?.content || 'No message yet'}
</p>

                  <div className="flex justify-between text-xs text-gray-400 mt-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatDate(msg.sentAt)}
                    </div>
                    <span>{msg.messageCount} message{msg.messageCount !== 1 ? 's' : ''}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Seen Messages */}
      <section>
        <h2 className="text-xl font-semibold flex items-center gap-2 text-green-600 mb-4">
          <MessageSquare className="w-5 h-5" /> Seen Messages ({seenMessages.length})
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {seenMessages.length === 0 ? (
            <div className="text-gray-500 col-span-full text-center py-8">No seen messages</div>
          ) : (
            seenMessages.map(msg => (
              <Card key={msg.motherId} onClick={() => openChat(msg, false)}
                className="cursor-pointer hover:shadow border-l-4 border-green-400 hover:bg-gray-50 transition">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <p className="font-bold text-gray-700">{msg.name}</p>
                    </div>
                  </div>
<p className="text-sm text-gray-600 line-clamp-2">
  {msg.latestMessage?.content || 'No message yet'}
</p>
                  <div className="flex justify-between text-xs text-gray-400 mt-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatDate(msg.sentAt)}
                    </div>
                    <span>{msg.messageCount} message{msg.messageCount !== 1 ? 's' : ''}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default MessagesView;
