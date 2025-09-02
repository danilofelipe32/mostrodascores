import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';

// --- Data ---
const emotionsData = [
  { id: 'alegria', name: 'Alegria', color: '#fdd835', emoji: '😊', colorName: 'Amarelo' },
  { id: 'tristeza', name: 'Tristeza', color: '#1e88e5', emoji: '😢', colorName: 'Azul' },
  { id: 'raiva', name: 'Raiva', color: '#e53935', emoji: '😠', colorName: 'Vermelho' },
  { id: 'medo', name: 'Medo', color: '#546e7a', emoji: '😨', colorName: 'Cinza' },
  { id: 'calma', name: 'Calma', color: '#43a047', emoji: '😌', colorName: 'Verde' },
  { id: 'amor', name: 'Amor', color: '#f06292', emoji: '🥰', colorName: 'Rosa' },
];

const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

// --- Components ---

const Monster = ({ emoji, animationClass }) => (
  <div
    className={animationClass}
    style={{
      fontSize: 'clamp(120px, 30vw, 150px)',
      lineHeight: 1,
      width: '250px',
      height: '250px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.3s ease-in-out',
      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
    }}
    aria-label="Monstro das Cores"
    role="img"
  >
    {emoji}
  </div>
);

const Tutorial = ({ onStart }) => (
  <div style={styles.tutorialOverlay}>
    <div style={styles.tutorialBox}>
      <h2 style={styles.tutorialTitle}>Como Jogar</h2>
      <p style={styles.tutorialText}>
        O Monstro das Cores está com os sentimentos todos misturados! Ajude-o a entender o que ele está sentindo.
      </p>
      <p style={styles.tutorialText}>
        Leia a emoção que o monstro quer sentir. Depois, clique no pote com a cor certa para ajudá-lo!
      </p>
      <button className="restart-button" onClick={onStart}>Começar!</button>
    </div>
  </div>
);

const StyledEmotionJar = ({ emotion, onClick, disabled, isWrong }) => (
    <button
      onClick={() => onClick(emotion)}
      disabled={disabled}
      className={`jar-button ${isWrong ? 'shake-animation' : ''}`}
      aria-label={`Pote da cor: ${emotion.colorName}`}
    >
      <div className="jar-tooltip">{emotion.colorName}</div>
      <div className="jar-lid"></div>
      {/* Fix: Cast style object to React.CSSProperties to allow for custom CSS properties. */}
      <div className="jar-body" style={{ '--jar-color': emotion.color } as React.CSSProperties}></div>
    </button>
);


