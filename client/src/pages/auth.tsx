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
import { Loader2, MapPin, BookOpen, Users, GraduationCap } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

// ── Login schema ────────────────────────────────────────────
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// ── Student Register schema ──────────────────────────────────
const studentRegisterSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  location: z.string().min(1, "Location is required"),
  educationLevel: z.string().min(1, "Education level is required"),
  interestedSubjects: z.string().min(1, "Please enter at least one subject"),
  bio: z.string().optional(),
});

// ── Teacher Register schema ──────────────────────────────────
const teacherRegisterSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  location: z.string().min(1, "Location is required"),
  subjects: z.string().min(1, "Please enter at least one subject"),
  classes: z.string().min(1, "Please enter classes you teach"),
  experience: z.string().min(1, "Experience is required"),
  monthlyRate: z.string().optional(),
  mode: z.enum(["online", "home", "both"], { required_error: "Please select a mode" }),
  timings: z.string().min(1, "Availability timings are required"),
  qualifications: z.string().min(1, "Qualifications are required"),
  languages: z.string().min(1, "Please enter languages you speak"),
  bio: z.string().optional(),
});

// ── Institution Register schema ──────────────────────────────
const institutionRegisterSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  name: z.string().min(1, "Institution name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  location: z.string().min(1, "Location is required"),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  type: z.string().min(1, "Institution type is required"),
  directorName: z.string().min(1, "Director name is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  staffCount: z.string().min(1, "Staff count is required"),
  foundedYear: z.string().min(4, "Founded year is required"),
  specializations: z.string().min(1, "Please enter specializations"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  accreditation: z.string().optional(),
});

type StudentRegisterData = z.infer<typeof studentRegisterSchema>;
type TeacherRegisterData = z.infer<typeof teacherRegisterSchema>;
type InstitutionRegisterData = z.infer<typeof institutionRegisterSchema>;

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
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher" | "institution" | null>(null);

  if (!selectedRole) {
    return <RoleSelection onSelectRole={setSelectedRole} />;
  }

  if (selectedRole === "student") {
    return <StudentRegister onBack={() => setSelectedRole(null)} />;
  }

  if (selectedRole === "teacher") {
    return <TeacherRegister onBack={() => setSelectedRole(null)} />;
  }

  if (selectedRole === "institution") {
    return <InstitutionRegister onBack={() => setSelectedRole(null)} />;
  }
}

// ── Role Selection Component ─────────────────────────────────
function RoleSelection({ onSelectRole }: { onSelectRole: (role: "student" | "teacher" | "institution") => void }) {
  return (
    <LayoutShell>
      <div className="flex items-center justify-center min-h-[70vh] py-10">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12 animate-slide-in-from-top">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">Join EduConnect</h1>
            <p className="text-lg text-muted-foreground">Choose your role to get started</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Card */}
            <Card className="cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 card-hover animate-scale-in" onClick={() => onSelectRole("student")}>
              <CardHeader className="text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-blue-700 dark:text-blue-400">Student</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-sm text-muted-foreground mb-4">
                  Learn from experienced tutors, find resources, and connect with teachers
                </p>
                <Button className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white btn-hover">
                  Continue as Student
                </Button>
              </CardContent>
            </Card>

            {/* Teacher Card */}
            <Card className="cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 card-hover animate-scale-in" style={{ animationDelay: '0.1s' }} onClick={() => onSelectRole("teacher")}>
              <CardHeader className="text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-orange-700 dark:text-orange-400">Teacher</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-sm text-muted-foreground mb-4">
                  Share your expertise, offer tuition, and earn from your knowledge
                </p>
                <Button className="w-full rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white btn-hover">
                  Continue as Teacher
                </Button>
              </CardContent>
            </Card>

            {/* Institution Card */}
            <Card className="cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-green-500 hover:bg-green-50/50 dark:hover:bg-green-950/20 card-hover animate-scale-in" style={{ animationDelay: '0.2s' }} onClick={() => onSelectRole("institution")}>
              <CardHeader className="text-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-green-700 dark:text-green-400">Institution</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-sm text-muted-foreground mb-4">
                  Post jobs, manage your team, and grow your educational organization
                </p>
                <Button className="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white btn-hover">
                  Continue as Institution
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}

