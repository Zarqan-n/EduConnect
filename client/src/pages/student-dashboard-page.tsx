import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LayoutShell } from "@/components/layout-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Settings, UserCircle, Briefcase, Book, GraduationCap } from "lucide-react";
import { StudentDashboard } from "@/components/student-dashboard";
import { StudentEnrolledTutors } from "@/components/student-enrolled-tutors";
import { DashboardPageSkeleton, StatCardSkeleton } from "@/components/dashboard-skeletons";
import { Suspense, lazy, useState, useEffect } from "react";

// Lazy load components
const LazyStudentEnrolledTutors = lazy(() => 
  import("@/components/student-enrolled-tutors").then(mod => ({ default: mod.StudentEnrolledTutors }))
);
const LazyStudentDashboard = lazy(() =>
  import("@/components/student-dashboard").then(mod => ({ default: mod.StudentDashboard }))
);

export default function StudentDashboardPage() {
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

        {/* My Teachers Section - Lazy loaded */}
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">💼 Your Enrolled Teachers</h2>
          <Suspense fallback={<div className="space-y-3"><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></div>}>
            <StudentEnrolledTutors />
          </Suspense>
        </div>

        {/* Explore Tuitions Section - Lazy loaded */}
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2"><GraduationCap className="w-6 h-6" /> Browse Tuitions</h2>
          <Suspense fallback={<DashboardPageSkeleton />}>
            <StudentDashboard />
          </Suspense>
        </div>
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
