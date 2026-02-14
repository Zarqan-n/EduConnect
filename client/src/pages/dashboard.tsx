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
import { Loader2, Plus, UserCircle, Briefcase, Book, Settings } from "lucide-react";
import { z } from "zod";

export default function Dashboard() {
  const { user } = useAuth();
  
  if (!user) return <div>Access Denied</div>;

  return (
    <LayoutShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-heading font-bold">Dashboard</h1>
          <Button variant="outline" className="gap-2 rounded-xl">
            <Settings className="w-4 h-4" /> Settings
          </Button>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px] rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
            <TabsTrigger value="actions" className="rounded-lg">Actions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Welcome back, {user.name}!</CardTitle>
                <CardDescription>
                  You are logged in as a <span className="font-semibold text-primary capitalize">{user.role}</span>.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard title="Role" value={user.role} icon={UserCircle} />
                  <StatCard title="Location" value={user.location || "N/A"} icon={Briefcase} />
                  <StatCard title="Member Since" value={new Date().getFullYear().toString()} icon={Book} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="mt-6">
            {user.role === "teacher" && <TeacherActions />}
            {user.role === "institution" && <InstitutionActions />}
            {user.role === "seller" && <SellerActions />}
            {user.role === "student" && (
              <Card>
                <CardHeader>
                  <CardTitle>Student Dashboard</CardTitle>
                  <CardDescription>Track your learning progress.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">You can search for tutors and buy books using the navigation menu.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </LayoutShell>
  );
}

function StatCard({ title, value, icon: Icon }: any) {
  return (
    <div className="p-6 bg-secondary/30 rounded-xl border border-border flex items-center gap-4">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-xl font-bold capitalize">{value}</p>
      </div>
    </div>
  );
}

// === Action Components for each Role ===

function TeacherActions() {
  const createProfile = useCreateTutorProfile();
  // Simple form state for MVP - in real app use react-hook-form
  const [rate, setRate] = useState("30");
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
    <Card>
      <CardHeader>
        <CardTitle>Tutor Profile</CardTitle>
        <CardDescription>Manage your public tutor listing.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div className="space-y-2">
            <Label>Hourly Rate ($)</Label>
            <Input value={rate} onChange={e => setRate(e.target.value)} type="number" />
          </div>
          <div className="space-y-2">
            <Label>Subjects (comma separated)</Label>
            <Input value={subjects} onChange={e => setSubjects(e.target.value)} />
          </div>
          <Button disabled={createProfile.isPending}>
            {createProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
    <Card>
      <CardHeader>
        <CardTitle>Post a New Job</CardTitle>
        <CardDescription>Create a new teaching vacancy.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input {...form.register("title")} placeholder="Math Teacher" />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input {...form.register("subject")} placeholder="Mathematics" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Salary Range</Label>
            <Input {...form.register("salaryRange")} placeholder="$40k - $60k" />
          </div>
          <div className="space-y-2">
            <Label>Requirements</Label>
            <Textarea {...form.register("qualification")} placeholder="Details..." />
          </div>
          <Button disabled={createJob.isPending} className="w-full">
            {createJob.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
    <Card>
      <CardHeader>
        <CardTitle>List a Book</CardTitle>
        <CardDescription>Sell your used textbooks.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Book Title</Label>
              <Input {...form.register("title")} placeholder="Calculus 101" />
            </div>
            <div className="space-y-2">
              <Label>Price ($)</Label>
              <Input {...form.register("price", { valueAsNumber: true })} type="number" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Condition</Label>
            <Input {...form.register("condition")} placeholder="new, like_new, good, fair, poor" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea {...form.register("description")} placeholder="Details about the book..." />
          </div>
          <Button disabled={createBook.isPending} className="w-full">
            {createBook.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            List Book
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
