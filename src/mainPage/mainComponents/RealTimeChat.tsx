import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface ChatMessage {
  id?: number;
  content: string;
  createAt: string;
  sessionId: string;
  nickname?: string;
}

const RealTimeChat: React.FC = () => {
  const [isJoined, setIsJoined] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [connectionError, setConnectionError] = useState<string>('');
  const [userNickname, setUserNickname] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = 'main-chat-room';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      stompClient?.deactivate();
    };
  }, [stompClient]);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const user = await res.json();
        const nick = user.nickname || user.name || '테스트사용자';
        setUserNickname(nick.trim() || '테스트사용자');
      }
    } catch (e) {
      setUserNickname('테스트사용자');
    }
  };

  useEffect(() => {
    fetchUserInfo();
    if (sessionStorage.getItem('chatRoomJoined') === 'true') handleJoin();
  }, []);

  const fetchRecentMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/chat/history/${sessionId}?limit=30`, { headers });
      if (res.ok) setMessages(await res.json());
      else setMessages([]);
    } catch (e) {
      setMessages([]);
    }
  };

  const handleJoin = async () => {
    setConnectionError('');
    try {
      await fetchRecentMessages();
      setIsJoined(true);
      sessionStorage.setItem('chatRoomJoined', 'true');

      const client = new Client({
        webSocketFactory: () => new SockJS('/ws'),
        debug: (str) => console.log('STOMP:', str),
        reconnectDelay: 5000,
      });

      client.onConnect = () => {
        console.log('STOMP 연결 성공');
        client.subscribe(`/topic/rooms/${sessionId}`, (msg) => {
          const newMsg: ChatMessage = JSON.parse(msg.body);
          setMessages((prev) => [...prev, newMsg]);
        });
      };

      client.onStompError = () => {
        setConnectionError('연결 실패. 새로고침하세요.');
      };

      client.activate();
      setStompClient(client);
    } catch (e) {
      setConnectionError('입장 실패');
    }
  };

  const handleLeave = () => {
    setIsJoined(false);
    sessionStorage.removeItem('chatRoomJoined');
    setMessages([]);
    stompClient?.deactivate();
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const token = localStorage.getItem('token');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sessionId,
          content: inputMessage,
          nickname: userNickname || '익명',
        }),
      });

      if (res.ok) setInputMessage('');
      else addLocalMessage();
    } catch (e) {
      addLocalMessage();
    }
  };

  const addLocalMessage = () => {
    setMessages((prev) => [
      ...prev,
      {
        content: inputMessage,
        createAt: new Date().toISOString(),
        sessionId,
        nickname: userNickname,
      },
    ]);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <section className="">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">실시간 채팅</h2>
        <div className="flex gap-2">
          {!isJoined ? (
            <button
              onClick={handleJoin}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              참여
            </button>
          ) : (
            <button
              onClick={handleLeave}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
            >
              퇴장
            </button>
          )}
        </div>
      </div>

      {connectionError && (
        <div className="mb-2 p-2 bg-yellow-100 text-yellow-800 text-xs rounded">
          {connectionError}
        </div>
      )}

      <div className="h-96 bg-gray-100 rounded-lg overflow-hidden flex flex-col">
        {!isJoined ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            참여 버튼을 눌러 채팅방에 입장하세요
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm mt-8">
                  채팅 내역이 없습니다. 첫 메시지를 보내보세요!
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={msg.id || i} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xs font-semibold text-blue-600">
                        {msg.nickname || '익명'}
                      </span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(msg.createAt).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-gray-800 text-sm break-words">{msg.content}</p>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-300 p-3 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  전송
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default RealTimeChat;