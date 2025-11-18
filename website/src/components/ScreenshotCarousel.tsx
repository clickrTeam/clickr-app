import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const screenshots = [
  {
    src: "/about/clickr screenshots/clickr-app-ss.png",
    alt: "Clickr Application Interface",
    title: "Main Application",
  },
  {
    src: "/about/clickr screenshots/clickr-community-ss.png",
    alt: "Clickr Community Features",
    title: "Community Hub",
  },
  {
    src: "/about/clickr screenshots/clickr-game-ss.png",
    alt: "Clickr Training Game",
    title: "Training Game",
  },
  {
    src: "/about/clickr screenshots/clickr-insights-ss.png",
    alt: "Clickr Insights Dashboard",
    title: "Insights & Analytics",
  },
  {
    src: "/about/clickr screenshots/clickr-mappings-ss.png",
    alt: "Clickr Key Mappings",
    title: "Key Mappings",
  },
  {
    src: "/about/clickr screenshots/clickr-settings-ss.png",
    alt: "Clickr Settings",
    title: "Settings",
  },
  {
    src: "/about/Architecture-Diagram.png",
    alt: "Clickr System Architecture",
    title: "System Architecture",
  },
];

const ScreenshotCarousel = () => {
  const transition = {
    duration: 120,
    ease: "linear",
    repeat: Infinity,
    repeatType: "loop" as const,
  };

  return (
    <section className="py-16 bg-slate-50 overflow-hidden">
      <div className="container mx-auto px-4 text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
          Application Screenshots & Architecture
        </h2>
        <p className="text-xl text-muted-foreground">
          Explore Clickr's application interface and system architecture
        </p>
      </div>

      <div className="relative h-[450px]">
        <motion.div
          className="flex absolute top-0 gap-6"
          animate={{
            x: ["0%", "-50%"],
          }}
          initial={{ x: 0 }}
          transition={transition}
        >
          {[...screenshots, ...screenshots].map((screenshot, idx) => (
            <Card
              key={`${screenshot.title}-${idx}`}
              className="flex-shrink-0 w-[600px] h-[400px] overflow-hidden shadow-xl hover:shadow-2xl transition-shadow border-2"
            >
              <CardContent className="p-0 h-full flex flex-col">
                <div className="flex-1 overflow-hidden bg-white" style={{ clipPath: 'inset(1px 0 2px 0)' }}>
                  <img
                    src={screenshot.src}
                    alt={screenshot.alt}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-4 bg-white border-t">
                  <h3 className="text-lg font-semibold text-center">
                    {screenshot.title}
                  </h3>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ScreenshotCarousel;

