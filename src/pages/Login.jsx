import { useState } from 'react';

export default function Login({ onLogin }) {
  const [name, setName] = useState(localStorage.getItem('displayName') || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = name.trim().slice(0, 24);
    if (!clean) return;
    localStorage.setItem('displayName', clean);
    onLogin(clean);
  };

  return (
    <div className="center">
      <h1>ریکَت چت</h1>
      <form onSubmit={handleSubmit} className="card">
        <label>نام نمایشی</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="مثلاً: سامان"
          required
        />
        <button type="submit">ورود</button>
      </form>
    </div>
  );
}
