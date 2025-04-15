import KeyboardKey from "./KeyboardKey";

interface LoginKeysProps {
  className?: string;
}

const LoginKeys: React.FC<LoginKeysProps> = ({ className }) => {
  // These keys will spell "LOGIN"
  const keys = [
    { letter: "L", color: "blue", x: -120, y: -40, delay: 0, duration: 18 },
    { letter: "O", color: "green", x: -60, y: -60, delay: 0.5, duration: 17 },
    { letter: "G", color: "yellow", x: 0, y: -40, delay: 1, duration: 16 },
    { letter: "I", color: "red", x: 60, y: -60, delay: 1.5, duration: 19 },
    { letter: "N", color: "purple", x: 120, y: -40, delay: 2, duration: 18 },
  ];

  return (
    <div className={className}>
      <div className="flex justify-center mt-20">
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

export default LoginKeys;
