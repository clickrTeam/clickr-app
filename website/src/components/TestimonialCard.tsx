import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
const gradientColors = [
  "bg-gradient-to-br from-purple-300/90 to-fuchsia-400/90",
  "bg-gradient-to-br from-blue-400 to-blue-200",
  "bg-gradient-to-br from-pink-600 to-rose-400",
  "bg-gradient-to-br from-green-300 to-teal-600",
  "bg-gradient-to-br from-clickr-yellow to-orange-300",
  "bg-gradient-to-br from-clickr-blue to-green-200",
] as const;

interface TestimonialCardProps {
  name: string;
  role: string;
  avatarUrl: string;
  handle: string;
  review?: string;
  index: number;
}

const TestimonialCard = ({
  name,
  role,
  avatarUrl,
  handle,
  review,
  index,
}: TestimonialCardProps) => {
  const colorClass = gradientColors[index % gradientColors.length];
  return (
    <motion.div
      className={`${colorClass} backdrop-blur-md border border-white/10 rounded-xl p-6 w-[400px] mx-2 shadow-lg`}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
    >
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="h-12 w-12 ring-2 ring-gray-400 ">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{name}</span>
          <span className="text-sm text-foreground">{role}</span>
          <span className="text-sm text-foreground">{handle}</span>
        </div>
      </div>
      {review && <p className="text-sm text-foreground italic">"{review}"</p>}
    </motion.div>
  );
};

export default TestimonialCard;
