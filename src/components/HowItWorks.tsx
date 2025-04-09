import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ArrowRightCircle, Cloud, Globe, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

const FeatureCard = ({
  icon,
  title,
  description,
  className,
}: FeatureCardProps) => {
  return (
    <Card
      className={cn(
        "border-none shadow-lg hover:shadow-xl transition-shadow",
        className
      )}
    >
      <CardHeader className="pb-0">
        <div className="p-3 rounded-full bg-primary/10 w-fit">{icon}</div>
      </CardHeader>
      <CardContent className="pt-4">
        <CardTitle className="mb-2 text-xl">{title}</CardTitle>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

const HowItWorks = () => {
  const features = [
    {
      icon: <Globe className="h-6 w-6 text-clickr-blue" />,
      title: "Web-App Pair",
      description:
        "Configure your mappings in the desktop app and sync them instantly with the website.",
    },
    {
      icon: <Cloud className="h-6 w-6 text-clickr-blue" />,
      title: "Multiplatform and Cloud",
      description:
        "Your mappings are stored in the cloud and accessible across Windows, macOS, and Linux.",
    },
    {
      icon: <Laptop className="h-6 w-6 text-clickr-blue" />,
      title: "Electron and C++",
      description:
        "Powered by a high-performance C++ core for efficient keyboard remapping with zero latency.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-4">How it Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Clickr seamlessly connects your web preferences with desktop
            functionality
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
