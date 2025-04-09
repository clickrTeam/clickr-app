
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Apple, ArrowRight, Download, Monitor, Github } from 'lucide-react';
import { Windows, Linux } from './Icons';

const DownloadSection = () => {
  return (
    <section className="py-20 bg-primary/5">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-4">Download Clickr</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get our desktop app to start remapping your keyboard
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Windows */}
          <motion.div
            className="glass-panel p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center mb-4">
              <Windows className="h-16 w-16 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Windows</h3>
            <p className="mb-6 text-muted-foreground">For Windows 10 and above</p>
            <Button className="w-full" asChild>
              <a href="#download-windows">
                <Download className="mr-2 h-4 w-4" />
                Download
              </a>
            </Button>
          </motion.div>

          {/* MacOS */}
          <motion.div
            className="glass-panel p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center mb-4">
              <Apple className="h-16 w-16 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">macOS</h3>
            <p className="mb-6 text-muted-foreground">For macOS 11.0 and above</p>
            <Button className="w-full" asChild>
              <a href="#download-mac">
                <Download className="mr-2 h-4 w-4" />
                Download
              </a>
            </Button>
          </motion.div>

          {/* Linux */}
          <motion.div
            className="glass-panel p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center mb-4">
              <Linux className="h-16 w-16 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Linux</h3>
            <p className="mb-6 text-muted-foreground">For most major distributions</p>
            <Button className="w-full" asChild>
              <a href="#download-linux">
                <Download className="mr-2 h-4 w-4" />
                Download
              </a>
            </Button>
          </motion.div>
        </div>

        <div className="mt-12 text-center">
          <Button variant="outline" className="gap-2" asChild>
            <a href="https://github.com/clickr/app" target="_blank" rel="noopener noreferrer">
              <Github size={16} />
              View Source on GitHub
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DownloadSection;
