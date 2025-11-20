import { motion } from "framer-motion";
import { CodeBlock } from "./CodeBlock";

interface Example {
  title: string;
  code: string;
}

interface ExampleCarouselProps {
  examples: Example[];
}

export const ExampleCarousel = ({ examples }: ExampleCarouselProps) => {
  const transition = {
    duration: 120,
    ease: "linear",
    repeat: Infinity,
    repeatType: "loop" as const,
  };

  return (
    <div className="relative h-[350px] overflow-hidden">
      <motion.div
        className="flex absolute top-0 gap-6"
        animate={{
          x: ["0%", "-100%"],
        }}
        initial={{ x: 0 }}
        transition={transition}
      >
        {[...examples, ...examples].map((example, idx) => (
          <div
            key={`${example.title}-${idx}`}
            className="flex-shrink-0 w-[400px] h-[350px] p-1"
          >
            <h3 className="text-xl font-semibold mb-2 text-center">{example.title}</h3>
            <CodeBlock code={example.code} />
          </div>
        ))}
      </motion.div>
    </div>
  );
};
