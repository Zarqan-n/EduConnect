import { useAuth } from "@/hooks/use-auth";
import StudentDashboardPage from "./student-dashboard-page";
import TeacherDashboardPage from "./teacher-dashboard-page";
import InstitutionDashboardPage from "./institution-dashboard-page";
import AdminPage from "./admin";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return <div>Access Denied</div>;

  switch (user.role) {
    case "student":
      return <StudentDashboardPage />;
    case "teacher":
      return <TeacherDashboardPage />;
    case "institution":
      return <InstitutionDashboardPage />;
    case "admin":
      return <AdminPage />;
    default:
      return <div>Unknown User Role</div>;
  }
}
