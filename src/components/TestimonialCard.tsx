import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface TestimonialCardProps {
  name: string;
  role: string;
  avatarUrl: string;
  handle: string;
  review?: string;
  colorClass: string;
}

const TestimonialCard = ({
  name,
  role,
  avatarUrl,
  handle,
  review,
  colorClass,
}: TestimonialCardProps) => {
  return (
    <motion.div
      className={`${colorClass} backdrop-blur-md border border-white/10 rounded-xl p-6 w-[400px] mx-2 shadow-lg`}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
    >
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{name}</span>
          <span className="text-sm text-muted-foreground">{role}</span>
          <span className="text-sm text-muted-foreground">{handle}</span>
        </div>
      </div>
      {review && (
        <p className="text-sm text-muted-foreground italic">"{review}"</p>
      )}
    </motion.div>
  );
};

export default TestimonialCard;
