import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Terminal, 
  Download, 
  Code2, 
  Zap, 
  FileCode
} from "lucide-react";

const CLI = () => {
  const features = [
    {
      name: "Text-Based Configuration",
      description: "Define keyboard profiles using a simple, human-readable DSL that's easy to version control and share",
      icon: <FileCode className="h-8 w-8 text-clickr-blue" />,
    },
    {
      name: "Powerful Grammar",
      description: "Support for layers, chords, sequences, combos, and advanced key behaviors with fine-grained control",
      icon: <Code2 className="h-8 w-8 text-clickr-blue" />,
    },
    {
      name: "Fast & Efficient",
      description: "Built with Rust for maximum performance and minimal resource usage",
      icon: <Zap className="h-8 w-8 text-clickr-blue" />,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 -top-24 bg-gradient-to-b from-clickr-light-blue/60 via-clickr-light-blue/30 to-gray-50" />
        <div className="container mx-auto px-4 relative z-10 pt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <Terminal className="h-16 w-16 text-clickr-blue" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient">
              Clickr CLI
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Powerful command-line tool for creating and managing keyboard profiles
            </p>
          </motion.div>
        </div>
      </section>

      {/* Overview Section */}
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
              Overview
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                The Clickr CLI is a powerful command-line interface for creating, validating, and managing 
                keyboard remapping profiles. Built with Rust for performance and reliability, the CLI provides 
                a text-based DSL (Domain-Specific Language) that makes it easy to define complex keyboard layouts 
                with layers, chords, sequences, and advanced key behaviors.
              </p>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Whether you're a developer looking to version control your keyboard configurations, a power user 
                who prefers text-based tools, or someone who wants to automate profile creation, the Clickr CLI 
                offers a flexible and efficient solution. Profiles created with the CLI can be validated, shared, 
                and imported into the Clickr desktop application.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-8 text-center">
                      <div className="flex justify-center mb-4">{feature.icon}</div>
                      <h3 className="text-2xl font-bold mb-3">{feature.name}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Download Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 via-clickr-light-blue/35 to-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <Download className="h-12 w-12 text-clickr-blue" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Download the CLI
            </h2>
            <p className="text-lg text-muted-foreground mb-8 text-center">
              Get the Clickr CLI tool to start creating keyboard profiles from the command line.
            </p>
            
            {/* Single CLI Card */}
            <div className="flex justify-center mb-8">
              <Card className="border-none shadow-lg hover:shadow-xl transition-shadow w-full max-w-md">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <Terminal className="h-16 w-16 text-clickr-blue" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">CLI</h3>
                  <p className="text-muted-foreground mb-6">
                    Install via Cargo, Rust's package manager
                  </p>
                  <Button className="w-full" variant="outline" asChild>
                    <a
                      href="https://pub-88623f5677af473299bdb0e0cb10017e.r2.dev/clickr-cli"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download CLI
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Install via binary hosted on Cloudflare
              </p>
              <Button variant="outline" className="gap-2" asChild>
                <a
                  href="https://capstone.cs.utah.edu/clickr"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Code2 className="h-4 w-4" />
                  View Source on GitLab
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default CLI;
