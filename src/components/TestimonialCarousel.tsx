import { motion } from "framer-motion";
import { useEffect } from "react";
import TestimonialCard from "./TestimonialCard";

const testimonials = [
  {
    name: "Koen Bok",
    role: "Founder, Framer",
    handle: "@koenbok",
    avatarUrl: "/placeholder.svg",
    colorClass: "bg-gradient-to-br from-purple-900/90 to-purple-800/90",
  },
  {
    name: "Sarah Chen",
    role: "Senior Developer",
    handle: "@sarahc",
    avatarUrl: "/placeholder.svg",
    review:
      "Clickr has completely transformed how I handle keyboard shortcuts. It's intuitive and powerful.",
    colorClass: "bg-gradient-to-br from-blue-900/90 to-blue-800/90",
  },
  {
    name: "Andreas Storm",
    role: "Designer & Iconograph",
    handle: "@avstorm",
    avatarUrl: "/placeholder.svg",
    colorClass: "bg-gradient-to-br from-pink-900/90 to-pink-800/90",
  },
  {
    name: "Emma Thompson",
    role: "Product Manager",
    handle: "@emmaprod",
    avatarUrl: "/placeholder.svg",
    review:
      "The best investment I've made for my productivity workflow this year!",
    colorClass: "bg-gradient-to-br from-green-900/90 to-green-800/90",
  },
  {
    name: "Adam Wathan",
    role: "Creator, Tailwind CSS",
    handle: "@adamwathan",
    avatarUrl: "/placeholder.svg",
    colorClass: "bg-gradient-to-br from-yellow-900/90 to-yellow-800/90",
  },
  {
    name: "Mike Rivers",
    role: "UX Designer",
    handle: "@mikerivers",
    avatarUrl: "/placeholder.svg",
    review:
      "Game-changing tool for my design workflow. The customization options are endless!",
    colorClass: "bg-gradient-to-br from-orange-900/90 to-orange-800/90",
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
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
