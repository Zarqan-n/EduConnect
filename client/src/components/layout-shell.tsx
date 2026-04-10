import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import Logo from "../Assets/Logo (2).png";
import { Footer } from "@/components/footer";
import {
  GraduationCap,
  BookOpen,
  Briefcase,
  User,
  Menu,
  LayoutDashboard,
  MessageSquareMore,
  Shield
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location === path;

  const NavLink = ({ href, children, icon: Icon }: { href: string; children: React.ReactNode; icon: any }) => (
    <Link href={href}>
      <div
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
          ${isActive(href)
            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          }
        `}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <Icon className="w-4 h-4" />
        {children}
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50/30 flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-blue-200/50 bg-gradient-to-r from-white via-blue-50/40 to-white backdrop-blur supports-[backdrop-filter]:bg-white/60 animate-slide-in-from-top shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={user ? "/dashboard" : "/"}>
            <div className="flex items-center gap-2 cursor-pointer group">
              <img className="h-7 transition-transform duration-300 group-hover:scale-110" src={Logo} alt="" />
              <span className="font-heading font-bold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-indigo-700 transition-all duration-300">
                EduConnect
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {user && <NavLink href="/dashboard" icon={LayoutDashboard}>Home</NavLink>}
            <NavLink href="/tutors" icon={GraduationCap}>Find Tutors</NavLink>
            <NavLink href="/jobs" icon={Briefcase}>Job Board</NavLink>
            <NavLink href="/books" icon={BookOpen}>Book Market</NavLink>
            {user?.role === "admin" && <NavLink href="/admin" icon={Shield}>Admin</NavLink>}
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/profile">
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-blue-300/30 hover:ring-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="hidden sm:flex font-medium btn-hover rounded-xl text-blue-600 hover:text-blue-700 hover:bg-blue-50">Log in</Button>
                </Link>
                <Link href="/register">
                  <Button className="font-medium gradient-button-primary rounded-xl">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col gap-4 mt-8">
                  {user && <NavLink href="/dashboard" icon={LayoutDashboard}>Home</NavLink>}
                  {user && <NavLink href="/profile" icon={User}>Profile</NavLink>}
                  <NavLink href="/tutors" icon={GraduationCap}>Find Tutors</NavLink>
                  <NavLink href="/jobs" icon={Briefcase}>Job Board</NavLink>
                  <NavLink href="/books" icon={BookOpen}>Book Market</NavLink>
                  <NavLink href="/chatbot" icon={MessageSquareMore}>Assistant</NavLink>
                  {user?.role === "admin" && <NavLink href="/admin" icon={Shield}>Admin Panel</NavLink>}
                  <div className="h-px bg-border my-2" />
                  {!user && (
                    <>
                      <NavLink href="/login" icon={User}>Log in</NavLink>
                      <NavLink href="/register" icon={User}>Register</NavLink>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 animate-fade-in">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
