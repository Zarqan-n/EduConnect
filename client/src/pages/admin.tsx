import { useEffect } from "react";
import { useLocation } from "wouter";
import { LayoutShell } from "@/components/layout-shell";
import { useAuth } from "@/hooks/use-auth";
import { useAdminUsers } from "@/hooks/use-users";
import { useJobs } from "@/hooks/use-jobs";
import { useBooks } from "@/hooks/use-books";
import { useDeleteUser, useDeleteJob, useDeleteBook } from "@/hooks/use-admin";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // guard visitors: send unauthenticated to login and non‑admins home
  useEffect(() => {
    if (authLoading) return;
    if (user === null) {
      // not logged in
      setLocation("/login");
    } else if (user && user.role !== "admin") {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  const { data: users, isLoading: usersLoading } = useAdminUsers();
  const { data: jobs, isLoading: jobsLoading } = useJobs();
  const { data: books, isLoading: booksLoading } = useBooks();

  const deleteUser = useDeleteUser();
  const deleteJob = useDeleteJob();
  const deleteBook = useDeleteBook();

  const handleUserDelete = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    deleteUser.mutate(id);
  };
  const handleJobDelete = (id: number) => {
    if (!window.confirm("Delete this job listing?")) return;
    deleteJob.mutate(id);
  };
  const handleBookDelete = (id: number) => {
    if (!window.confirm("Delete this book listing?")) return;
    deleteBook.mutate(id);
  };

  // while auth state is loading or redirecting show spinner
  if (authLoading || !user) {
    return (
      <LayoutShell>
        <div className="text-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="books">Books</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          {usersLoading ? (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.id}</TableCell>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell>{u.location || "–"}</TableCell>
                    <TableCell className="w-24">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUserDelete(u.id)}
                        disabled={deleteUser.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {users?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="jobs">
          {jobsLoading ? (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs?.map((j: any) => (
                  <TableRow key={j.id}>
                    <TableCell>{j.id}</TableCell>
                    <TableCell>{j.title}</TableCell>
                    <TableCell>{j.institution?.name}</TableCell>
                    <TableCell>{j.status}</TableCell>
                    <TableCell className="w-24">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleJobDelete(j.id)}
                        disabled={deleteJob.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {jobs?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      No jobs available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="books">
          {booksLoading ? (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books?.map((b: any) => (
                  <TableRow key={b.id}>
                    <TableCell>{b.id}</TableCell>
                    <TableCell>{b.title}</TableCell>
                    <TableCell>{b.seller?.name || b.seller?.username}</TableCell>
                    <TableCell>{b.price}</TableCell>
                    <TableCell className="w-24">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleBookDelete(b.id)}
                        disabled={deleteBook.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {books?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      No books listed.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </LayoutShell>
  );
}
