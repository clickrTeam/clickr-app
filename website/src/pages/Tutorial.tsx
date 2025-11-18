import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Play, 
  Download, 
  Settings, 
  Save,
  Zap,
  CheckCircle2
} from "lucide-react";

const Tutorial = () => {
  // Helper function to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const steps = [
    {
      number: 1,
      title: "Download and Install",
      description: "Download Clickr from the navigation bar. The download button automatically detects your operating system (Windows, macOS, or Linux) and provides the appropriate installer. Run the installer and follow the setup wizard to complete installation.",
      icon: <Download className="h-6 w-6 text-clickr-blue" />,
    },
    {
      number: 2,
      title: "Create an Account",
      description: "Launch the Clickr application and create a free account. This account allows you to sync your keyboard profiles across all your devices. You can also browse and download profiles created by the community.",
      icon: <Play className="h-6 w-6 text-clickr-blue" />,
    },
    {
      number: 3,
      title: "Create Your First Profile",
      description: "Click 'New Profile' to create a custom keyboard mapping. Give your profile a descriptive name that reflects its purpose (e.g., 'Gaming Setup', 'Programming Layout'). Profiles can contain multiple layers for different use cases.",
      icon: <Settings className="h-6 w-6 text-clickr-blue" />,
    },
    {
      number: 4,
      title: "Configure Key Mappings",
      description: "Select a key on the visual keyboard and choose what it should remap to. You can remap to another key, a key combination, or a custom macro. Use the layer system to create context-specific mappings that activate under different conditions.",
      icon: <Zap className="h-6 w-6 text-clickr-blue" />,
    },
    {
      number: 5,
      title: "Save and Activate",
      description: "Once you've configured your mappings, save your profile. Click 'Activate' to enable the remapping. The Keybinder daemon will run in the background, applying your mappings system-wide. You can pause or resume remapping at any time.",
      icon: <Save className="h-6 w-6 text-clickr-blue" />,
    },
    {
      number: 6,
      title: "Sync Across Devices",
      description: "Your profiles are automatically synced to the cloud. When you log in on another device, all your profiles will be available. Download and activate any profile to use it on that device. Changes sync automatically across all your devices.",
      icon: <CheckCircle2 className="h-6 w-6 text-clickr-blue" />,
    },
  ];

  const tips = [
    "Start with simple remappings to get familiar with the interface",
    "Use descriptive names for your profiles to easily identify them later",
    "Test your mappings in a text editor before using them in applications",
    "Take advantage of layers to create complex, context-aware mappings",
    "Browse the community profiles for inspiration and ready-made solutions",
    "The Keybinder daemon runs independently, so remapping works even when the app is closed",
  ];

  // 6 Clickr colors for borders and shadows
  const clickrColors = [
    { 
      name: "blue", 
      border: "border-clickr-blue", 
      text: "text-clickr-blue",
      bg: "bg-clickr-blue/10",
      color: "#1EAEDB"
    },
    { 
      name: "orange", 
      border: "border-clickr-orange", 
      text: "text-clickr-orange",
      bg: "bg-clickr-orange/10",
      color: "#FF9800"
    },
    { 
      name: "red", 
      border: "border-clickr-red", 
      text: "text-clickr-red",
      bg: "bg-clickr-red/10",
      color: "#FF5252"
    },
    { 
      name: "yellow", 
      border: "border-clickr-yellow", 
      text: "text-clickr-yellow",
      bg: "bg-clickr-yellow/10",
      color: "#FFD740"
    },
    { 
      name: "green", 
      border: "border-clickr-green", 
      text: "text-clickr-green",
      bg: "bg-clickr-green/10",
      color: "#4CAF50"
    },
    { 
      name: "purple", 
      border: "border-clickr-purple", 
      text: "text-clickr-purple",
      bg: "bg-clickr-purple/10",
      color: "#9C27B0"
    },
  ];

  // Scrollable card component with off-center animation
  const ScrollableCard = ({ 
    step, 
    index, 
    color 
  }: { 
    step: typeof steps[0]; 
    index: number; 
    color: typeof clickrColors[0] 
  }) => {
    const ref = useRef<HTMLDivElement>(null);
    
    const { scrollYProgress } = useScroll({
      target: ref,
      offset: ["start 0.8", "start 0.4"]
    });
    
    // Determine if card should start left or right (alternating)
    const isEven = index % 2 === 0;
    const offsetAmount = 250; // How far off-center
    const stopPosition = offsetAmount * 0;
    
    // Transform based on scroll progress - complete sooner but keep same speed
    const x = useTransform(
      scrollYProgress,
      [0, 0.5, 1], // Complete animation at 50% scroll progress (sooner)
      [isEven ? -offsetAmount : offsetAmount, isEven ? -stopPosition : stopPosition, isEven ? -stopPosition : stopPosition]
    );
    
    const opacity = useTransform(
      scrollYProgress,
      [0, 0.2, 0.5, 1],
      [0.4, 1, 1, 1]
    );
    
    return (
      <motion.div 
        ref={ref}
        style={{ 
          x,
          opacity
        }}
        className="w-full"
      >
        <Card 
          className={`border-2 ${color.border} transition-all duration-300`}
          style={{
            boxShadow: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px ${hexToRgba(color.color, 0.25)}, 0 10px 15px -3px ${hexToRgba(color.color, 0.2)}`
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px ${hexToRgba(color.color, 0.4)}, 0 20px 25px -5px ${hexToRgba(color.color, 0.3)}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 1px ${hexToRgba(color.color, 0.25)}, 0 10px 15px -3px ${hexToRgba(color.color, 0.2)}`;
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-full ${color.bg} flex items-center justify-center`}>
                  <div className={`text-2xl font-bold ${color.text}`}>
                    {step.number}
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={color.text}>{step.icon}</div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 -top-24 bg-gradient-to-b from-clickr-light-blue/60 via-clickr-light-blue/30 to-gray-50" />
        <div className="container mx-auto px-4 relative z-10 pt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <Button variant="ghost" asChild className="mb-6">
              <Link to="/about" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to About
              </Link>
            </Button>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">
              Clickr Tutorial
            </h1>
            <p className="text-xl text-muted-foreground">
              A quick guide to getting started with Clickr and customizing your keyboard experience
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Summary */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              Quick Summary
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Clickr allows you to remap any key on your keyboard to another key, key combination, 
                or custom macro. Create profiles that sync across all your devices, whether you're 
                on Windows, macOS, or Linux. The application uses a high-performance C++ core 
                (Keybinder) that runs in the background, providing zero-latency remapping without 
                requiring the main application to be open. You can create multiple profiles for 
                different use cases, share them with the community, or download profiles created 
                by others.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Step-by-Step Guide */}
      <section className="py-8 bg-slate-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Step-by-Step Guide
            </h2>
            
            <div className="space-y-5">
              {steps.map((step, index) => {
                const color = clickrColors[index % clickrColors.length];
                return (
                  <ScrollableCard 
                    key={index}
                    step={step}
                    index={index}
                    color={color}
                  />
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              Pro Tips
            </h2>
            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <ul className="space-y-4">
                  {tips.map((tip, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2 className="h-5 w-5 text-clickr-blue flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{tip}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-tr from-clickr-blue/10 to-clickr-light-blue/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Download Clickr from the navigation bar and start customizing your keyboard experience today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/">Go to Home</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Tutorial;

