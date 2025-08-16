import { useState } from 'react';

const DEFAULT_ROOMS = ['general', 'gaming', 'school', 'dev'];

export default function RoomPicker({ onPick }) {
  const [room, setRoom] = useState(DEFAULT_ROOMS[0]);
  const [custom, setCustom] = useState('');

  const join = (e) => {
    e.preventDefault();
    const r = (custom || room).trim().toLowerCase().replace(/\s+/g, '-').slice(0, 32);
    if (r) onPick(r);
  };

  return (
    <form onSubmit={join} className="card">
      <h2>اتاق را انتخاب کن</h2>
      <div className="row">
        <select value={room} onChange={(e)=>setRoom(e.target.value)}>
          {DEFAULT_ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <span>یا</span>
        <input value={custom} onChange={e=>setCustom(e.target.value)} placeholder="نام اتاق دلخواه" />
      </div>
      <button type="submit">ورود به اتاق</button>
    </form>
  );
}
