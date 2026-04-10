import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import { LayoutShell } from "@/components/layout-shell";
import { StatsRowSkeleton, TableCardSkeleton } from "@/components/app-skeletons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Users,
    Briefcase,
    BookOpen,
    GraduationCap,
    Trash2,
    Loader2,
    ShieldAlert,
    Shield,
} from "lucide-react";
import { Redirect } from "wouter";

export default function AdminPage() {
    const { user, isLoading: authLoading } = useAuth();

    if (authLoading) {
        return (
            <LayoutShell>
                <div className="space-y-8">
                    <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 p-8">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-white/10" />
                            <div className="space-y-2">
                                <div className="h-8 w-40 rounded-xl bg-white/20" />
                                <div className="h-4 w-56 rounded-lg bg-white/10" />
                            </div>
                        </div>
                    </div>
                    <StatsRowSkeleton />
                    <Card>
                        <CardContent className="p-6">
                            <TableCardSkeleton columns={7} rows={6} />
                        </CardContent>
                    </Card>
                </div>
            </LayoutShell>
        );
    }

    if (!user) return <Redirect to="/login" />;
    if (user.role !== "admin") {
        return (
            <LayoutShell>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-fade-in">
                    <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                        <ShieldAlert className="h-10 w-10 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-red-900">Access Denied</h1>
                    <p className="text-muted-foreground text-center max-w-md">
                        You do not have admin privileges. Only users with the <strong>admin</strong> role can access this page.
                    </p>
                </div>
            </LayoutShell>
        );
    }

    return <AdminDashboard />;
}

