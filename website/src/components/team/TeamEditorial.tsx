import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Mail } from "lucide-react";
import { FaLinkedin } from "react-icons/fa6";
import { cn } from "@/lib/utils";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  email: string;
  linkedin: string;
  imagePath: string;
  imageSide?: "left" | "right";
}

interface TeamEditorialProps {
  members: TeamMember[];
}

const EditorialMember = ({ member, index }: { member: TeamMember; index: number }) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  // Adjusted opacity transform to fade out sooner at the end
  // [0, 0.2, 0.8, 1] -> fade in quickly, stay visible, then fade out before fully leaving
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.7, 1, 1, 0.7]);
  
  // Parallax effect for text - increased movement for more pronounced effect
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={targetRef} className="min-h-screen flex items-center justify-center py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div 
          style={{ opacity, scale }}
          className={cn(
            "flex flex-col lg:flex-row gap-12 items-center",
            index % 2 === 1 ? "lg:flex-row-reverse" : ""
          )}
        >
          {/* Image Side */}
          <div className="w-full lg:w-1/2 relative h-[50vh] lg:h-[80vh]">
            <div className="absolute inset-0 overflow-hidden rounded-2xl shadow-2xl">
              {member.imagePath ? (
                <img
                  src={member.imagePath}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-4xl">👤</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <h3 className="text-4xl md:text-6xl font-bold mb-2">{member.name}</h3>
                <p className="text-xl md:text-2xl text-gray-200">{member.role}</p>
              </div>
            </div>
          </div>

          {/* Text Side */}
          <motion.div 
            style={{ y }}
            className="w-full lg:w-1/2 space-y-8"
          >
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-lg md:text-xl leading-relaxed text-muted-foreground">
                {member.bio}
              </p>
            </div>
            
            <div className="flex gap-6 pt-6 border-t">
              {member.email && !member.email.includes("TODO") && (
                <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-clickr-blue hover:underline group">
                  <div className="p-3 rounded-full bg-clickr-light-blue/10 group-hover:bg-clickr-light-blue/20 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                  <span className="font-medium">Email</span>
                </a>
              )}
              {member.linkedin && !member.linkedin.includes("TODO") && (
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-clickr-blue hover:underline group">
                  <div className="p-3 rounded-full bg-clickr-light-blue/10 group-hover:bg-clickr-light-blue/20 transition-colors">
                    <FaLinkedin className="h-5 w-5" />
                  </div>
                  <span className="font-medium">LinkedIn</span>
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export const TeamEditorial = ({ members }: TeamEditorialProps) => {
  return (
    <div className="bg-background relative">
        <div className="py-10 text-center bg-gradient-to-b from-clickr-light-blue/30 via-clickr-light-blue/25 to-gray-50">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900">Our Team</h2>
            <p className="text-lg text-muted-foreground mt-4">Meet the minds behind Clickr.</p>
        </div>
      {members.map((member, index) => (
        <EditorialMember key={index} member={member} index={index} />
      ))}
    </div>
  );
};
