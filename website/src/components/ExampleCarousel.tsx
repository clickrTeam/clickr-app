import { motion } from "framer-motion";
import { CodeBlock } from "./CodeBlock";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Example {
  title: string;
  code: string;
}

interface ExampleCarouselProps {
  examples: Example[];
}

const ScrollableExample = ({ example, idx }: { example: Example; idx: number }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const [showArrow, setShowArrow] = useState(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateScrollState = () => {
      const hasScroll = container.scrollHeight > container.clientHeight;
      setIsScrollable(hasScroll);
      if (hasScroll) {
        const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 10;
        setShowArrow(!isAtBottom);
      } else {
        setShowArrow(false);
      }
    };

    updateScrollState();
    container.addEventListener('scroll', updateScrollState);
    
    // Check on resize
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(container);
    
    return () => {
      container.removeEventListener('scroll', updateScrollState);
      resizeObserver.disconnect();
    };
  }, [example.code]);

  return (
    <div className="flex-shrink-0 w-[650px] max-w-[650px] h-[350px] p-1 flex flex-col relative">
      <h3 className="text-xl font-semibold mb-2 text-center whitespace-nowrap flex-shrink-0">{example.title}</h3>
      <div 
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-2"
      >
        <CodeBlock code={example.code} />
      </div>
      {showArrow && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 pointer-events-none">
          <ChevronDown className="h-5 w-5 text-gray-400 animate-bounce" />
        </div>
      )}
    </div>
  );
};

export const ExampleCarousel = ({ examples }: ExampleCarouselProps) => {
  const transition = {
    duration: 120,
    ease: "linear",
    repeat: Infinity,
    repeatType: "loop" as const,
  };

  return (
    <div className="relative h-[350px] overflow-hidden w-full">
      <motion.div
        className="flex absolute top-0 gap-6"
        animate={{
          x: ["0%", "-50%"],
        }}
        initial={{ x: 0 }}
        transition={transition}
      >
        {[...examples, ...examples].map((example, idx) => (
          <ScrollableExample key={`${example.title}-${idx}`} example={example} idx={idx} />
        ))}
      </motion.div>
    </div>
  );
};