// ── Student Registration Form ────────────────────────────────
function StudentRegister({ onBack }: { onBack: () => void }) {
  const [, setLocation] = useLocation();
  const { register } = useAuth();

  const form = useForm<StudentRegisterData>({
    resolver: zodResolver(studentRegisterSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
      phone: "",
      location: "",
      educationLevel: "",
      interestedSubjects: "",
      bio: "",
    },
  });

  const onSubmit = (data: StudentRegisterData) => {
    register.mutate({
      username: data.username,
      password: data.password,
      name: data.name,
      email: data.email,
      role: "student",
      location: data.location,
      bio: data.bio,
      phone: data.phone,
      educationLevel: data.educationLevel,
      interestedSubjects: data.interestedSubjects,
    } as any, {
      onSuccess: () => setLocation("/dashboard"),
    });
  };

  return (
    <LayoutShell>
      <div className="flex items-center justify-center min-h-[80vh] py-10">
        <Card className="w-full max-w-2xl shadow-2xl border-border/60 bg-card/50 backdrop-blur-sm card-hover animate-scale-in">
          <CardHeader className="space-y-1 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Student Registration</CardTitle>
                <CardDescription>Create your student account to find tutors and courses</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
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
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="+91 98765 43210" {...field} className="rounded-xl focus-glow" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="rounded-xl focus-glow" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <FormField
                    control={form.control}
                    name="educationLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Education Level <span className="text-red-500">*</span></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl focus-glow">
                              <SelectValue placeholder="Select education level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="class-6-8">Class 6-8</SelectItem>
                            <SelectItem value="class-9-10">Class 9-10</SelectItem>
                            <SelectItem value="class-11-12">Class 11-12</SelectItem>
                            <SelectItem value="undergraduate">Undergraduate</SelectItem>
                            <SelectItem value="postgraduate">Postgraduate</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="interestedSubjects"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interested Subjects <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Mathematics, Physics, English (comma-separated)" {...field} className="rounded-xl focus-glow" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio <span className="text-muted-foreground text-xs">(Optional)</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Tell us about yourself..." {...field} className="rounded-xl focus-glow" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={onBack}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white btn-hover"
                    disabled={register.isPending}
                  >
                    {register.isPending && <Loader2 className="mr-2 h-4 w-4 spin-smooth" />}
                    Create Account
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </LayoutShell>
  );
}

// ── Teacher Registration Form ────────────────────────────────
function TeacherRegister({ onBack }: { onBack: () => void }) {
  const [, setLocation] = useLocation();
  const { register } = useAuth();

  const form = useForm<TeacherRegisterData>({
    resolver: zodResolver(teacherRegisterSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
      phone: "",
      location: "",
      subjects: "",
      classes: "",
      experience: "",
      monthlyRate: "",
      mode: "online",
      timings: "",
      qualifications: "",
      languages: "",
      bio: "",
    },
  });

  const onSubmit = (data: TeacherRegisterData) => {
    register.mutate({
      username: data.username,
      password: data.password,
      name: data.name,
      email: data.email,
      role: "teacher",
      location: data.location,
      bio: data.bio,
      phone: data.phone,
      subjects: data.subjects,
      classes: data.classes,
      experience: data.experience,
      mode: data.mode,
      timings: data.timings,
      qualifications: data.qualifications,
      languages: data.languages,
    } as any, {
      onSuccess: () => setLocation("/dashboard"),
    });
  };

  return (
    <LayoutShell>
      <div className="flex items-center justify-center min-h-[100vh] py-10">
        <Card className="w-full max-w-3xl shadow-2xl border-border/60 bg-card/50 backdrop-blur-sm card-hover animate-scale-in">
          <CardHeader className="space-y-1 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Teacher Registration</CardTitle>
                <CardDescription>Create your teacher account and start earning</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
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
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="+91 98765 43210" {...field} className="rounded-xl focus-glow" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="rounded-xl focus-glow" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="5" {...field} className="rounded-xl focus-glow" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="subjects"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subjects <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Mathematics, Physics (comma-separated)" {...field} className="rounded-xl focus-glow" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="classes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Classes <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Class 9, 10, 11, 12 (comma-separated)" {...field} className="rounded-xl focus-glow" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teaching Mode <span className="text-red-500">*</span></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl focus-glow">
                              <SelectValue placeholder="Select mode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="online">Online</SelectItem>
                            <SelectItem value="home">Home Tuition</SelectItem>
                            <SelectItem value="both">Both Online & Home</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="timings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Availability <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Mon-Fri 6-9 PM, Sat 10 AM-2 PM" {...field} className="rounded-xl focus-glow" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="languages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Languages <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. English, Hindi, Marathi (comma-separated)" {...field} className="rounded-xl focus-glow" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="qualifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualifications <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. B.Sc Physics, M.Sc Mathematics, B.Ed" {...field} className="rounded-xl focus-glow" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio <span className="text-muted-foreground text-xs">(Optional)</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Tell us about your teaching experience..." {...field} className="rounded-xl focus-glow" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={onBack}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 rounded-xl font-semibold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white btn-hover"
                    disabled={register.isPending}
                  >
                    {register.isPending && <Loader2 className="mr-2 h-4 w-4 spin-smooth" />}
                    Create Account
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </LayoutShell>
  );
}

