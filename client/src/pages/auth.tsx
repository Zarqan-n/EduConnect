import { useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutShell } from "@/components/layout-shell";
import { Loader2, MapPin } from "lucide-react";

// ── Login schema ────────────────────────────────────────────
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// ── Register schema (all required except bio) ───────────────
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email"),
  role: z.enum(["student", "teacher", "institution"], { required_error: "Please select a role" }),
  location: z.string().min(1, "Location is required"),
  bio: z.string().optional(),
});

type RegisterData = z.infer<typeof registerSchema>;

export function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    login.mutate(data, {
      onSuccess: () => setLocation("/dashboard"),
    });
  };

  return (
    <LayoutShell>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md shadow-2xl border-border/60 bg-card/50 backdrop-blur-sm card-hover animate-scale-in">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center animate-slide-in-from-top">Welcome back</CardTitle>
            <CardDescription className="text-center animate-slide-in-from-top" style={{ animationDelay: '0.1s' }}>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="animate-slide-in-from-left" style={{ animationDelay: '0.2s' }}>
                      <FormLabel>Username <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe" {...field} className="h-11 rounded-xl focus-glow" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="animate-slide-in-from-left" style={{ animationDelay: '0.3s' }}>
                      <FormLabel>Password <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="h-11 rounded-xl focus-glow" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl font-semibold btn-hover animate-slide-in-from-bottom"
                  disabled={login.isPending}
                >
                  {login.isPending && <Loader2 className="mr-2 h-4 w-4 spin-smooth" />}
                  Sign In
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </LayoutShell>
  );
}

export function Register() {
  const [, setLocation] = useLocation();
  const { register } = useAuth();

  const form = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
      role: "student",
      location: "",
      bio: "",
    },
  });

  const onSubmit = (data: RegisterData) => {
    register.mutate(data as any, {
      onSuccess: () => setLocation("/dashboard"),
    });
  };

  return (
    <LayoutShell>
      <div className="flex items-center justify-center min-h-[60vh] py-10">
        <Card className="w-full max-w-lg shadow-2xl border-border/60 bg-card/50 backdrop-blur-sm card-hover animate-scale-in">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center animate-slide-in-from-top">Create an account</CardTitle>
            <CardDescription className="text-center animate-slide-in-from-top" style={{ animationDelay: '0.1s' }}>
              Join the educational community today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4 stagger-item">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} className="rounded-xl focus-glow" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} className="rounded-xl focus-glow" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="stagger-item">
                      <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} className="rounded-xl focus-glow" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="stagger-item">
                      <FormLabel>Password <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="rounded-xl focus-glow" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4 stagger-item">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>I am a... <span className="text-red-500">*</span></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl focus-glow">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="institution">Institution</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <LocationAutocomplete
                            value={field.value || ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem className="stagger-item">
                      <FormLabel>Bio <span className="text-muted-foreground text-xs">(Optional)</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Tell us a bit about yourself..." {...field} className="rounded-xl focus-glow" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl font-semibold mt-4 btn-hover animate-slide-in-from-bottom"
                  disabled={register.isPending}
                >
                  {register.isPending && <Loader2 className="mr-2 h-4 w-4 spin-smooth" />}
                  Create Account
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </LayoutShell>
  );
}

/* ── Location Autocomplete ──────────────────────────────────── */

interface LocationSuggestion {
  displayName: string;
  address: string;
}

function LocationAutocomplete({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) { setSuggestions([]); return; }
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await res.json();
      setSuggestions(
        data.map((item: any) => ({
          displayName: item.display_name.split(",").slice(0, 2).join(",").trim(),
          address: item.display_name,
        }))
      );
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { if (value) fetchSuggestions(value); }, 350);
    return () => clearTimeout(timer);
  }, [value, fetchSuggestions]);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Input
          placeholder="Search city..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          className="rounded-xl focus-glow pr-8"
        />
        {isSearching ? (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        ) : (
          <MapPin className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        )}
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onChange(s.displayName);
                setShowSuggestions(false);
                setSuggestions([]);
              }}
              className="w-full px-3 py-2.5 text-left hover:bg-secondary/50 transition-colors border-b last:border-b-0 flex items-start gap-2 text-sm"
            >
              <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{s.displayName}</div>
                <div className="text-xs text-muted-foreground truncate">{s.address}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
