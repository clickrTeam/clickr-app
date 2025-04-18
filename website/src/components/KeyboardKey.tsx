import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface KeyboardKeyProps {
  letter: string;
  color: string;
  className?: string;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
}

const keyColors = {
  red: "border-clickr-red text-clickr-red",
  blue: "border-clickr-blue text-clickr-blue",
  green: "border-clickr-green text-clickr-green",
  yellow: "border-clickr-yellow text-clickr-yellow",
  purple: "border-clickr-purple text-clickr-purple",
  orange: "border-clickr-orange text-clickr-orange",
};

const KeyboardKey: React.FC<KeyboardKeyProps> = ({
  letter,
  color,
  className,
  delay = 0,
  duration = 20,
  x = 100,
  y = 100,
}) => {
  return (
    <motion.div
      className={cn(
        "absolute w-12 h-12 flex items-center justify-center rounded-md border-2 bg-white/20 backdrop-blur-sm shadow-md select-none",
        "left-1/2 top-0 mt-40",
        keyColors[color as keyof typeof keyColors],
        className
      )}
      initial={{ opacity: 0, y: -100 }}
      animate={{
        opacity: [0.4, 0.8, 0.4],
        x: [-100, x / 2, x, x / 2, x / 2], //Modify first item to change where thye keys come in from
        y: [-300, y / 2, y, y / 2, y / 2],
        rotate: [0, 15, -15, 10, 0],
        scale: [1, 1.1, 1, 0.9, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      }}
    >
      <span className="font-mono font-bold text-lg">{letter}</span>
    </motion.div>
  );
};

export default KeyboardKey;
