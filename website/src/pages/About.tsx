import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Code2, 
  Zap, 
  Globe, 
  Download, 
  BookOpen,
  Linkedin,
  Mail,
  ArrowRight
} from "lucide-react";

const About = () => {
  const technologies = [
    {
      name: "Electron",
      description: "Cross-platform desktop application framework enabling native performance with web technologies",
      icon: <Code2 className="h-8 w-8 text-clickr-blue" />,
    },
    {
      name: "React",
      description: "Modern JavaScript library for building responsive and interactive user interfaces",
      icon: <Zap className="h-8 w-8 text-clickr-blue" />,
    },
    {
      name: "C++ Keybinder",
      description: "High-performance native core providing zero-latency keyboard remapping across all platforms",
      icon: <Globe className="h-8 w-8 text-clickr-blue" />,
    },
  ];

  const teamMembers = [
    {
      name: "Bode",
      role: "Front End & Database",
      bio: "TODO: Add 150-250 word biography describing degree, research/project affiliations (including capstone), interests, etc.",
      email: "TODO: Add email address",
      linkedin: "TODO: Add LinkedIn URL",
      imageSide: "left" as const,
    },
    {
      name: "Ryan",
      role: "Linux & Training Game",
      bio: "TODO: Add 150-250 word biography describing degree, research/project affiliations (including capstone), interests, etc.",
      email: "TODO: Add email address",
      linkedin: "TODO: Add LinkedIn URL",
      imageSide: "right" as const,
    },
    {
      name: "Tim",
      role: "Keybinder & CLI",
      bio: "TODO: Add 150-250 word biography describing degree, research/project affiliations (including capstone), interests, etc.",
      email: "TODO: Add email address",
      linkedin: "TODO: Add LinkedIn URL",
      imageSide: "left" as const,
    },
    {
      name: "Hayden",
      role: "Linux Implementation",
      bio: "TODO: Add 150-250 word biography describing degree, research/project affiliations (including capstone), interests, etc.",
      email: "TODO: Add email address",
      linkedin: "TODO: Add LinkedIn URL",
      imageSide: "right" as const,
    },
    {
      name: "Luke",
      role: "Visual Keyboard & Windows Validation",
      bio: "TODO: Add 150-250 word biography describing degree, research/project affiliations (including capstone), interests, etc.",
      email: "TODO: Add email address",
      linkedin: "TODO: Add LinkedIn URL",
      imageSide: "left" as const,
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
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gradient">
              About Clickr
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Revolutionizing keyboard customization through cross-platform innovation
            </p>
          </motion.div>
        </div>
      </section>

      {/* Project Overview */}
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
              Project Overview
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Clickr is a comprehensive cross-platform keyboard remapping solution that empowers users 
                to customize their keyboard experience across Windows, macOS, and Linux. The application 
                addresses the fundamental challenge of keyboard customization by providing a seamless, 
                cloud-synchronized experience that works consistently across all major operating systems.
              </p>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                At its core, Clickr solves the problem of fragmented keyboard remapping solutions that 
                are typically platform-specific and lack cloud synchronization. Users can now create 
                keyboard profiles on one device and seamlessly access them on another, regardless of 
                the operating system. This is particularly valuable for developers, power users, and 
                accessibility-focused individuals who work across multiple platforms.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Screenshots/Diagrams Placeholder */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              Application Screenshots & Architecture
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card className="border-2 border-dashed border-muted-foreground/30">
                <CardContent className="p-12 flex items-center justify-center min-h-[300px]">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📸</div>
                    <p className="text-muted-foreground">Screenshot Placeholder</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Add application screenshots here
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 border-dashed border-muted-foreground/30">
                <CardContent className="p-12 flex items-center justify-center min-h-[300px]">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📊</div>
                    <p className="text-muted-foreground">Architecture Diagram Placeholder</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Add system architecture diagram here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Technologies */}
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
              Technologies
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {technologies.map((tech, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-8 text-center">
                      <div className="flex justify-center mb-4">{tech.icon}</div>
                      <h3 className="text-2xl font-bold mb-3">{tech.name}</h3>
                      <p className="text-muted-foreground">{tech.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Download Blurb */}
      <section className="py-16 bg-gradient-to-b from-gray-50  via-clickr-light-blue/35 to-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="flex justify-center mb-6">
              <Download className="h-12 w-12 text-clickr-blue" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get Started with Clickr
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Clickr is available for download directly from the navigation bar. 
              The application supports Windows, macOS, and Linux, with automatic 
              platform detection to provide the correct installer for your system. 
              Once installed, you can create keyboard profiles, sync them across 
              devices, and start customizing your keyboard experience immediately.
            </p>
            <p className="text-muted-foreground">
              Look for the download button in the top navigation bar to get started.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Our Team
            </h2>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-16"
            >
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={`flex flex-col ${
                    member.imageSide === "left" ? "md:flex-row" : "md:flex-row-reverse"
                  } items-center gap-8`}
                >
                  {/* Image */}
                  <div className="flex-shrink-0 w-48 h-48 md:w-64 md:h-64">
                    <Card className="border-2 border-dashed border-muted-foreground/30 h-full">
                      <CardContent className="p-8 flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="text-6xl mb-2">👤</div>
                          <p className="text-sm text-muted-foreground">Headshot Placeholder</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Bio */}
                  <div className="flex-1">
                    <Card className="border-none shadow-lg">
                      <CardContent className="p-8">
                        <h3 className="text-2xl font-bold mb-2">{member.name}</h3>
                        <p className="text-clickr-blue font-semibold mb-4">{member.role}</p>
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                          {member.bio}
                        </p>
                        <div className="flex flex-wrap gap-4">
                          {member.email !== "TODO: Add email address" && (
                            <a
                              href={`mailto:${member.email}`}
                              className="flex items-center gap-2 text-clickr-blue hover:underline"
                            >
                              <Mail className="h-4 w-4" />
                              <span>Email</span>
                            </a>
                          )}
                          {member.linkedin !== "TODO: Add LinkedIn URL" && (
                            <a
                              href={member.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-clickr-blue hover:underline"
                            >
                              <Linkedin className="h-4 w-4" />
                              <span>LinkedIn</span>
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Tutorial Link */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="flex justify-center mb-6">
              <BookOpen className="h-12 w-12 text-clickr-blue" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Learn How to Use Clickr
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Ready to get started? Check out our comprehensive tutorial to learn 
              how to create profiles, customize key mappings, and sync across devices.
            </p>
            <Button size="lg" asChild className="gap-2">
              <Link to="/tutorial">
                View Tutorial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;

