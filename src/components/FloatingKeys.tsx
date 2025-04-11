import KeyboardKey from "./KeyboardKey";

interface FloatingKeysProps {
  className?: string;
}

const FloatingKeys: React.FC<FloatingKeysProps> = ({ className }) => {
  const keys = [
    { letter: "A", color: "orange", x: 80, y: -40, delay: 0, duration: 15 },
    { letter: "Z", color: "green", x: 50, y: 80, delay: 2, duration: 17 },
    { letter: "W", color: "blue", x: -70, y: -50, delay: 3.5, duration: 20 },
    { letter: "X", color: "red", x: -50, y: -100, delay: 1, duration: 19 },
    { letter: "S", color: "green", x: -150, y: 50, delay: 4, duration: 18 },
    { letter: "K", color: "green", x: 150, y: 30, delay: 2.5, duration: 16 },
    { letter: "R", color: "blue", x: 130, y: -80, delay: 1.5, duration: 18 },
    { letter: "Y", color: "yellow", x: -120, y: 70, delay: 0.5, duration: 15 },
    { letter: "F", color: "red", x: -180, y: -30, delay: 3, duration: 20 },
    { letter: "T", color: "blue", x: 180, y: 80, delay: 2, duration: 19 },
    { letter: "=", color: "red", x: -130, y: -70, delay: 4.5, duration: 17 },
    { letter: "Q", color: "purple", x: 100, y: 120, delay: 1, duration: 16 },
    { letter: "~", color: "blue", x: 140, y: 60, delay: 3.2, duration: 15 },
    { letter: "+", color: "red", x: 60, y: 80, delay: 4.8, duration: 18 },
    { letter: "H", color: "red", x: 40, y: 150, delay: 2.2, duration: 17 },
    { letter: "N", color: "yellow", x: -40, y: 100, delay: 1.7, duration: 19 },
    { letter: "E", color: "blue", x: -80, y: 130, delay: 3.8, duration: 16 },
    {
      letter: "ctrl",
      color: "orange",
      x: -60,
      y: -120,
      delay: 2.8,
      duration: 20,
    },
    { letter: "alt", color: "green", x: 20, y: -130, delay: 0.8, duration: 17 },
    { letter: "O", color: "blue", x: -30, y: -90, delay: 4.2, duration: 18 },
    { letter: "D", color: "purple", x: 10, y: 90, delay: 3.5, duration: 19 },
    { letter: "U", color: "orange", x: -180, y: -90, delay: 1.2, duration: 16 },
    { letter: "?", color: "blue", x: -10, y: -150, delay: 2.5, duration: 15 },
    { letter: "M", color: "green", x: 80, y: 100, delay: 4, duration: 17 },
    { letter: "5", color: "yellow", x: 130, y: -40, delay: 0.3, duration: 19 },
    { letter: "P", color: "purple", x: 300, y: 360, delay: 1.8, duration: 17 },
    {
      letter: "M",
      color: "orange",
      x: -300,
      y: -360,
      delay: 2.2,
      duration: 18,
    },
    { letter: "\\", color: "blue", x: 480, y: -180, delay: 3.2, duration: 16 },
    { letter: "?", color: "green", x: -480, y: 180, delay: 1.2, duration: 19 },
    { letter: "<>", color: "red", x: 420, y: 300, delay: 2.8, duration: 17 },
    {
      letter: "L",
      color: "yellow",
      x: -420,
      y: -300,
      delay: 3.5,
      duration: 18,
    },
    {
      letter: "{}",
      color: "purple",
      x: 360,
      y: -330,
      delay: 1.5,
      duration: 20,
    },
    { letter: "-", color: "orange", x: -360, y: 330, delay: 2.7, duration: 16 },
    { letter: "$", color: "blue", x: 270, y: 270, delay: 3.8, duration: 19 },
    { letter: "^", color: "green", x: -270, y: -270, delay: 1.7, duration: 17 },
  ];

  return (
    <div className={className}>
      {keys.map((key, index) => (
        <KeyboardKey
          key={index}
          letter={key.letter}
          color={key.color}
          delay={key.delay}
          duration={key.duration}
          x={key.x}
          y={key.y}
        />
      ))}
    </div>
  );
};

export default FloatingKeys;
