import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Briefcase, BookOpen, Search } from "lucide-react";
import { LayoutShell } from "@/components/layout-shell";
import { StudentDashboard } from "@/components/student-dashboard";
import { HowItWorks } from "@/components/how-it-works";

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <LayoutShell>
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 px-6 py-16 sm:px-12 sm:py-24 text-center lg:py-32">
        <motion.div
          initial="hidden"
          animate="show"
          variants={container}
          className="mx-auto max-w-4xl space-y-8"
        >
          <motion.h1 
            variants={item}
            className="font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-7xl"
          >
            Your Gateway to <br/>
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Academic Excellence
            </span>
          </motion.h1>
          
          <motion.p 
            variants={item}
            className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            Connect with expert tutors, find teaching opportunities, buy & sell textbooks, 
            and elevate your educational journey. All in one place.
          </motion.p>
          
          <motion.div 
            variants={item}
            className="flex flex-col sm:flex-row justify-center gap-4 pt-4"
          >
            <Link href="/tutors">
              <Button size="lg" className="h-14 px-8 rounded-2xl text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-1">
                Find a Tutor <Search className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="h-14 px-8 rounded-2xl text-lg font-semibold border-2 hover:bg-background/80 hover:-translate-y-1 transition-all">
                Join Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 -z-10 h-full w-full opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-primary/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-accent/20 blur-3xl animate-pulse delay-700" />
        </div>
      </div>

          {/* Features Section */}
      <div className="py-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard
          href="/tutors"
          icon={GraduationCap}
          title="Expert Tutors"
          description="Find verified tutors for any subject, grade, or skill level. Online or in-person."
          color="text-primary"
          bg="bg-primary/10"
        />
        <FeatureCard
          href="/jobs"
          icon={Briefcase}
          title="Teaching Jobs"
          description="Schools and institutions post openings daily. Apply with a single click."
          color="text-accent"
          bg="bg-accent/10"
        />
        <FeatureCard
          href="/books"
          icon={BookOpen}
          title="Book Marketplace"
          description="Buy and sell used textbooks within your community. Save money and trees."
          color="text-green-600"
          bg="bg-green-100 dark:bg-green-900/20"
        />
      </div>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Map Preview / Quick Search */}
      
    </LayoutShell>
  );
}

function FeatureCard({ href, icon: Icon, title, description, color, bg }: any) {
  return (
    <Link href={href}>
      <div className="group relative h-full rounded-3xl border border-border p-8 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer overflow-hidden bg-card">
        <div className={`w-14 h-14 rounded-2xl ${bg} ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-7 h-7" />
        </div>
        <h3 className="text-2xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
        
        <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-4 group-hover:translate-x-0">
          <ArrowRight className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </Link>
  );
}
