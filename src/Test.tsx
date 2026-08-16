import { useEffect, useState } from 'react';

function App() {
  const [status, setStatus] = useState('checking...');

  useEffect(() => {
    fetch('https://localhost:44367/api/ping')
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(() => setStatus('failed to connect'));
  }, []);

  return <div>API status: {status}</div>;
}

export default App;