import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function VoicePanel({ room, displayName }) {
  const [joined, setJoined] = useState(false);
  const [devices, setDevices] = useState([]);
  const [micId, setMicId] = useState('');
  const pcMap = useRef(new Map());
  const streamRef = useRef(null);
  const channelRef = useRef(null);

  useEffect(() => {
    const ch = supabase.channel(`rtc:${room}`, { config: { broadcast: { self: true } } });
    ch.on('broadcast', { event: 'signal' }, async ({ payload }) => {
      const { from, to, sdp, ice } = payload;
      if (to && to !== displayName) return;
      let pc = pcMap.current.get(from);
      if (!pc) pc = createPeer(from, false);
      if (sdp) {
        await pc.setRemoteDescription(sdp);
        if (sdp.type === 'offer') {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          ch.send({ type: 'broadcast', event: 'signal', payload: { from: displayName, to: from, sdp: pc.localDescription } });
        }
      }
      if (ice) await pc.addIceCandidate(ice).catch(()=>{});
    });
    ch.subscribe();
    channelRef.current = ch;
    return () => ch.unsubscribe();
  }, [room, displayName]);

  const createPeer = (peerName, isInitiator) => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]});
    pcMap.current.set(peerName, pc);

    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) pc.addTrack(track, streamRef.current);
    }

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        channelRef.current?.send({
          type: 'broadcast', event: 'signal',
          payload: { from: displayName, to: peerName, ice: e.candidate }
        });
      }
    };

    pc.ontrack = (e) => {
      const elId = `audio-${peerName}`;
      let el = document.getElementById(elId);
      if (!el) {
        el = document.createElement('audio');
        el.id = elId;
        el.autoplay = true;
        el.playsInline = true;
        document.getElementById('voice-peers').appendChild(el);
      }
      el.srcObject = e.streams[0];
    };

    if (isInitiator) {
      pc.createOffer().then(offer => {
        pc.setLocalDescription(offer);
        channelRef.current?.send({ type: 'broadcast', event: 'signal', payload: { from: displayName, to: peerName, sdp: offer } });
      });
    }
    return pc;
  };

  const join = async () => {
    const devs = await navigator.mediaDevices.enumerateDevices();
    const mics = devs.filter(d => d.kind === 'audioinput');
    setDevices(mics);
    if (!micId && mics[0]) setMicId(mics[0].deviceId);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: micId ? { deviceId: micId } : true });
    streamRef.current = stream;
    setJoined(true);

    const list = document.querySelectorAll('.presence ul li');
    const peers = Array.from(list).map(li => li.textContent).filter(n => n !== displayName);
    peers.forEach(p => createPeer(p, true));
  };

  const leave = () => {
    setJoined(false);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    for (const [, pc] of pcMap.current) pc.close();
    pcMap.current.clear();
    const container = document.getElementById('voice-peers');
    if (container) container.innerHTML = '';
  };

  return (
    <section className="card">
      <h2>تماس صوتی</h2>
      {!joined ? (
        <>
          {devices.length > 0 && (
            <div className="row">
              <label>میکروفون</label>
              <select value={micId} onChange={e=>setMicId(e.target.value)}>
                {devices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Microphone'}</option>)}
              </select>
            </div>
          )}
          <button onClick={join}>پیوستن به تماس</button>
        </>
      ) : (
        <button onClick={leave}>خروج از تماس</button>
      )}
      <div id="voice-peers" className="peers"></div>
    </section>
  );
}
