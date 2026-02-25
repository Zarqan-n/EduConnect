import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useAdmin() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const statsQuery = useQuery({
        queryKey: [api.admin.stats.path],
        queryFn: async () => {
            const res = await fetch(api.admin.stats.path, { credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch stats");
            return res.json() as Promise<{ users: number; tutors: number; jobs: number; books: number }>;
        },
    });

    const usersQuery = useQuery({
        queryKey: [api.admin.users.list.path],
        queryFn: async () => {
            const res = await fetch(api.admin.users.list.path, { credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch users");
            return res.json();
        },
    });

    const jobsQuery = useQuery({
        queryKey: [api.admin.jobs.list.path],
        queryFn: async () => {
            const res = await fetch(api.admin.jobs.list.path, { credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch jobs");
            return res.json();
        },
    });

    const booksQuery = useQuery({
        queryKey: [api.admin.books.list.path],
        queryFn: async () => {
            const res = await fetch(api.admin.books.list.path, { credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch books");
            return res.json();
        },
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(buildUrl(api.admin.users.delete.path, { id }), {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to delete user");
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.admin.users.list.path] });
            queryClient.invalidateQueries({ queryKey: [api.admin.stats.path] });
            toast({ title: "User deleted", description: "The user has been removed." });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const deleteJobMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(buildUrl(api.admin.jobs.delete.path, { id }), {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to delete job");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.admin.jobs.list.path] });
            queryClient.invalidateQueries({ queryKey: [api.admin.stats.path] });
            toast({ title: "Job deleted", description: "The job listing has been removed." });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const deleteBookMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(buildUrl(api.admin.books.delete.path, { id }), {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to delete book");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.admin.books.list.path] });
            queryClient.invalidateQueries({ queryKey: [api.admin.stats.path] });
            toast({ title: "Book deleted", description: "The book listing has been removed." });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    return {
        stats: statsQuery.data,
        statsLoading: statsQuery.isLoading,
        users: usersQuery.data,
        usersLoading: usersQuery.isLoading,
        jobs: jobsQuery.data,
        jobsLoading: jobsQuery.isLoading,
        books: booksQuery.data,
        booksLoading: booksQuery.isLoading,
        deleteUser: deleteUserMutation,
        deleteJob: deleteJobMutation,
        deleteBook: deleteBookMutation,
    };
}
