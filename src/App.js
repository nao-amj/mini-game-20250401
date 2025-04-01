import React, { useState } from 'react';
import './App.css';

function App() {
  const [score, setScore] = useState(0);

  const handleClick = () => {
    setScore(score + 1);
  };

  return (
    <div className="App">
      <h1>ミニクリッカーゲーム</h1>
      <p>スコア: {score}</p>
      <button onClick={handleClick}>クリック！</button>
    </div>
  );
}

export default App;
