import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LayoutShell } from "@/components/layout-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTutors, useCreateTutorProfile } from "@/hooks/use-tutors";
import { useJobs, useCreateJob } from "@/hooks/use-jobs";
import { useBooks, useCreateBook } from "@/hooks/use-books";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTutorProfileSchema, insertJobSchema, insertBookSchema } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Loader2, Plus, UserCircle, Briefcase, Book, Settings } from "lucide-react";
import { z } from "zod";
import { useState } from "react";
import { SettingsModal } from "@/components/settings-modal";
import { StudentDashboard } from "@/components/student-dashboard";

export default function Dashboard() {
  const { user } = useAuth();
  
  if (!user) return <div>Access Denied</div>;

  return (
    <LayoutShell>
      <div className="space-y-8">
        <div className="gradient-primary rounded-3xl p-8 flex items-center justify-between">
          <h1 className="text-3xl font-heading font-bold header-gradient-text animate-slide-in-from-left">Dashboard</h1>
          <div className="flex items-center gap-3">
            <Link href="/chatbot">
              <Button
                variant="outline"
                className="gap-2 rounded-xl btn-hover animate-slide-in-from-right bg-white hover:bg-gray-50 border-gray-200"
              >
                <Bot className="w-4 h-4" /> <span className="hidden md:flex">Assistant</span>
              </Button>
            </Link>
            <SettingsModal>
              <Button variant="outline" className="gap-2 rounded-xl btn-hover animate-slide-in-from-right bg-white hover:bg-gray-50 border-gray-200">
                <Settings className="w-4 h-4" /> <span className="hidden md:flex">Settings</span>
              </Button>
            </SettingsModal>
          </div>
        </div>

        {user.role === "student" ? (
          <>
            <Card className="card-hover animate-scale-in bg-gradient-to-br from-blue-50/50 to-indigo-50/30 border-blue-200 border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-blue-900">Welcome back, {user.name}!</CardTitle>
                <CardDescription className="text-blue-800">
                  You are logged in as a <span className="font-semibold text-blue-600 capitalize">{user.role}</span>.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="stagger-item">
                    <StatCard title="Role" value={user.role} icon={UserCircle} color="blue" />

                  </div>
                  <div className="stagger-item">
                    <StatCard title="Location" value={user.location || "N/A"} icon={Briefcase} color="green" />
                  </div>
                  <div className="stagger-item">
                    <StatCard title="Member Since" value={new Date().getFullYear().toString()} icon={Book} color="orange" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="explore" className="w-full animate-slide-in-from-bottom">
              <TabsList className="grid w-full grid-cols-2 rounded-xl">
                <TabsTrigger value="explore" className="rounded-lg transition-all duration-300">Explore</TabsTrigger>
                <TabsTrigger value="sell" className="rounded-lg transition-all duration-300">Sell Books</TabsTrigger>
              </TabsList>

              <TabsContent value="explore" className="mt-6">
                <div className="mt-6">
                  <StudentDashboard />
                </div>
              </TabsContent>

              <TabsContent value="sell" className="mt-6">
                <SellerActions />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Tabs defaultValue="overview" className="w-full animate-slide-in-from-bottom">
            <TabsList className="grid w-full grid-cols-2 lg:w-[400px] rounded-xl">
              <TabsTrigger value="overview" className="rounded-lg transition-all duration-300">Overview</TabsTrigger>
              <TabsTrigger value="actions" className="rounded-lg transition-all duration-300">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6 animate-fade-in">
              <Card className="card-hover animate-scale-in bg-gradient-to-br from-purple-50/50 to-violet-50/30 border-purple-200 border-l-4 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="text-purple-900">Welcome back, {user.name}!</CardTitle>
                  <CardDescription className="text-purple-800">
                    You are logged in as a <span className="font-semibold text-purple-600 capitalize">{user.role}</span>.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="stagger-item">
                      <StatCard title="Role" value={user.role} icon={UserCircle} color="purple" />
                    </div>
                    <div className="stagger-item">
                      <StatCard title="Location" value={user.location || "N/A"} icon={Briefcase} color="blue" />
                    </div>
                    <div className="stagger-item">
                      <StatCard title="Member Since" value={new Date().getFullYear().toString()} icon={Book} color="green" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="mt-6 space-y-6 animate-fade-in">
              {user.role === "teacher" && (
                <>
                  <TeacherActions />
                  <SellerActions />
                  <div className="mt-6">
                    <StudentDashboard showStudents={true} title="Students Nearby" description="Locate students for in-person sessions" />
                  </div>
                </>
              )}
              {user.role === "institution" && (
                <>
                  <InstitutionActions />
                  <SellerActions />
                </>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </LayoutShell>
  );
}

function StatCard({ title, value, icon: Icon, color = "blue" }: any) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    orange: "bg-orange-100 text-orange-700",
    purple: "bg-purple-100 text-purple-700",
  };
  
  const bgClasses = {
    blue: "bg-gradient-to-br from-blue-50 to-indigo-50/30 border-blue-200",
    green: "bg-gradient-to-br from-green-50 to-emerald-50/30 border-green-200",
    orange: "bg-gradient-to-br from-orange-50 to-amber-50/30 border-orange-200",
    purple: "bg-gradient-to-br from-purple-50 to-violet-50/30 border-purple-200",
  };
  
  const textClasses = {
    blue: "text-blue-900",
    green: "text-green-900",
    orange: "text-orange-900",
    purple: "text-purple-900",
  };

  return (
    <div className={`p-6 ${bgClasses[color as keyof typeof bgClasses]} rounded-xl border flex items-center gap-4 hover:shadow-lg transition-shadow`}>
      <div className={`h-12 w-12 rounded-full ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className={`text-xl font-bold capitalize ${textClasses[color as keyof typeof textClasses]}`}>{value}</p>
      </div>
    </div>
  );
}

// === Action Components for each Role ===

function TeacherActions() {
  const createProfile = useCreateTutorProfile();
  // Simple form state for MVP - in real app use react-hook-form
  const [rate, setRate] = useState("3000");
  const [subjects, setSubjects] = useState("Math, Science");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProfile.mutate({
      hourlyRate: parseInt(rate),
      subjects: subjects.split(",").map(s => s.trim()),
      experience: 5,
      mode: "online",
      rating: 50, // Initial rating
      classes: ["Grade 10", "Grade 11"]
    });
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 border-blue-200 border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="text-blue-900">Tutor Profile</CardTitle>
        <CardDescription className="text-blue-800">Manage your public tutor listing.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div className="space-y-2">
            <Label className="text-blue-900 font-semibold">Monthly Rate (₹)</Label>
            <Input value={rate} onChange={e => setRate(e.target.value)} type="number" className="focus-glow border-blue-200" />
          </div>
          <div className="space-y-2">
            <Label className="text-blue-900 font-semibold">Subjects (comma separated)</Label>
            <Input value={subjects} onChange={e => setSubjects(e.target.value)} className="focus-glow border-blue-200" />
          </div>
          <Button disabled={createProfile.isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
            {createProfile.isPending && <Loader2 className="mr-2 h-4 w-4 spin-smooth" />}
            Update Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function InstitutionActions() {
  const createJob = useCreateJob();
  const form = useForm({
    resolver: zodResolver(insertJobSchema.omit({ institutionId: true })),
    defaultValues: {
      title: "",
      subject: "",
      qualification: "",
      salaryRange: "",
      experience: 0,
      location: "",
      status: "open" as const
    }
  });

  const onSubmit = (data: any) => {
    createJob.mutate(data, {
      onSuccess: () => form.reset()
    });
  };

  return (
    <Card className="bg-gradient-to-br from-orange-50/50 to-amber-50/30 border-orange-200 border-l-4 border-l-orange-500">
      <CardHeader>
        <CardTitle className="text-orange-900">Post a New Job</CardTitle>
        <CardDescription className="text-orange-800">Create a new teaching vacancy.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-orange-900 font-semibold">Job Title</Label>
              <Input {...form.register("title")} placeholder="Math Teacher" className="focus-glow border-orange-200" />
            </div>
            <div className="space-y-2">
              <Label className="text-orange-900 font-semibold">Subject</Label>
              <Input {...form.register("subject")} placeholder="Mathematics" className="focus-glow border-orange-200" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-orange-900 font-semibold">Salary Range</Label>
            <Input {...form.register("salaryRange")} placeholder="₹20k - ₹50k" className="focus-glow border-orange-200" />
          </div>
          <div className="space-y-2">
            <Label className="text-orange-900 font-semibold">Requirements</Label>
            <Textarea {...form.register("qualification")} placeholder="Details..." className="focus-glow border-orange-200" />
          </div>
          <Button disabled={createJob.isPending} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
            {createJob.isPending && <Loader2 className="mr-2 h-4 w-4 spin-smooth" />}
            Post Job
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function SellerActions() {
  const createBook = useCreateBook();
  const form = useForm({
    resolver: zodResolver(insertBookSchema.omit({ sellerId: true })),
    defaultValues: {
      title: "",
      subject: "",
      classLevel: "",
      price: 0,
      condition: "good" as const,
      location: "",
      description: "",
      sold: false
    }
  });

  const onSubmit = (data: any) => {
    createBook.mutate(data, {
      onSuccess: () => form.reset()
    });
  };

  return (
    <Card className="bg-gradient-to-br from-green-50/50 to-emerald-50/30 border-green-200 border-l-4 border-l-green-500">
      <CardHeader>
        <CardTitle className="text-green-900">List a Book</CardTitle>
        <CardDescription className="text-green-800">Sell your used textbooks.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-green-900 font-semibold">Book Title</Label>
              <Input {...form.register("title")} placeholder="Calculus 101" className="focus-glow border-green-200" />
            </div>
            <div className="space-y-2">
              <Label className="text-green-900 font-semibold">Price (₹)</Label>
              <Input {...form.register("price", { valueAsNumber: true })} type="number" className="focus-glow border-green-200" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-green-900 font-semibold">Condition</Label>
            <Input {...form.register("condition")} placeholder="new, like_new, good, fair, poor" className="focus-glow border-green-200" />
          </div>
          <div className="space-y-2">
            <Label className="text-green-900 font-semibold">Description</Label>
            <Textarea {...form.register("description")} placeholder="Details about the book..." className="focus-glow border-green-200" />
          </div>
          <Button disabled={createBook.isPending} className="w-full bg-green-600 hover:bg-green-700 text-white">
            {createBook.isPending && <Loader2 className="mr-2 h-4 w-4 spin-smooth" />}
            List Book
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