// --- Main App ---
const App = () => {
    const [emotions, setEmotions] = useState([]);
    const [currentEmotionIndex, setCurrentEmotionIndex] = useState(0);
    const [monsterEmoji, setMonsterEmoji] = useState('😕');
    const [monsterAnimation, setMonsterAnimation] = useState('');
    const [feedback, setFeedback] = useState('');
    const [wrongSelection, setWrongSelection] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [showTutorial, setShowTutorial] = useState(true);
  
    const currentEmotion = useMemo(() => emotions[currentEmotionIndex], [emotions, currentEmotionIndex]);
  
    const startGame = () => {
      const shuffled = shuffleArray(emotionsData);
      setEmotions(shuffled);
      setCurrentEmotionIndex(0);
      setMonsterEmoji('😕');
      setMonsterAnimation('');
      setFeedback('');
      setWrongSelection(null);
      setGameOver(false);
    };
  
    const handleStartGame = () => {
      setShowTutorial(false);
      startGame();
    };
  
    const handleJarClick = (selectedEmotion) => {
      if (feedback) return; // Prevent multiple clicks
      
      if (selectedEmotion.id === currentEmotion.id) {
        setMonsterEmoji(selectedEmotion.emoji);
        setMonsterAnimation(`monster-${selectedEmotion.id}`);
        setFeedback('Isso! O monstro está sentindo...');
        setWrongSelection(null);
  
        setTimeout(() => {
          if (currentEmotionIndex < emotions.length - 1) {
            setCurrentEmotionIndex(currentEmotionIndex + 1);
            setMonsterEmoji('😕');
            setMonsterAnimation('');
            setFeedback('');
          } else {
            setGameOver(true);
            setFeedback('Parabéns! Você organizou todas as emoções!');
          }
        }, 2500);
      } else {
        setFeedback('Ops, tente outra cor!');
        setWrongSelection(selectedEmotion.id);
        setTimeout(() => {
          setWrongSelection(null);
          setFeedback('');
        }, 1000);
      }
    };
  
    if (showTutorial) {
      return <Tutorial onStart={handleStartGame} />;
    }
    
    if (emotions.length === 0) {
      // Small delay before showing loading to prevent flash on fast loads
      setTimeout(startGame, 100);
      return <div style={styles.container}>Carregando...</div>;
    }
    
    const isFeedbackActive = !!feedback;
    const isWrong = !!wrongSelection;
    const instructionColor = isWrong ? '#e53935' : (isFeedbackActive ? currentEmotion?.color : '#37474f');
  
    return (
      <main style={styles.container}>
        <h1 style={styles.title}>O Monstro das Cores</h1>
        <div style={styles.gameArea} className="game-area-layout">
          <div style={styles.monsterContainer} className="monster-container-layout">
            <Monster emoji={monsterEmoji} animationClass={monsterAnimation} />
          </div>
          
          <div className="interaction-area-layout">
            {gameOver ? (
              <div style={styles.endGameContainer}>
                <p style={styles.endGameText}>{feedback}</p>
                <button className="restart-button" onClick={startGame}>Jogar Novamente</button>
              </div>
            ) : (
              <>
                <p style={styles.instructionText}>
                  {feedback || 'Ajude o monstro a descobrir o que ele sente. Ele quer sentir...'}
                  <strong style={{ color: instructionColor }}>
                    {isFeedbackActive && !isWrong ? ` ${currentEmotion.name}!` : !isFeedbackActive ? ` ${currentEmotion.name}` : ''}
                  </strong>
                </p>
    
                <div style={styles.jarsContainer}>
                  {emotionsData.map((emotion) => (
                    <StyledEmotionJar
                      key={emotion.id}
                      emotion={emotion}
                      onClick={handleJarClick}
                      disabled={isFeedbackActive && !isWrong}
                      isWrong={wrongSelection === emotion.id}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    );
};

// --- Styles ---

const styles = {
  container: {
    fontFamily: "'Nunito', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #e0f7fa 0%, #f3e5f5 100%)',
    color: '#37474f',
    textAlign: 'center',
    padding: '20px',
    boxSizing: 'border-box',
  } as React.CSSProperties,
  title: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    color: '#263238',
    marginBottom: '20px',
    textShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  gameArea: {
    padding: '30px',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '800px',
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  },
  monsterContainer: {
    minHeight: '250px',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  } as React.CSSProperties,
  instructionText: {
    fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
    margin: '0 0 25px 0',
    minHeight: '50px',
    fontWeight: '400',
  },
  jarsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '20px',
  } as React.CSSProperties,
  endGameContainer: {
    padding: '20px 0',
  },
  endGameText: {
    fontSize: '1.5rem',
    color: '#43a047',
    marginBottom: '20px',
  },
  tutorialOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(5px)',
  } as React.CSSProperties,
  tutorialBox: {
    background: 'white',
    padding: '30px 40px',
    borderRadius: '20px',
    textAlign: 'center',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    border: '2px solid #eee',
  } as React.CSSProperties,
  tutorialTitle: {
    fontSize: 'clamp(1.8rem, 4vw, 2.2rem)',
    color: '#263238',
    marginBottom: '15px',
  } as React.CSSProperties,
  tutorialText: {
    fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
    lineHeight: 1.6,
    marginBottom: '20px',
    color: '#37474f',
  } as React.CSSProperties,
};

// --- CSS-in-JS pseudo-element solution ---
const sheet = document.createElement('style');
sheet.innerHTML = `
  .restart-button {
    font-family: 'Nunito', sans-serif;
    font-size: 1.2rem;
    padding: 12px 25px;
    cursor: pointer;
    border: none;
    border-radius: 50px;
    background: linear-gradient(45deg, #2196F3, #673AB7);
    color: white;
    font-weight: bold;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
  }
  .restart-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.25);
  }

  /* Layout */
  .game-area-layout {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  @media (min-width: 768px) {
    .game-area-layout {
      flex-direction: row;
      align-items: center;
      padding: 40px;
      gap: 40px;
    }
    .monster-container-layout {
      flex: 0 0 250px;
    }
    .interaction-area-layout {
      flex: 1;
      min-height: 250px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
  .shake-animation {
    animation: shake 0.5s ease-in-out;
  }
  .jar-button {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    position: relative;
    width: 60px;
    height: 80px;
    transition: transform 0.2s ease;
  }
  .jar-button:hover:not(:disabled) {
    transform: scale(1.1) translateY(-5px);
  }
  .jar-button:disabled {
    cursor: default;
    opacity: 0.5;
  }
  .jar-tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(10px);
    background-color: #37474f;
    color: white;
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 0.9rem;
    font-family: 'Nunito', sans-serif;
    font-weight: bold;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease, transform 0.2s ease;
    z-index: 10;
    margin-bottom: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }
  .jar-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #37474f transparent transparent transparent;
  }
  .jar-button:hover:not(:disabled) .jar-tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
  }
  .jar-lid {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 10px;
    background-color: #6d4c41;
    border-radius: 5px 5px 0 0;
    z-index: 2;
    border: 1px solid rgba(0,0,0,0.1);
  }
  .jar-body {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 70px;
    background-color: var(--jar-color);
    border: 5px solid #8d6e63;
    box-sizing: border-box;
    border-radius: 0 0 25px 25px;
    overflow: hidden;
    transition: background-color 0.3s;
  }
  .jar-body::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: linear-gradient(to top, rgba(0,0,0,0.15), transparent 50%);
    border-radius: 0 0 20px 20px;
  }

  /* Monster Animations */
  @keyframes glow-joy {
    0%, 100% { filter: drop-shadow(0 0 5px #fdd835); transform: scale(1); }
    50% { filter: drop-shadow(0 0 20px #fdd835); transform: scale(1.05); }
  }
  .monster-alegria { animation: glow-joy 2s infinite ease-in-out; }

  @keyframes wave-sadness {
    0%, 100% { transform: translateY(0) skewY(0deg); }
    50% { transform: translateY(5px) skewY(2deg); }
  }
  .monster-tristeza { animation: wave-sadness 3s infinite ease-in-out; }

  @keyframes shake-anger {
    0% { transform: translate(1px, 1px) rotate(0deg); }
    10% { transform: translate(-1px, -2px) rotate(-1deg); }
    20% { transform: translate(-3px, 0px) rotate(1deg); }
    30% { transform: translate(3px, 2px) rotate(0deg); }
    40% { transform: translate(1px, -1px) rotate(1deg); }
    50% { transform: translate(-1px, 2px) rotate(-1deg); }
    60% { transform: translate(-3px, 1px) rotate(0deg); }
    70% { transform: translate(3px, 1px) rotate(-1deg); }
    80% { transform: translate(-1px, -1px) rotate(1deg); }
    90% { transform: translate(1px, 2px) rotate(0deg); }
    100% { transform: translate(1px, -2px) rotate(-1deg); }
  }
  .monster-raiva { animation: shake-anger 0.5s infinite; }

  @keyframes tremble-fear {
    0% { transform: translateX(0); }
    25% { transform: translateX(-2px); }
    50% { transform: translateX(2px); }
    75% { transform: translateX(-2px); }
    100% { transform: translateX(0); }
  }
  .monster-medo { animation: tremble-fear 0.2s infinite; }

  @keyframes breathe-calm {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.03); }
  }
  .monster-calma { animation: breathe-calm 4s infinite ease-in-out; }

  @keyframes heartbeat-love {
    0% { transform: scale(1); }
    10% { transform: scale(1.08); }
    20% { transform: scale(1); }
    30% { transform: scale(1.08); }
    40% { transform: scale(1); }
    100% { transform: scale(1); }
  }
  .monster-amor { animation: heartbeat-love 2.5s infinite ease-out; }
`;
document.head.appendChild(sheet);


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);