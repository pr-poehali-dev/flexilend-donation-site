import { useEffect, useState } from 'react';

interface Block {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  rotation: number;
  emoji: string;
}

const MinecraftBackground = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  const blockEmojis = ['🟫', '🟩', '⬛', '🟦', '🟧', '🟥'];

  useEffect(() => {
    const initialBlocks: Block[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * -100,
      size: 20 + Math.random() * 40,
      speed: 0.5 + Math.random() * 1.5,
      rotation: Math.random() * 360,
      emoji: blockEmojis[Math.floor(Math.random() * blockEmojis.length)]
    }));
    setBlocks(initialBlocks);

    const interval = setInterval(() => {
      setBlocks(prevBlocks =>
        prevBlocks.map(block => {
          let newY = block.y + block.speed;
          if (newY > 110) {
            newY = -10;
            return {
              ...block,
              y: newY,
              x: Math.random() * 100,
              emoji: blockEmojis[Math.floor(Math.random() * blockEmojis.length)]
            };
          }
          return { ...block, y: newY, rotation: block.rotation + 0.5 };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20 z-0">
      {blocks.map(block => (
        <div
          key={block.id}
          className="absolute pixelated transition-transform duration-75"
          style={{
            left: `${block.x}%`,
            top: `${block.y}%`,
            fontSize: `${block.size}px`,
            transform: `rotate(${block.rotation}deg)`,
            filter: 'blur(1px)',
          }}
        >
          {block.emoji}
        </div>
      ))}
    </div>
  );
};

export default MinecraftBackground;
