import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertJob } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useJobs(query?: string) {
  return useQuery({
    queryKey: [api.jobs.list.path, query],
    queryFn: async () => {
      const url = new URL(api.jobs.list.path, window.location.origin);
      if (query) url.searchParams.append("query", query);
      
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return api.jobs.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<InsertJob, "institutionId">) => {
      const res = await fetch(api.jobs.create.path, {
        method: api.jobs.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to post job");
      return api.jobs.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.jobs.list.path] });
      toast({
        title: "Job Posted",
        description: "Your job listing is now active.",
      });
    },
  });
}

export function useApplyJob() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (jobId: number) => {
      const url = buildUrl(api.jobs.apply.path, { id: jobId });
      const res = await fetch(url, {
        method: api.jobs.apply.method,
      });

      if (!res.ok) throw new Error("Failed to apply for job");
      return api.jobs.apply.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({
        title: "Application Sent",
        description: "Good luck! The institution has been notified.",
      });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ jobId, status }: { jobId: number; status: 'open' | 'closed' }) => {
      const url = buildUrl(api.jobs.update.path, { id: jobId });
      const res = await fetch(url, {
        method: api.jobs.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update job");
      return api.jobs.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.jobs.list.path] });
      queryClient.invalidateQueries({ queryKey: ["user-content"] });
      toast({
        title: "Job Updated",
        description: "Job status has been updated successfully.",
      });
    },
  });
}
