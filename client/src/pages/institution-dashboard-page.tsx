import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LayoutShell } from "@/components/layout-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateJob } from "@/hooks/use-jobs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertJobSchema } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Settings, UserCircle, Briefcase, Book, Globe, MapPin as MapPinIcon, Loader2 } from "lucide-react";
import { useState, useEffect, Suspense, lazy } from "react";
import { StudentDashboard } from "@/components/student-dashboard";
import { DashboardPageSkeleton, StatCardSkeleton } from "@/components/dashboard-skeletons";

// Lazy load heavy components
const LazyStudentDashboard = lazy(() =>
  import("@/components/student-dashboard").then(mod => ({ default: mod.StudentDashboard }))
);

export default function InstitutionDashboardPage() {
  const { user } = useAuth();
  const [isScrollSmooth, setIsScrollSmooth] = useState(false);

  useEffect(() => {
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = "smooth";
    setIsScrollSmooth(true);

    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  if (!user) return <div>Access Denied</div>;

  return (
    <LayoutShell>
      <div className="space-y-8">
        {/* Header - Loads immediately */}
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
            <Link href="/profile?tab=settings">
              <Button variant="outline" className="gap-2 rounded-xl btn-hover animate-slide-in-from-right bg-white hover:bg-gray-50 border-gray-200">
                <Settings className="w-4 h-4" /> <span className="hidden md:flex">Settings</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Welcome Card - Loads immediately */}
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
        <InstitutionActions />
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

function InstitutionActions() {
  const { user } = useAuth();
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
      workingTimeStart: "8:00 AM",
      workingTimeEnd: "4:00 PM",
      workingDays: "Monday to Friday",
      status: "open" as const
    }
  });

  const onSubmit = (data: any) => {
    createJob.mutate(data, {
      onSuccess: () => form.reset()
    });
  };

  const workingTimeOptions = [
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM"
  ];
  const workingTimeStartOptions = [
    "6:00 AM",
    "7:00 AM",
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM"
  ];

  const workingDaysOptions = [
    "Monday to Friday",
    "Monday to Saturday",
    "Monday to Sunday",
    "Saturday to Sunday",
    "Custom"
  ];

  return (
    <Card className="bg-gradient-to-br from-orange-50/50 to-amber-50/30 border-orange-200 border-l-4 border-l-orange-500">
      <CardHeader>
        <CardTitle className="text-orange-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Institution Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="manage-teachers" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-orange-100">
            <TabsTrigger value="manage-teachers" className="text-orange-900">Manage Teachers</TabsTrigger>
            <TabsTrigger value="post-vacancy" className="text-orange-900">Post Vacancy</TabsTrigger>
          </TabsList>

          {/* Manage Teachers Tab */}
          <TabsContent value="manage-teachers" className="space-y-4 mt-4">
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Briefcase className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="font-semibold text-gray-700 mb-1">No teachers assigned yet</p>
              <p className="text-sm text-gray-600">Teachers management features coming soon</p>
            </div>
          </TabsContent>

          {/* Post Vacancy Tab */}
          <TabsContent value="post-vacancy" className="space-y-4 mt-4">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-orange-900 font-semibold">Job Title <span className="text-red-500">*</span></Label>
                  <Input {...form.register("title")} placeholder="Math Teacher" className="focus-glow border-orange-200" />
                  {form.formState.errors.title && <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-orange-900 font-semibold">Subject <span className="text-red-500">*</span></Label>
                  <Input {...form.register("subject")} placeholder="Mathematics" className="focus-glow border-orange-200" />
                  {form.formState.errors.subject && <p className="text-red-500 text-sm">{form.formState.errors.subject.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-orange-900 font-semibold">Salary Range <span className="text-red-500">*</span></Label>
                  <Input {...form.register("salaryRange")} placeholder="₹20k - ₹50k" className="focus-glow border-orange-200" />
                  {form.formState.errors.salaryRange && <p className="text-red-500 text-sm">{form.formState.errors.salaryRange.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-orange-900 font-semibold">Experience Required <span className="text-red-500">*</span></Label>
                  <Input {...form.register("experience", { valueAsNumber: true })} type="number" placeholder="5" className="focus-glow border-orange-200" />
                  {form.formState.errors.experience && <p className="text-red-500 text-sm">{form.formState.errors.experience.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-orange-900 font-semibold">Location <span className="text-red-500">*</span></Label>
                <Input {...form.register("location")} placeholder="New Delhi" className="focus-glow border-orange-200" />
                {form.formState.errors.location && <p className="text-red-500 text-sm">{form.formState.errors.location.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-orange-900 font-semibold">Working Time Start <span className="text-red-500">*</span></Label>
                  <select {...form.register("workingTimeStart")} className="w-full p-2 rounded-md border border-orange-200 focus-glow">
                    {workingTimeStartOptions.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {form.formState.errors.workingTimeStart && <p className="text-red-500 text-sm">{form.formState.errors.workingTimeStart.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-orange-900 font-semibold">Working Time End <span className="text-red-500">*</span></Label>
                  <select {...form.register("workingTimeEnd")} className="w-full p-2 rounded-md border border-orange-200 focus-glow">
                    {workingTimeOptions.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {form.formState.errors.workingTimeEnd && <p className="text-red-500 text-sm">{form.formState.errors.workingTimeEnd.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-orange-900 font-semibold">Working Days <span className="text-red-500">*</span></Label>
                <select {...form.register("workingDays")} className="w-full p-2 rounded-md border border-orange-200 focus-glow">
                  {workingDaysOptions.map(days => (
                    <option key={days} value={days}>{days}</option>
                  ))}
                </select>
                {form.formState.errors.workingDays && <p className="text-red-500 text-sm">{form.formState.errors.workingDays.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-orange-900 font-semibold">Requirements & Qualifications <span className="text-red-500">*</span></Label>
                <Textarea {...form.register("qualification")} placeholder="Educational qualifications, skills, and other requirements..." className="focus-glow border-orange-200 h-24" />
                {form.formState.errors.qualification && <p className="text-red-500 text-sm">{form.formState.errors.qualification.message}</p>}
              </div>
              <Button disabled={form.formState.isSubmitting} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 spin-smooth" />}
                Post Job
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
