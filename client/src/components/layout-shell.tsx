import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import Logo from "../Assets/Logo (2).png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GraduationCap,
  BookOpen,
  Briefcase,
  User,
  LogOut,
  Menu,
  LayoutDashboard,
  MessageCircle,
  ChartBarIcon,
  MessageSquareMore
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-slide-in-from-top">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={user ? "/dashboard" : "/"}>
            <div className="flex items-center gap-2 cursor-pointer group">
              <img className="h-7 transition-transform duration-300 group-hover:scale-110" src={Logo} alt="" />
              <span className="font-heading font-bold text-xl tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
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
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-primary/10 hover:ring-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 animate-scale-in" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email} • {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/dashboard">
                    <DropdownMenuItem className="cursor-pointer transition-colors duration-200">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/chatbot">
                    <DropdownMenuItem className="cursor-pointer transition-colors duration-200">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Chatbot
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <Link href="/">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive cursor-pointer transition-colors duration-200"
                      onClick={() => logout.mutate()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="hidden sm:flex font-medium btn-hover rounded-xl">Log in</Button>
                </Link>
                <Link href="/register">
                  <Button className="font-medium bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all btn-hover rounded-xl">
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
                  <NavLink href="/tutors" icon={GraduationCap}>Find Tutors</NavLink>
                  <NavLink href="/jobs" icon={Briefcase}>Job Board</NavLink>
                  <NavLink href="/books" icon={BookOpen}>Book Market</NavLink>
                  <NavLink href="/chatbot" icon={MessageSquareMore}>Assistance</NavLink>
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
      <footer className="border-t border-border/40 bg-background py-8 animate-slide-in-from-bottom">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground">
          <p>© 2026 EduConnect. Empowering education everywhere.</p>
        </div>
      </footer>
    </div>
  );
}
