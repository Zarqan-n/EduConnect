import { Link } from "wouter";
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import Logo from "../Assets/Logo (2).png";

export function Footer() {
  const quickLinks = [
    { label: "Find Tutors", href: "/tutors" },
    { label: "Job Board", href: "/jobs" },
    { label: "Book Market", href: "/books" },
    { label: "Dashboard", href: "/dashboard" },
  ];

  const companyLinks = [
    { label: "About Us", href: "#about" },
    { label: "Contact", href: "#contact" },
    { label: "Privacy Policy", href: "#privacy" },
    { label: "Terms of Service", href: "#terms" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#facebook", label: "Facebook" },
    { icon: Twitter, href: "#twitter", label: "Twitter" },
    { icon: Linkedin, href: "#linkedin", label: "LinkedIn" },
    { icon: Instagram, href: "#instagram", label: "Instagram" },
  ];

  return (
    <footer className="relative border-t border-blue-200/50 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 text-foreground animate-slide-in-from-bottom overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-300/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-indigo-400/10 to-blue-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        {/* Top Section with Logo */}
        <div className="mb-12 pb-8 border-b border-blue-200/30">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4 p-3 rounded-2xl bg-gradient-to-r from-blue-100/50 via-indigo-100/50 to-purple-100/50 backdrop-blur-sm border border-blue-200/50 transform hover:scale-110 transition-transform duration-300 animate-fade-in shadow-lg">
              <img 
                src={Logo} 
                alt="EduConnect Logo" 
                className="h-8 w-auto drop-shadow-lg animate-bounce" 
                style={{ animationDuration: "3s" }}
              />
              <h2 className="font-heading font-bold text-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                EduConnect
              </h2>
            </div>
            <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
              Empowering education everywhere. Connect with expert tutors, unlock job opportunities, trade textbooks, and elevate your educational journey—all in one powerful platform.
            </p>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-primary/20">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="text-white font-bold text-sm">✓</span>
              </div>
              <span className="font-heading font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Mission
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Bridging the gap between learners and educators with innovative tools for academic growth and career advancement.
            </p>
          </div>

          {/* Quick Links */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-accent/5 to-primary/5 border border-accent/10 backdrop-blur-sm hover:border-accent/30 transition-all duration-300 group">
            <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link, index) => (
                <li key={link.href} className="overflow-hidden" style={{ animationDelay: `${index * 0.1}s` }}>
                  <Link href={link.href}>
                    <span className="text-sm text-muted-foreground hover:text-primary transition-all duration-200 cursor-pointer block group-hover:translate-x-1 transform">
                      → {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 group">
            <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Company
            </h3>
            <ul className="space-y-2.5">
              {companyLinks.map((link, index) => (
                <li key={link.href} style={{ animationDelay: `${index * 0.1}s` }}>
                  <a 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-accent transition-all duration-200 cursor-pointer block group-hover:translate-x-1 transform"
                  >
                    → {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-accent/5 to-primary/5 border border-accent/10 backdrop-blur-sm hover:border-accent/30 transition-all duration-300 group">
            <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 hover:translate-x-1 transition-transform duration-200">
                <Mail className="h-4 w-4 text-primary mt-0.5 flex-shrink-0 animate-pulse" />
                <a 
                  href="mailto:itszarqan@gmail.com" 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 break-words"
                >
                  itszarqan@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3 hover:translate-x-1 transition-transform duration-200">
                <Phone className="h-4 w-4 text-accent mt-0.5 flex-shrink-0 animate-pulse" style={{ animationDelay: "0.5s" }} />
                <a 
                  href="tel:+8017927972" 
                  className="text-sm text-muted-foreground hover:text-accent transition-colors duration-200"
                >
                  +(91) 8017927972
                </a>
              </li>
              <li className="flex items-start gap-3 hover:translate-x-1 transition-transform duration-200">
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0 animate-pulse" style={{ animationDelay: "1s" }} />
                <span className="text-sm text-muted-foreground">
                  Rajabazar, Kolkata<br />
                  West Bengal, India
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links & Copyright */}
        <div className="py-6 border-t border-primary/20 bg-gradient-to-r from-transparent via-primary/5 to-transparent rounded-lg px-4">
          <div className="flex items-center justify-between flex-col md:flex-row gap-6">
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.href}
                    href={social.href}
                    aria-label={social.label}
                    className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-foreground hover:from-primary hover:to-accent hover:text-primary-foreground transition-all duration-300 flex items-center justify-center transform hover:scale-110 hover:rotate-12 shadow-lg hover:shadow-xl border border-primary/30 hover:border-primary/60 group animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Icon className="h-5 w-5 group-hover:animate-spin" style={{ animationDuration: "0.6s" }} />
                  </a>
                );
              })}
            </div>

            {/* Copyright */}
            <p className="text-sm text-muted-foreground text-center md:text-right font-medium">
              © 2026 EduConnect. All rights reserved.
            </p>
          </div>
        </div>

        {/* Bottom Message */}
        <div className="pt-6 border-t border-primary/20 text-center group">
          <p className="text-xs text-muted-foreground font-semibold tracking-wide">
            Made with <span className="text-primary inline-block group-hover:scale-125 transition-transform duration-600 animate-pulse">❤️</span> for learners and educators worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
