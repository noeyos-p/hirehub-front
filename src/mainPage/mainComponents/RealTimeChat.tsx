import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// SockJS를 위한 global 정의
if (typeof window !== 'undefined') {
  (window as any).global = window;
  (window as any).process = { env: { NODE_ENV: 'development' } };
}

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
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = 'main-chat-room';
  
  // Vite Proxy를 사용하는 경우 빈 문자열, 직접 연결은 'http://localhost:8080'
  const API_BASE_URL = '';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (stompClient) {
        console.log('컴포넌트 언마운트: WebSocket 연결 해제');
        stompClient.deactivate();
      }
    };
  }, [stompClient]);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('토큰 없음 - 익명 사용자');
        setUserNickname('익명');
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const user = await res.json();
        const nick = user.nickname || user.name || '익명';
        console.log('사용자 정보 조회 성공:', user);
        setUserNickname(nick.trim() || '익명');
      } else {
        console.log('사용자 정보 조회 실패');
        setUserNickname('익명');
      }
    } catch (e) {
      console.error('사용자 정보 조회 에러:', e);
      setUserNickname('익명');
    }
  };

  useEffect(() => {
    fetchUserInfo();
    if (sessionStorage.getItem('chatRoomJoined') === 'true') {
      handleJoin();
    }
  }, []);

  const fetchRecentMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/api/chat/history/${sessionId}?limit=30`, { headers });
      if (res.ok) {
        const messages = await res.json();
        console.log('이전 메시지 로드:', messages.length, '개');
        setMessages(messages);
      } else {
        console.log('메시지 로드 실패');
        setMessages([]);
      }
    } catch (e) {
      console.error('메시지 로드 에러:', e);
      setMessages([]);
    }
  };

  const handleJoin = async () => {
    setConnectionError('');
    console.log('=== 채팅방 입장 시작 ===');
    
    try {
      await fetchRecentMessages();
      setIsJoined(true);
      sessionStorage.setItem('chatRoomJoined', 'true');

      const token = localStorage.getItem('token');
      console.log('WebSocket 연결 시도, 토큰 존재:', !!token);

      const client = new Client({
        webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
        connectHeaders: token ? {
          Authorization: `Bearer ${token}`
        } : {},
        debug: (str) => console.log('STOMP:', str),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = (frame) => {
        console.log('✅ STOMP 연결 성공', frame);
        setIsConnected(true);
        setConnectionError('');
        
        const subscription = client.subscribe(`/topic/rooms/${sessionId}`, (message) => {
          console.log('📨 새 메시지 수신:', message.body);
          try {
            const newMsg: ChatMessage = JSON.parse(message.body);
            console.log('파싱된 메시지:', newMsg);
            
            setMessages((prev) => {
              // 중복 체크 (ID가 있는 경우)
              if (newMsg.id && prev.some(m => m.id === newMsg.id)) {
                console.log('중복 메시지 무시:', newMsg.id);
                return prev;
              }
              console.log('메시지 추가:', newMsg);
              return [...prev, newMsg];
            });
          } catch (e) {
            console.error('메시지 파싱 실패:', e);
          }
        });
        
        console.log('구독 완료:', subscription);
      };

      client.onStompError = (frame) => {
        console.error('❌ STOMP 에러:', frame);
        setConnectionError('연결 실패. 새로고침하세요.');
        setIsConnected(false);
      };

      client.onWebSocketClose = (event) => {
        console.log('WebSocket 연결 종료:', event);
        setIsConnected(false);
      };

      client.onDisconnect = () => {
        console.log('STOMP 연결 해제');
        setIsConnected(false);
      };

      client.activate();
      setStompClient(client);
      
      console.log('=== 채팅방 입장 완료 ===');
    } catch (e) {
      console.error('채팅방 입장 실패:', e);
      setConnectionError('입장 실패');
    }
  };

  const handleLeave = () => {
    console.log('채팅방 퇴장');
    setIsJoined(false);
    sessionStorage.removeItem('chatRoomJoined');
    setMessages([]);
    setIsConnected(false);
    
    if (stompClient) {
      stompClient.deactivate();
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) {
      console.log('빈 메시지 전송 시도 차단');
      return;
    }

    const token = localStorage.getItem('token');
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    console.log('메시지 전송 시도:', {
      sessionId,
      content: inputMessage,
      nickname: userNickname,
      hasToken: !!token,
      url: `${API_BASE_URL}/api/chat/send`
    });

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sessionId,
          content: inputMessage,
          nickname: userNickname || '익명',
        }),
      });

      if (res.ok) {
        console.log('✅ 메시지 전송 성공');
        setInputMessage('');
      } else {
        console.error('❌ 메시지 전송 실패:', res.status);
        addLocalMessage();
      }
    } catch (e) {
      console.error('❌ 메시지 전송 에러:', e);
      addLocalMessage();
    }
  };

  const addLocalMessage = () => {
    console.log('로컬 메시지 추가 (fallback)');
    setMessages((prev) => [
      ...prev,
      {
        content: inputMessage,
        createAt: new Date().toISOString(),
        sessionId,
        nickname: userNickname || '익명',
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
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-800">실시간 채팅</h2>
          {isJoined && (
            <span className={`text-xs px-2 py-1 rounded-full ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isConnected ? '● 연결됨' : '○ 연결 끊김'}
            </span>
          )}
        </div>
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
                  disabled={!isConnected}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || !isConnected}
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