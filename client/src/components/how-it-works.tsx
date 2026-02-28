import { motion } from "framer-motion";
import { Zap, Shield, Brain, Briefcase, BookOpen, Layers, Sparkles } from "lucide-react";

export function HowItWorks() {
  const features = [
    {
      icon: Zap,
      title: "Smart Discovery",
      description: "Find verified local tutors based on class, subject, location & budget instantly.",
      color: "text-yellow-500",
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      gradientFrom: "from-yellow-500/20",
      gradientTo: "to-orange-500/20"
    },
    {
      icon: Shield,
      title: "Trust & Safety",
      description: "Verified profiles and top-rated tutors ensure reliability and prevent scams.",
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      gradientFrom: "from-blue-500/20",
      gradientTo: "to-cyan-500/20"
    },
    {
      icon: Brain,
      title: "AI Assistant",
      description: "Gemini-powered AI guides you to find tutors, subjects & features efficiently.",
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      gradientFrom: "from-purple-500/20",
      gradientTo: "to-pink-500/20"
    },
    {
      icon: Briefcase,
      title: "Job Board",
      description: "Schools & institutions post teaching vacancies. Apply & hire qualified tutors.",
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-900/20",
      gradientFrom: "from-green-500/20",
      gradientTo: "to-emerald-500/20"
    },
    {
      icon: BookOpen,
      title: "Book Market",
      description: "Buy & sell textbooks locally. Affordable, convenient & sustainable.",
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-900/20",
      gradientFrom: "from-orange-500/20",
      gradientTo: "to-red-500/20"
    },
    {
      icon: Layers,
      title: "Role Dashboards",
      description: "Personalized dashboards for Students, Tutors, Institutions & Admins.",
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      gradientFrom: "from-indigo-500/20",
      gradientTo: "to-blue-500/20"
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 }
    }
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-4">
            <Sparkles className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: "3s" }} />
            <span className="text-sm font-semibold text-primary">How It Works</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Empower Your Educational Journey
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover how EduConnect brings together students, tutors, institutions, and resources in one powerful platform
          </p>
        </motion.div>

        {/* Grid of Features */}
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={item}
                className="group relative overflow-hidden rounded-2xl border border-primary/20 p-8 hover:border-primary/60 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 bg-background/50 backdrop-blur-sm hover:bg-background/80"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradientFrom} ${feature.gradientTo} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon Container */}
                  <div className={`w-16 h-16 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                    <Icon className="w-8 h-8" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                    {feature.description}
                  </p>

                  {/* Animated Accent Line */}
                  <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-accent w-0 group-hover:w-full transition-all duration-300" />
                </div>

                {/* Number Badge */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  {index + 1}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">Ready to transform your learning experience?</p>
          <div className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30">
            <span className="relative flex height-3 width-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
            </span>
            <span className="text-sm font-medium text-foreground">Join thousands of learners today</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
