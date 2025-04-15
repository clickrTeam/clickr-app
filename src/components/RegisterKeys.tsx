import KeyboardKey from "./KeyboardKey";

interface RegisterKeysProps {
  className?: string;
}

const RegisterKeys: React.FC<RegisterKeysProps> = ({ className }) => {
  // These keys will spell "REGISTER"
  const keys = [
    { letter: "R", color: "blue", x: -250, y: -40, delay: 0, duration: 18 },
    { letter: "E", color: "green", x: -150, y: -60, delay: 0.3, duration: 17 },
    { letter: "G", color: "yellow", x: -80, y: -40, delay: 0.6, duration: 16 },
    { letter: "I", color: "red", x: -40, y: -60, delay: 0.9, duration: 19 },
    { letter: "S", color: "purple", x: 0, y: -40, delay: 1.2, duration: 18 },
    { letter: "T", color: "orange", x: 40, y: -60, delay: 1.5, duration: 17 },
    { letter: "E", color: "blue", x: 80, y: -40, delay: 1.8, duration: 16 },
    { letter: "R", color: "green", x: 120, y: -60, delay: 2.1, duration: 19 },
  ];

  return (
    <div className={className}>
      <div className="flex justify-center">
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
    </div>
  );
};

export default RegisterKeys;