function AdminDashboard() {
    const { stats, statsLoading, users, usersLoading, jobs, jobsLoading, books, booksLoading, deleteUser, deleteJob, deleteBook } = useAdmin();
    const { user: currentUser } = useAuth();

    return (
        <LayoutShell>
            <div className="space-y-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-8 flex items-center justify-between animate-slide-in-from-top">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-heading font-bold text-white">Admin Panel</h1>
                            <p className="text-purple-200 text-sm">Manage users, jobs, and books across EduConnect</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
                    {statsLoading ? (
                        <div className="col-span-full">
                            <StatsRowSkeleton />
                        </div>
                    ) : (
                        <>
                            <StatCard
                                title="Total Users"
                                value={stats?.users ?? 0}
                                icon={Users}
                                gradient="from-blue-500 to-cyan-500"
                                bgGradient="from-blue-50 to-cyan-50/30"
                                borderColor="border-blue-200"
                            />
                            <StatCard
                                title="Active Tutors"
                                value={stats?.tutors ?? 0}
                                icon={GraduationCap}
                                gradient="from-violet-500 to-purple-500"
                                bgGradient="from-violet-50 to-purple-50/30"
                                borderColor="border-violet-200"
                            />
                            <StatCard
                                title="Job Listings"
                                value={stats?.jobs ?? 0}
                                icon={Briefcase}
                                gradient="from-orange-500 to-amber-500"
                                bgGradient="from-orange-50 to-amber-50/30"
                                borderColor="border-orange-200"
                            />
                            <StatCard
                                title="Books Listed"
                                value={stats?.books ?? 0}
                                icon={BookOpen}
                                gradient="from-emerald-500 to-green-500"
                                bgGradient="from-emerald-50 to-green-50/30"
                                borderColor="border-emerald-200"
                            />
                        </>
                    )}
                </div>

                {/* Data Tabs */}
                <Tabs defaultValue="users" className="w-full animate-slide-in-from-bottom">
                    <TabsList className="grid w-full grid-cols-3 rounded-xl">
                        <TabsTrigger value="users" className="rounded-lg transition-all duration-300 gap-2">
                            <Users className="h-4 w-4" /> Users
                        </TabsTrigger>
                        <TabsTrigger value="jobs" className="rounded-lg transition-all duration-300 gap-2">
                            <Briefcase className="h-4 w-4" /> Jobs
                        </TabsTrigger>
                        <TabsTrigger value="books" className="rounded-lg transition-all duration-300 gap-2">
                            <BookOpen className="h-4 w-4" /> Books
                        </TabsTrigger>
                    </TabsList>

                    {/* Users Tab */}
                    <TabsContent value="users" className="mt-6 animate-fade-in">
                        <Card className="border-blue-200 bg-gradient-to-br from-blue-50/30 to-white">
                            <CardHeader>
                                <CardTitle className="text-blue-900">All Users</CardTitle>
                                <CardDescription>Manage all registered users on the platform.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {usersLoading ? (
                                    <TableCardSkeleton columns={7} rows={5} />
                                ) : !users?.length ? (
                                    <p className="text-center text-muted-foreground py-8">No users found.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-blue-100">
                                                    <th className="text-left py-3 px-4 font-semibold text-blue-900">ID</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-blue-900">Name</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-blue-900">Username</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-blue-900">Role</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-blue-900">Email</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-blue-900">Location</th>
                                                    <th className="text-right py-3 px-4 font-semibold text-blue-900">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map((u: any) => (
                                                    <tr key={u.id} className="border-b border-blue-50 hover:bg-blue-50/50 transition-colors">
                                                        <td className="py-3 px-4 text-muted-foreground">{u.id}</td>
                                                        <td className="py-3 px-4 font-medium">{u.name}</td>
                                                        <td className="py-3 px-4 text-muted-foreground">@{u.username}</td>
                                                        <td className="py-3 px-4">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.role === "admin" ? "bg-purple-100 text-purple-700" :
                                                                    u.role === "teacher" ? "bg-blue-100 text-blue-700" :
                                                                        u.role === "institution" ? "bg-orange-100 text-orange-700" :
                                                                            u.role === "seller" ? "bg-green-100 text-green-700" :
                                                                                "bg-gray-100 text-gray-700"
                                                                }`}>
                                                                {u.role}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-muted-foreground">{u.email || "—"}</td>
                                                        <td className="py-3 px-4 text-muted-foreground">{u.location || "—"}</td>
                                                        <td className="py-3 px-4 text-right">
                                                            {u.id !== currentUser?.id ? (
                                                                <DeleteButton
                                                                    label="Delete User"
                                                                    description={`This will permanently delete "${u.name}" and all their associated data (jobs, books, profiles, reviews).`}
                                                                    onConfirm={() => deleteUser.mutate(u.id)}
                                                                    isPending={deleteUser.isPending}
                                                                />
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground italic">You</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Jobs Tab */}
                    <TabsContent value="jobs" className="mt-6 animate-fade-in">
                        <Card className="border-orange-200 bg-gradient-to-br from-orange-50/30 to-white">
                            <CardHeader>
                                <CardTitle className="text-orange-900">All Jobs</CardTitle>
                                <CardDescription>Manage all job listings across the platform.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {jobsLoading ? (
                                    <TableCardSkeleton columns={7} rows={5} />
                                ) : !jobs?.length ? (
                                    <p className="text-center text-muted-foreground py-8">No jobs found.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-orange-100">
                                                    <th className="text-left py-3 px-4 font-semibold text-orange-900">ID</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-orange-900">Title</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-orange-900">Subject</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-orange-900">Posted By</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-orange-900">Salary</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-orange-900">Status</th>
                                                    <th className="text-right py-3 px-4 font-semibold text-orange-900">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {jobs.map((j: any) => (
                                                    <tr key={j.id} className="border-b border-orange-50 hover:bg-orange-50/50 transition-colors">
                                                        <td className="py-3 px-4 text-muted-foreground">{j.id}</td>
                                                        <td className="py-3 px-4 font-medium">{j.title}</td>
                                                        <td className="py-3 px-4 text-muted-foreground">{j.subject || "—"}</td>
                                                        <td className="py-3 px-4 text-muted-foreground">{j.institution?.name || "Unknown"}</td>
                                                        <td className="py-3 px-4 text-muted-foreground">{j.salaryRange || "—"}</td>
                                                        <td className="py-3 px-4">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${j.status === "open" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                                                                }`}>
                                                                {j.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <DeleteButton
                                                                label="Delete Job"
                                                                description={`This will permanently delete the job "${j.title}" and all its applications.`}
                                                                onConfirm={() => deleteJob.mutate(j.id)}
                                                                isPending={deleteJob.isPending}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Books Tab */}
                    <TabsContent value="books" className="mt-6 animate-fade-in">
                        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/30 to-white">
                            <CardHeader>
                                <CardTitle className="text-emerald-900">All Books</CardTitle>
                                <CardDescription>Manage all book listings on the marketplace.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {booksLoading ? (
                                    <TableCardSkeleton columns={8} rows={5} />
                                ) : !books?.length ? (
                                    <p className="text-center text-muted-foreground py-8">No books found.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-emerald-100">
                                                    <th className="text-left py-3 px-4 font-semibold text-emerald-900">ID</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-emerald-900">Title</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-emerald-900">Subject</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-emerald-900">Price</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-emerald-900">Seller</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-emerald-900">Condition</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-emerald-900">Sold</th>
                                                    <th className="text-right py-3 px-4 font-semibold text-emerald-900">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {books.map((b: any) => (
                                                    <tr key={b.id} className="border-b border-emerald-50 hover:bg-emerald-50/50 transition-colors">
                                                        <td className="py-3 px-4 text-muted-foreground">{b.id}</td>
                                                        <td className="py-3 px-4 font-medium">{b.title}</td>
                                                        <td className="py-3 px-4 text-muted-foreground">{b.subject || "—"}</td>
                                                        <td className="py-3 px-4 font-medium text-emerald-700">₹{b.price}</td>
                                                        <td className="py-3 px-4 text-muted-foreground">{b.seller?.name || "Unknown"}</td>
                                                        <td className="py-3 px-4">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 capitalize">
                                                                {b.condition?.replace("_", " ")}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">{b.sold ? "✅ Yes" : "No"}</td>
                                                        <td className="py-3 px-4 text-right">
                                                            <DeleteButton
                                                                label="Delete Book"
                                                                description={`This will permanently delete the book "${b.title}".`}
                                                                onConfirm={() => deleteBook.mutate(b.id)}
                                                                isPending={deleteBook.isPending}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </LayoutShell>
    );
}

/* ── Reusable Components ────────────────────────────────────── */

function StatCard({ title, value, icon: Icon, gradient, bgGradient, borderColor }: {
    title: string; value: string | number; icon: any; gradient: string; bgGradient: string; borderColor: string;
}) {
    return (
        <div className={`relative overflow-hidden rounded-2xl border ${borderColor} bg-gradient-to-br ${bgGradient} p-6 hover:shadow-lg transition-all duration-300 group`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground font-medium">{title}</p>
                    <p className="text-3xl font-bold mt-1">{value}</p>
                </div>
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
            <div className={`absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
        </div>
    );
}

function DeleteButton({ label, description, onConfirm, isPending }: {
    label: string; description: string; onConfirm: () => void; isPending: boolean;
}) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{label}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={isPending}
                    >
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
