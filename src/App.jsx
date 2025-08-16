import { useState } from 'react';
import Login from './pages/Login';
import './styles.css';

export default function App() {
  const [displayName, setDisplayName] = useState(localStorage.getItem('displayName') || '');
  const [room, setRoom] = useState('');

  if (!displayName) return <Login onLogin={setDisplayName} />;
  if (!room) {
    const RoomPicker = require('./components/RoomPicker').default;
    return <div className="container"><RoomPicker onPick={setRoom} /></div>;
  }
  const Room = require('./pages/Room').default;
  return <Room displayName={displayName} room={room} onLeave={() => setRoom('')} />;
}
