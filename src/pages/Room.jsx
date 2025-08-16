import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import ChatBox from '../components/ChatBox';
import VoicePanel from '../components/VoicePanel';

export default function Room({ displayName, room, onLeave }) {
  const [presence, setPresence] = useState([]);
  const channelRef = useRef(null);

  useEffect(() => {
    const ch = supabase.channel(`room:${room}`, {
      config: { broadcast: { self: true }, presence: { key: displayName } }
    });

    ch.on('presence', { event: 'sync' }, () => {
      const state = ch.presenceState();
      const list = Object.values(state).flat().map(p => p.key);
      setPresence(list);
    });

    ch.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await ch.track({ key: displayName, joinedAt: Date.now() });
      }
    });

    channelRef.current = ch;
    return () => { ch.unsubscribe(); };
  }, [room, displayName]);

  return (
    <div className="layout">
      <aside className="sidebar">
        <h3>اتاق: {room}</h3>
        <div className="presence">
          <strong>آنلاین‌ها</strong>
          <ul>{presence.map(p => <li key={p}>{p}</li>)}</ul>
        </div>
        <button onClick={onLeave}>خروج</button>
      </aside>
      <main className="main">
        <ChatBox room={room} displayName={displayName} channelRef={channelRef} />
        <VoicePanel room={room} displayName={displayName} channelRef={channelRef} />
      </main>
    </div>
  );
}
