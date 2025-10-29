import React, { useState, useEffect, useRef } from 'react';

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
  const [ws, setWs] = useState<WebSocket | null>(null);
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

  // 컴포넌트 언마운트 시 WebSocket 정리
  useEffect(() => {
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [ws]);

  // 사용자 정보 가져오기
  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch('http://localhost:8080/api/auth/me', {
        method: 'GET',
        headers: headers
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('사용자 정보:', userData);
        let nick = userData.nickname || userData.name || '테스트사용자';
        
        // 닉네임이 빈 문자열인 경우도 처리
        if (!nick || nick.trim() === '') {
          nick = '테스트사용자';
        }
        
        console.log('설정할 닉네임:', nick);
        setUserNickname(nick);
      } else {
        console.error('사용자 정보 응답 실패:', response.status);
        setUserNickname('테스트사용자'); // 실패시 기본값
      }
    } catch (error) {
      console.error('사용자 정보 가져오기 실패:', error);
    }
  };

  useEffect(() => {
    fetchUserInfo();
    
    // 새로고침 시 참여 상태 복원
    const wasJoined = sessionStorage.getItem('chatRoomJoined');
    if (wasJoined === 'true') {
      handleJoin();
    }
  }, []);

  // 최근 30개 채팅 내역 불러오기
  const fetchRecentMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`http://localhost:8080/api/chat/history/${sessionId}?limit=30`, {
        method: 'GET',
        headers: headers
      });

      if (response.ok) {
        const data = await response.json();
        console.log('채팅 내역 로드:', data);
        setMessages(data);
      } else {
        console.log('채팅 내역 없음, 빈 배열로 시작');
        setMessages([]);
      }
    } catch (error) {
      console.error('채팅 내역 불러오기 실패:', error);
      setMessages([]);
    }
  };

  // 채팅방 입장
  const handleJoin = async () => {
    console.log('참여 버튼 클릭됨');
    setConnectionError('');
    
    try {
      // 먼저 채팅 내역 로드
      await fetchRecentMessages();
      
      // 일단 참여 상태로 변경 (WebSocket 연결 실패해도 채팅 가능하도록)
      setIsJoined(true);
      sessionStorage.setItem('chatRoomJoined', 'true'); // 상태 저장

      // WebSocket 연결 시도
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//localhost:8080/ws`;
        console.log('WebSocket 연결 시도:', wsUrl);
        
        const websocket = new WebSocket(wsUrl);

        websocket.onopen = () => {
          console.log('WebSocket 연결 성공');
          
          // STOMP CONNECT 프레임 전송
          const connectFrame = `CONNECT
accept-version:1.1,1.0
heart-beat:10000,10000

\0`;
          websocket.send(connectFrame);
        };

        websocket.onmessage = (event) => {
          const data = event.data;
          console.log('WebSocket 메시지 수신:', data);
          
          // STOMP CONNECTED 프레임 처리
          if (data.startsWith('CONNECTED')) {
            console.log('STOMP 연결 완료');
            // 채팅방 구독
            const subscribeFrame = `SUBSCRIBE
id:sub-0
destination:/topic/rooms/${sessionId}

\0`;
            websocket.send(subscribeFrame);
            return;
          }

          // MESSAGE 프레임 처리
          if (data.startsWith('MESSAGE')) {
            try {
              const lines = data.split('\n');
              const bodyIndex = lines.findIndex((line: string) => line === '');
              if (bodyIndex !== -1) {
                const body = lines.slice(bodyIndex + 1).join('\n').replace(/\0$/, '');
                const messageData = JSON.parse(body);
                console.log('새 메시지 수신:', messageData);
                setMessages(prev => [...prev, messageData]);
              }
            } catch (e) {
              console.error('메시지 파싱 실패:', e);
            }
          }
        };

        websocket.onerror = (error) => {
          console.error('WebSocket 에러:', error);
          setConnectionError('실시간 연결 실패 (메시지는 전송 가능)');
        };

        websocket.onclose = () => {
          console.log('WebSocket 연결 종료');
        };

        setWs(websocket);
      } catch (wsError) {
        console.error('WebSocket 연결 실패:', wsError);
        setConnectionError('실시간 연결 실패 (메시지는 전송 가능)');
      }
    } catch (error) {
      console.error('입장 처리 실패:', error);
      setConnectionError('입장 실패');
    }
  };

  // 채팅방 퇴장
  const handleLeave = () => {
    console.log('퇴장 버튼 클릭됨');
    
    if (ws) {
      try {
        ws.send(`DISCONNECT

\0`);
        ws.close();
      } catch (e) {
        console.error('WebSocket 종료 오류:', e);
      }
      setWs(null);
    }
    
    setIsJoined(false);
    setMessages([]);
    setConnectionError('');
    sessionStorage.removeItem('chatRoomJoined'); // 상태 제거
  };

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) {
      console.log('빈 메시지는 전송 불가');
      return;
    }

    console.log('=== 메시지 전송 시작 ===');
    console.log('입력 메시지:', inputMessage);
    console.log('현재 userNickname 상태:', userNickname);

    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const requestBody = {
        sessionId: sessionId,
        content: inputMessage,
        nickname: userNickname
      };
      
      console.log('전송할 데이터:', requestBody);

      const response = await fetch('http://localhost:8080/api/chat/send', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      console.log('전송한 닉네임:', userNickname);
      console.log('토큰:', token ? '있음' : '없음');
      console.log('응답 상태:', response.status);

      console.log('메시지 전송 응답:', response.status);

      if (response.ok) {
        console.log('메시지 전송 성공');
        setInputMessage('');
      } else {
        console.log('메시지 전송 실패, 로컬에 추가');
        // 실패해도 로컬에 표시
        const newMsg: ChatMessage = {
          content: inputMessage,
          createAt: new Date().toISOString(),
          sessionId: sessionId
        };
        setMessages(prev => [...prev, newMsg]);
        setInputMessage('');
      }
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      // 오류 발생 시에도 로컬에 표시
      const newMsg: ChatMessage = {
        content: inputMessage,
        createAt: new Date().toISOString(),
        sessionId: sessionId
      };
      setMessages(prev => [...prev, newMsg]);
      setInputMessage('');
    }
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
        {/* h-64 → h-96 으로 변경하면 더 커집니다. h-80, h-[500px] 등 원하는 크기로 조절 가능 */}
        {!isJoined ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            참여 버튼을 눌러 채팅방에 입장하세요
          </div>
        ) : (
          <>
            {/* 메시지 목록 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 text-sm mt-8">
                  채팅 내역이 없습니다. 첫 메시지를 보내보세요!
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={msg.id || index} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-xs font-semibold text-blue-600">
                        {msg.nickname || '익명'}
                      </span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(msg.createAt).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-gray-800 text-sm break-words">{msg.content}</p>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 메시지 입력 */}
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