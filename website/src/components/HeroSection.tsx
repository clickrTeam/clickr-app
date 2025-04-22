import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import FloatingKeys from "./FloatingKeys";

const HeroSection = () => {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden
                bg-gradient-to-tr from-clickr-blue/50 to-clickr-light-blue/10"
    >
      {/* Background with floating keys */}
      <FloatingKeys className="absolute inset-0 z-0" />

      {/* Main content */}
      <div className="container mx-auto px-4 z-10">
        <motion.div
          className="relative backdrop-blur-[5px] bg-white/15 border border-white/20 rounded-xl shadow-xl 
             max-w-3xl mx-auto p-12 text-center
             before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-white/10 
             before:rounded-xl before:-z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 text-gradient"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            CLICKR
          </motion.h1>

          <motion.p
            className="text-xl sm:text-2xl mb-8 text-foreground/80"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Rebinding made Simple
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button size="lg" asChild>
              <Link to="/get-started">Join the Waitlist!</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
