import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Game state
  const [score, setScore] = useState(0);
  const [clickValue, setClickValue] = useState(1);
  const [autoClickValue, setAutoClickValue] = useState(0);
  const [lastSaved, setLastSaved] = useState(null);
  
  // Upgrades state
  const [upgrades, setUpgrades] = useState([
    { id: 1, name: "パワフルクリック", cost: 10, value: 1, description: "クリック毎に+1ポイント", owned: 0 },
    { id: 2, name: "スーパークリック", cost: 50, value: 5, description: "クリック毎に+5ポイント", owned: 0 },
    { id: 3, name: "ウルトラクリック", cost: 200, value: 25, description: "クリック毎に+25ポイント", owned: 0 }
  ]);
  
  // Auto-clickers state
  const [autoClickers, setAutoClickers] = useState([
    { id: 1, name: "オートクリッカー", cost: 15, value: 0.1, description: "毎秒0.1ポイント", owned: 0 },
    { id: 2, name: "クリックロボット", cost: 100, value: 1, description: "毎秒1ポイント", owned: 0 },
    { id: 3, name: "クリック工場", cost: 500, value: 10, description: "毎秒10ポイント", owned: 0 }
  ]);
  
  // Achievements state
  const [achievements, setAchievements] = useState([
    { id: 1, name: "初心者", description: "10ポイント達成", threshold: 10, achieved: false },
    { id: 2, name: "がんばれ！", description: "100ポイント達成", threshold: 100, achieved: false },
    { id: 3, name: "熟練者", description: "1,000ポイント達成", threshold: 1000, achieved: false },
    { id: 4, name: "マスター", description: "10,000ポイント達成", threshold: 10000, achieved: false },
    { id: 5, name: "達人", description: "最初のアップグレードを購入", upgradeId: 1, achieved: false },
    { id: 6, name: "機械化", description: "最初のオートクリッカーを購入", autoClickerId: 1, achieved: false }
  ]);
  
  // Message for new achievements
  const [newAchievement, setNewAchievement] = useState(null);
  
  // Load game from localStorage
  useEffect(() => {
    const savedGame = localStorage.getItem('clickerGame');
    if (savedGame) {
      const gameData = JSON.parse(savedGame);
      setScore(gameData.score);
      setClickValue(gameData.clickValue);
      setAutoClickValue(gameData.autoClickValue);
      setUpgrades(gameData.upgrades);
      setAutoClickers(gameData.autoClickers);
      setAchievements(gameData.achievements);
      setLastSaved(new Date().toLocaleString());
    }
  }, []);

  // Save game to localStorage
  useEffect(() => {
    const gameData = {
      score,
      clickValue,
      autoClickValue,
      upgrades,
      autoClickers,
      achievements
    };
    localStorage.setItem('clickerGame', JSON.stringify(gameData));
    setLastSaved(new Date().toLocaleString());
  }, [score, clickValue, autoClickValue, upgrades, autoClickers, achievements]);

  // Auto-clicker effect - runs every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoClickValue > 0) {
        setScore(prevScore => {
          const newScore = prevScore + autoClickValue;
          checkAchievements(newScore);
          return newScore;
        });
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [autoClickValue]);

  // Handle manual clicking
  const handleClick = () => {
    const newScore = score + clickValue;
    setScore(newScore);
    checkAchievements(newScore);
    
    // Add visual effect to the button (CSS class will be added and removed for animation)
    const button = document.querySelector('.click-button');
    button.classList.add('button-clicked');
    setTimeout(() => {
      button.classList.remove('button-clicked');
    }, 100);
  };

  // Buy upgrade
  const buyUpgrade = (upgradeId) => {
    const upgradeIndex = upgrades.findIndex(u => u.id === upgradeId);
    if (upgradeIndex === -1) return;
    
    const upgrade = upgrades[upgradeIndex];
    if (score >= upgrade.cost) {
      // Update score
      const newScore = score - upgrade.cost;
      setScore(newScore);
      
      // Update upgrades array
      const newUpgrades = [...upgrades];
      newUpgrades[upgradeIndex] = {
        ...upgrade,
        owned: upgrade.owned + 1,
        cost: Math.floor(upgrade.cost * 1.5) // Increase cost for next purchase
      };
      setUpgrades(newUpgrades);
      
      // Update click value
      setClickValue(prevValue => prevValue + upgrade.value);
      
      // Check for upgrade-related achievements
      const newAchievements = [...achievements];
      const achievementIndex = newAchievements.findIndex(a => a.upgradeId === upgradeId && !a.achieved);
      if (achievementIndex !== -1) {
        newAchievements[achievementIndex].achieved = true;
        setAchievements(newAchievements);
        setNewAchievement(newAchievements[achievementIndex].name);
        setTimeout(() => setNewAchievement(null), 3000);
      }
    }
  };

  // Buy auto-clicker
  const buyAutoClicker = (autoClickerId) => {
    const autoClickerIndex = autoClickers.findIndex(a => a.id === autoClickerId);
    if (autoClickerIndex === -1) return;
    
    const autoClicker = autoClickers[autoClickerIndex];
    if (score >= autoClicker.cost) {
      // Update score
      const newScore = score - autoClicker.cost;
      setScore(newScore);
      
      // Update autoClickers array
      const newAutoClickers = [...autoClickers];
      newAutoClickers[autoClickerIndex] = {
        ...autoClicker,
        owned: autoClicker.owned + 1,
        cost: Math.floor(autoClicker.cost * 1.5) // Increase cost for next purchase
      };
      setAutoClickers(newAutoClickers);
      
      // Update auto-click value
      setAutoClickValue(prevValue => +(prevValue + autoClicker.value).toFixed(1));
      
      // Check for auto-clicker-related achievements
      const newAchievements = [...achievements];
      const achievementIndex = newAchievements.findIndex(a => a.autoClickerId === autoClickerId && !a.achieved);
      if (achievementIndex !== -1) {
        newAchievements[achievementIndex].achieved = true;
        setAchievements(newAchievements);
        setNewAchievement(newAchievements[achievementIndex].name);
        setTimeout(() => setNewAchievement(null), 3000);
      }
    }
  };

  // Check for score-based achievements
  const checkAchievements = (currentScore) => {
    const newAchievements = [...achievements];
    let updated = false;
    
    newAchievements.forEach((achievement, index) => {
      if (!achievement.achieved && achievement.threshold && currentScore >= achievement.threshold) {
        newAchievements[index].achieved = true;
        updated = true;
        setNewAchievement(achievement.name);
        setTimeout(() => setNewAchievement(null), 3000);
      }
    });
    
    if (updated) {
      setAchievements(newAchievements);
    }
  };
  
  // Reset game
  const resetGame = () => {
    if (window.confirm('ゲームをリセットしますか？すべての進行状況が失われます。')) {
      localStorage.removeItem('clickerGame');
      window.location.reload();
    }
  };

  return (
    <div className="App">
      <h1>ミニクリッカーゲーム</h1>
      
      {/* Score section */}
      <div className="score-section">
        <p className="score">スコア: {Math.floor(score)}</p>
        <p className="click-value">クリック毎に: {clickValue} ポイント</p>
        <p className="auto-click">毎秒: {autoClickValue} ポイント</p>
        <button className="click-button" onClick={handleClick}>クリック！</button>
      </div>
      
      {/* Game sections container */}
      <div className="game-sections">
        {/* Upgrades section */}
        <div className="upgrades-section">
          <h2>アップグレード</h2>
          <div className="upgrades-list">
            {upgrades.map(upgrade => (
              <div key={upgrade.id} className="upgrade-item">
                <div className="upgrade-info">
                  <h3>{upgrade.name} ({upgrade.owned})</h3>
                  <p>{upgrade.description}</p>
                  <p>コスト: {upgrade.cost} ポイント</p>
                </div>
                <button 
                  onClick={() => buyUpgrade(upgrade.id)}
                  disabled={score < upgrade.cost}
                  className={score >= upgrade.cost ? 'can-buy' : 'cannot-buy'}
                >
                  購入
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Auto-clickers section */}
        <div className="auto-clickers-section">
          <h2>オートクリッカー</h2>
          <div className="auto-clickers-list">
            {autoClickers.map(autoClicker => (
              <div key={autoClicker.id} className="auto-clicker-item">
                <div className="auto-clicker-info">
                  <h3>{autoClicker.name} ({autoClicker.owned})</h3>
                  <p>{autoClicker.description}</p>
                  <p>コスト: {autoClicker.cost} ポイント</p>
                </div>
                <button 
                  onClick={() => buyAutoClicker(autoClicker.id)}
                  disabled={score < autoClicker.cost}
                  className={score >= autoClicker.cost ? 'can-buy' : 'cannot-buy'}
                >
                  購入
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Achievements section */}
      <div className="achievements-section">
        <h2>実績</h2>
        <div className="achievements-list">
          {achievements.map(achievement => (
            <div 
              key={achievement.id} 
              className={`achievement-item ${achievement.achieved ? 'achieved' : 'not-achieved'}`}
            >
              <h3>{achievement.name}</h3>
              <p>{achievement.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* New achievement notification */}
      {newAchievement && (
        <div className="achievement-notification">
          <p>実績解除：{newAchievement}</p>
        </div>
      )}
      
      {/* Footer with save info and reset button */}
      <div className="game-footer">
        {lastSaved && <p>最終保存: {lastSaved}</p>}
        <button className="reset-button" onClick={resetGame}>ゲームリセット</button>
      </div>
    </div>
  );
}

export default App;
