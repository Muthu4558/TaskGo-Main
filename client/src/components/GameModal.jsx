import React, { useEffect, useRef, useState } from "react";

const createBubble = (speedMultiplier = 1) => ({
  id: Date.now() + Math.random(),
  x: Math.random() * 90,
  y: 0,
  size: Math.random() * 30 + 30,
  speed: (Math.random() * 0.5 + 0.5) * speedMultiplier,
  color: `hsl(${Math.random() * 360}, 70%, 75%)`,
});

const playPleasantNote = (frequency = 261.63) => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1000, ctx.currentTime);

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.4);
};

// Updated function to start and control background music with cleanup
const useBackgroundMusic = (play) => {
  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainRef = useRef(null);

  useEffect(() => {
    if (play) {
      // Start music
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtxRef.current;

      oscillatorRef.current = ctx.createOscillator();
      gainRef.current = ctx.createGain();

      oscillatorRef.current.type = "sine";
      oscillatorRef.current.frequency.setValueAtTime(220, ctx.currentTime); // A3 note
      gainRef.current.gain.setValueAtTime(0.03, ctx.currentTime); // very soft volume

      oscillatorRef.current.connect(gainRef.current);
      gainRef.current.connect(ctx.destination);

      oscillatorRef.current.start();

      // Looping effect workaround
      // You can improve this with Web Audio API advanced scheduling

    } else {
      // Stop music and cleanup
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      if (gainRef.current) {
        gainRef.current.disconnect();
        gainRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    }

    return () => {
      // Cleanup on component unmount or if play changes
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      if (gainRef.current) {
        gainRef.current.disconnect();
        gainRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, [play]);
};

const notes = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88]; // C D E F G A B

const BubblePopGame = ({ onClose }) => {
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [bgMusicOn, setBgMusicOn] = useState(false);

  const speedMultiplier = useRef(1);
  const animationRef = useRef();
  const frameCount = useRef(0);
  const noteIndex = useRef(0);

  useBackgroundMusic(bgMusicOn && started && !gameOver); // play music only if game running and bgMusicOn

  const popBubble = (id) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    setScore((s) => s + 1);
    playPleasantNote(notes[noteIndex.current % notes.length]);
    noteIndex.current++;
  };

  const startGame = () => {
    setStarted(true);
    setGameOver(false);
    setScore(0);
    setBubbles([]);
    speedMultiplier.current = 1;
    frameCount.current = 0;
    noteIndex.current = 0;

    animationRef.current = requestAnimationFrame(gameLoop);
  };

  const gameLoop = () => {
    frameCount.current++;

    if (frameCount.current % 50 === 0) {
      setBubbles((prev) => [...prev, createBubble(speedMultiplier.current)]);
    }

    setBubbles((prev) => {
      const moved = prev.map((b) => ({ ...b, y: b.y + b.speed }));
      const anyAtTop = moved.some((b) => b.y >= 450);
      if (anyAtTop) {
        setGameOver(true);
        cancelAnimationFrame(animationRef.current);
        return [];
      }
      return moved;
    });

    if (frameCount.current % 500 === 0) {
      speedMultiplier.current += 0.1;
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#e0f7fa] to-[#fce4ec] z-50 flex flex-col items-center justify-center p-4">
      <button
        onClick={() => {
          cancelAnimationFrame(animationRef.current);
          onClose();
        }}
        className="absolute top-4 right-4 text-white bg-[#e91e63] px-3 py-1 rounded-md shadow-md"
      >
        ✖ Close
      </button>

      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-[#006064] mb-2">🎵 Bubble Pop Game</h2>
        {!started ? (
          <button
            onClick={startGame}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg shadow-md"
          >
            Start Game
          </button>
        ) : gameOver ? (
          <button
            onClick={startGame}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg shadow-md"
          >
            Restart Game
          </button>
        ) : null}
        <div className="mt-2">
          <label className="text-sm mr-2">🎶 Background Music:</label>
          <input
            type="checkbox"
            checked={bgMusicOn}
            onChange={() => setBgMusicOn((prev) => !prev)}
          />
        </div>
        <p className="mt-2 text-gray-700 text-lg">Score: {score}</p>
        {gameOver && <p className="text-red-500 text-xl font-semibold mt-2">Game Over 💔</p>}
      </div>

      {started && !gameOver && (
        <div className="relative w-[320px] h-[500px] bg-white rounded-xl shadow-inner overflow-hidden">
          {bubbles.map((b) => (
            <div
              key={b.id}
              onClick={() => popBubble(b.id)}
              className="absolute rounded-full transition-transform duration-150 ease-out hover:scale-125 cursor-pointer"
              style={{
                left: `${b.x}%`,
                top: `${b.y}px`,
                width: `${b.size}px`,
                height: `${b.size}px`,
                backgroundColor: b.color,
                boxShadow: `0 0 10px ${b.color}`,
                opacity: 0.9,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BubblePopGame;
