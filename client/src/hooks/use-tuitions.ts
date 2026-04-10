import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useMyTuitions() {
  return useQuery({
    queryKey: ["myTuitions"],
    queryFn: async () => {
      const res = await fetch("/api/tuitions/my", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tuitions");
      return res.json();
    },
  });
}

export function useAllTuitions() {
  return useQuery({
    queryKey: ["allTuitions"],
    queryFn: async () => {
      const res = await fetch("/api/tuitions");
      if (!res.ok) throw new Error("Failed to fetch tuitions");
      return res.json();
    },
  });
}

export function useCreateTuition() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      subject: string;
      classLevel: string;
      timing: string;
      fees: number;
      mode?: string;
      description?: string;
    }) => {
      const res = await fetch("/api/tuitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: "Failed to create tuition" }));
        throw new Error(body.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTuitions"] });
      queryClient.invalidateQueries({ queryKey: ["allTuitions"] });
      toast({ title: "Success", description: "Tuition posted successfully!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateTuition() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
      const res = await fetch(`/api/tuitions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: "Failed to update tuition" }));
        throw new Error(body.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTuitions"] });
      queryClient.invalidateQueries({ queryKey: ["allTuitions"] });
      toast({ title: "Updated", description: "Tuition updated successfully!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteTuition() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/tuitions/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: "Failed to delete tuition" }));
        throw new Error(body.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTuitions"] });
      queryClient.invalidateQueries({ queryKey: ["allTuitions"] });
      toast({ title: "Deleted", description: "Tuition removed successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
