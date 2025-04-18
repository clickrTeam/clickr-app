
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";
import DownloadSection from "@/components/DownloadSection";
import { motion } from 'framer-motion';

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <HowItWorks />
      <DownloadSection />
      
      <motion.footer
        className="bg-slate-100 py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} Clickr. All rights reserved.
          </p>
        </div>
      </motion.footer>
    </div>
  );
};

export default Index;
