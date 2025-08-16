import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function ChatBox({ room, displayName }) {
  const [text, setText] = useState('');
  const [msgs, setMsgs] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    let sub;
    const run = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('room', room)
        .order('created_at', { ascending: true })
        .limit(200);
      setMsgs(data || []);

      sub = supabase
        .channel(`table:messages:${room}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `room=eq.${room}` },
          (payload) => setMsgs(prev => [...prev, payload.new])
        )
        .subscribe();
    };
    run();
    return () => { sub && sub.unsubscribe(); };
  }, [room]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs.length]);

  const send = async (e) => {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    setText('');
    await supabase.from('messages').insert({ room, author: displayName, content });
  };

  return (
    <section className="card">
      <h2>چت</h2>
      <div className="chat-list">
        {msgs.map(m => (
          <div key={m.id} className={`msg ${m.author===displayName?'me':''}`}>
            <b>{m.author}</b><span>{new Date(m.created_at).toLocaleTimeString()}</span>
            <p>{m.content}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="row">
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="پیامت رو بنویس..." />
        <button type="submit">ارسال</button>
      </form>
    </section>
  );
}
