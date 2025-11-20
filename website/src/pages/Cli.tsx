import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/CodeBlock";
import { ExampleCarousel } from "@/components/ExampleCarousel";
import {
  Terminal,
  Download,
  Code2,
  Zap,
  FileCode,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { useOS, OperatingSystem } from "@/hooks/use-os";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

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

  const examples = [
    {
      title: "Simple Key Swap",
      code: `profile "Simple Key Swap"

config {
    default_layer = "base"
}

# This layer swaps the 'a' and 'b' keys.
# Pressing 'a' will output 'b', and pressing 'b' will output 'a'.
layer "base" {
    a = b
    b = a
}`
    },
    {
      title: "Caps Lock as Esc/Ctrl",
      code: `profile "Caps Lock as Esc/Ctrl"

config {
    default_layer = "base"
}

# This profile remaps the caps lock key to be a dual-function key.
# Tapping caps lock sends 'esc'.
# Holding caps lock makes it act as 'ctrl'.
layer "base" {
    caps_lock = tap(esc, ctrl)
}`
    },
    {
      title: "Vim Style Navigation",
      code: `profile "Vim Style Navigation"

config {
    default_layer = "base"
}

# This profile creates a navigation layer for Vim-style arrow keys.
# Hold down the semicolon key to activate the "nav" layer.
layer "base" {
    hold(semicolon) = layer("nav")
}

# While semicolon is held down, you can use h, j, k, l as arrow keys.
layer "nav" {
    h = left
    j = down
    k = up
    l = right
    # Release semicolon to return to the "base" layer.
    ^semicolon = layer("base")
}`
    },
    {
      title: "Numpad Layer",
      code: `profile "Numpad Layer"

config {
    default_layer = "base"
}

# This profile turns a block of keys into a numpad.
# Hold down the alt key to activate the "numpad" layer.
layer "base" {
    hold(alt) = layer("numpad")
}

# While alt is held down, the u, i, o, j, k, l, m, ,, . keys
# act as a numpad.
layer "numpad" {
    u = 7
    i = 8
    o = 9
    j = 4
    k = 5
    l = 6
    m = 1
    , = 2
    . = 3
    # Release alt to return to the "base" layer.
    ^alt = layer("base")
}`
    },
    {
      title: "Key Sequence",
      code: `profile "Key Sequence"

config {
    default_layer = "base"
}

# This profile triggers an action when a sequence of keys is pressed.
layer "base" {
    # Press 'i', then 'd', then 'd' to output "deleting line".
    sequence([i, d, d]) = "deleting line"
}`
    },
    {
      title: "Key Chord",
      code: `profile "Key Chord"

config {
    default_layer = "base"
}

# This profile triggers an action when a chord of keys is held down.
layer "base" {
    # Press and hold 'j' and 'k' at the same time to exit the current layer.
    chord([j, k]) = exit()
}`
    }
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

  const detectedOS = useOS();
  const [selectedOS, setSelectedOS] = useState<OperatingSystem | 'linux'>('macos');

  useEffect(() => {
    if (detectedOS === 'windows') {
      setSelectedOS('windows');
    } else {
      setSelectedOS('macos');
    }
  }, [detectedOS]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 -top-24 h-[calc(100%+24px)] bg-gradient-to-b from-clickr-light-blue/60 via-clickr-light-blue/30 to-transparent" />
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
            <div
              className="flex items-center justify-center gap-4"
            >
              <Button variant="outline" size="lg" asChild className="gap-2">
                <Link to="/cli-docs">
                  <BookOpen className="h-4 w-4" />
                  Documentation
                </Link>
              </Button>
            </div>
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

      {/* Documentation Section */}
      <section className="py-16 bg-gradient-to-t from-clickr-light-blue/40 via-clickr-light-blue/20 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="flex justify-center mb-6 ">
              <BookOpen className="h-12 w-12 text-clickr-blue" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              CLI Documentation
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Explore the full capabilities of the Clickr CLI. Our documentation provides a comprehensive guide to the profile structure, advanced features, and more.
            </p>
            <Button size="lg" asChild className="gap-2">
              <Link to="/cli-docs">
                View Documentation
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

    {/* Example Section */}
    {/*
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Examples
          </h2>
          <ExampleCarousel examples={examples} />
          </motion.div>
        </div>
      </section>
    */}


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
      <section className="py-16 bg-gradient-to-b from-gray-50 via-clickr-light-blue/40 to-gray-50">
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

            <div className="flex justify-center mb-4">
              <div className="p-1 rounded-lg bg-gray-200 flex items-center">
                <Button
                  variant={selectedOS === 'macos' ? 'default' : 'ghost'}
                  onClick={() => setSelectedOS('macos')}
                  className={cn('rounded-md', { 'shadow-md': selectedOS === 'macos' })}
                >
                  macOS & Linux
                </Button>
                <Button
                  variant={selectedOS === 'windows' ? 'default' : 'ghost'}
                  onClick={() => setSelectedOS('windows')}
                  className={cn('rounded-md', { 'shadow-md': selectedOS === 'windows' })}
                >
                  Windows
                </Button>
              </div>
            </div>

            <Card className="border-none shadow-lg">
              <CardContent className="p-8 text-center">
                {selectedOS === 'macos' && (
                  <div>
                    <h3 className="text-2xl font-bold mb-2">macOS & Linux</h3>
                    <p className="text-muted-foreground mb-4">
                      Run the following command in your terminal to install the CLI.
                    </p>
                    <CodeBlock code="curl -sSL https://keyclickr.com/cli/install.sh | bash" />
                  </div>
                )}
                {selectedOS === 'windows' && (
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Windows</h3>
                    <p className="text-muted-foreground mb-4">
                      Run the following command in PowerShell to install the CLI.
                    </p>
                    <CodeBlock code="iwr https://keyclickr.com/cli/install.ps1 -useb | iex" />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="text-center mt-8">
              <Button variant="outline" className="gap-2" asChild>
                <a
                  href="https://capstone.cs.utah.edu/clickr/clickr-app/-/tree/main/cli?ref_type=heads&ref=main"
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
