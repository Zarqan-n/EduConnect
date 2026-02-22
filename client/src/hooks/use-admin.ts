import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "./use-toast";

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.admin.users.delete.path, { id });
      const res = await fetch(url, { method: api.admin.users.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete user");
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.users.list.path] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User removed", description: "The account has been deleted." });
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.books.delete.path, { id });
      const res = await fetch(url, { method: api.books.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete book");
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.books.list.path] });
      toast({ title: "Book removed", description: "Listing has been deleted." });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.jobs.delete.path, { id });
      const res = await fetch(url, { method: api.jobs.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete job");
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.jobs.list.path] });
      toast({ title: "Job removed", description: "Job listing has been deleted." });
    },
  });
}