// ── Institution Registration Form ────────────────────────────
function InstitutionRegister({ onBack }: { onBack: () => void }) {
  const [, setLocation] = useLocation();
  const { register } = useAuth();

  const form = useForm<InstitutionRegisterData>({
    resolver: zodResolver(institutionRegisterSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      type: "",
      directorName: "",
      contactPerson: "",
      staffCount: "",
      foundedYear: "",
      specializations: "",
      description: "",
      accreditation: "",
    },
  });

  const onSubmit = (data: InstitutionRegisterData) => {
    register.mutate({
      username: data.username,
      password: data.password,
      name: data.name,
      email: data.email,
      role: "institution",
      location: data.location,
      phone: data.phone,
      website: data.website,
      type: data.type,
      directorName: data.directorName,
      contactPerson: data.contactPerson,
      staffCount: data.staffCount,
      foundedYear: data.foundedYear,
      specializations: data.specializations,
      description: data.description,
      accreditation: data.accreditation,
    } as any, {
      onSuccess: () => setLocation("/dashboard"),
    });
  };

  return (
    <LayoutShell>
      <div className="flex items-center justify-center min-h-[100vh] py-10">
        <Card className="w-full max-w-3xl shadow-2xl border-border/60 bg-card/50 backdrop-blur-sm card-hover animate-scale-in">
          <CardHeader className="space-y-1 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Institution Registration</CardTitle>
                <CardDescription>Register your institution and start hiring teachers</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Institution Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="ABC Coaching Center" {...field} className="rounded-xl focus-glow" />
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
                          <Input placeholder="abccoaching" {...field} className="rounded-xl focus-glow" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="info@abccoaching.com" {...field} className="rounded-xl focus-glow" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="+91 98765 43210" {...field} className="rounded-xl focus-glow" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="rounded-xl focus-glow" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website <span className="text-muted-foreground text-xs">(Optional)</span></FormLabel>
                        <FormControl>
                          <Input type="url" placeholder="https://example.com" {...field} className="rounded-xl focus-glow" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Institution Type <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. School, Coaching Center, Tutoring Agency" {...field} className="rounded-xl focus-glow" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="foundedYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Founded Year <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="2020" {...field} className="rounded-xl focus-glow" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="directorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Director Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Mr. John Smith" {...field} className="rounded-xl focus-glow" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Ms. Jane Doe" {...field} className="rounded-xl focus-glow" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="staffCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Staff Count <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="50" {...field} className="rounded-xl focus-glow" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accreditation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accreditation <span className="text-muted-foreground text-xs">(Optional)</span></FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. CBSE Affiliated, ISO Certified" {...field} className="rounded-xl focus-glow" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="specializations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specializations <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. IIT Coaching, NEET Prep, JEE Advanced (comma-separated)" {...field} className="rounded-xl focus-glow" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tell us about your institution, its mission, and achievements..." {...field} className="rounded-xl focus-glow min-h-24" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={onBack}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 rounded-xl font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white btn-hover"
                    disabled={register.isPending}
                  >
                    {register.isPending && <Loader2 className="mr-2 h-4 w-4 spin-smooth" />}
                    Create Account
                  </Button>
                </div>
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
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((suggestion, idx) => (
            <div
              key={idx}
              className="px-3 py-2 hover:bg-muted cursor-pointer text-sm border-b last:border-b-0"
              onClick={() => {
                onChange(suggestion.displayName);
                setShowSuggestions(false);
              }}
            >
              <div className="font-medium text-foreground">{suggestion.displayName}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
