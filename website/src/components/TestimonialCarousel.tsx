import { motion } from "framer-motion";
import { useEffect } from "react";
import TestimonialCard from "./TestimonialCard";

const testimonials = [
  {
    name: "Koen Bok",
    role: "Founder, Framer",
    handle: "@koenbok",
    avatarUrl: "/placeholder.svg",
  },
  {
    name: "Sarah Chen",
    role: "Senior Developer",
    handle: "@sarahc",
    avatarUrl: "/placeholder.svg",
    review:
      "Clickr has completely transformed how I handle keyboard shortcuts. It's intuitive and powerful.",
  },
  {
    name: "Andreas Storm",
    role: "Designer & Iconograph",
    handle: "@avstorm",
    avatarUrl: "/placeholder.svg",
  },
  {
    name: "Emma Thompson",
    role: "Product Manager",
    handle: "@emmaprod",
    avatarUrl: "/placeholder.svg",
    review:
      "The best investment I've made for my productivity workflow this year!",
  },
  {
    name: "Adam Wathan",
    role: "Creator, Tailwind CSS",
    handle: "@adamwathan",
    avatarUrl: "/placeholder.svg",
  },
  {
    name: "Mike Rivers",
    role: "UX Designer",
    handle: "@mikerivers",
    avatarUrl: "/placeholder.svg",
    review:
      "Game-changing tool for my design workflow. The customization options are endless!",
  },
];

const TestimonialsCarousel = () => {
  const transition = {
    duration: 150,
    ease: "linear",
    repeat: Infinity,
    repeatType: "loop" as const,
  };

  return (
    <section className="py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-4 text-center mb-20">
        <h2 className="text-4xl font-bold text-gradient mb-4">
          Built for professionals like you
        </h2>
        <p className="text-xl text-muted-foreground">
          Join thousands of satisfied users worldwide
        </p>
      </div>

      <div className="relative h-[800px]">
        <motion.div
          className="flex absolute top-0"
          animate={{
            x: [-2400, 0],
          }}
          initial={{ x: 0 }}
          transition={transition}
        >
          {[...testimonials, ...testimonials].map((testimonial, idx) => (
            <TestimonialCard
              key={`${testimonial.handle}-1-${idx}`}
              {...testimonial}
              index={idx}
            />
          ))}
        </motion.div>

        <motion.div
          className="flex absolute top-[12.5rem]"
          animate={{
            x: ["0%", "-50%"],
          }}
          initial={{ x: 0 }}
          transition={transition}
        >
          {[
            ...testimonials.slice().reverse(),
            ...testimonials.slice().reverse(),
          ].map((testimonial, idx) => (
            <TestimonialCard
              key={`${testimonial.handle}-2-${idx}`}
              {...testimonial}
              index={idx}
            />
          ))}
        </motion.div>

        <motion.div
          className="flex absolute top-[25rem]"
          animate={{
            x: ["-50%", "0%"],
          }}
          initial={{ x: 0 }}
          transition={transition}
        >
          {[...testimonials, ...testimonials].map((testimonial, idx) => (
            <TestimonialCard
              key={`${testimonial.handle}-3-${idx}`}
              {...testimonial}
              index={idx}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
