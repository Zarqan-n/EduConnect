import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertJobFeedback } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useJobDetail(id: number) {
  return useQuery({
    queryKey: [api.jobs.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.jobs.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch job details");
      return api.jobs.get.responses[200].parse(await res.json());
    },
  });
}

export function useJobFeedback(jobId: number) {
  return useQuery({
    queryKey: [api.jobs.feedback.list.path, jobId],
    queryFn: async () => {
      const url = buildUrl(api.jobs.feedback.list.path, { id: jobId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch feedback");
      return api.jobs.feedback.list.responses[200].parse(await res.json());
    },
  });
}

export function useSubmitJobFeedback() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, feedback }: { jobId: number; feedback: Omit<InsertJobFeedback, "userId" | "jobId"> }) => {
      const url = buildUrl(api.jobs.feedback.create.path, { id: jobId });
      const res = await fetch(url, {
        method: api.jobs.feedback.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedback),
      });

      if (!res.ok) {
        let msg = "Failed to submit feedback";
        try {
          const body = await res.json();
          if (body?.message) msg = body.message;
        } catch {
          msg = await res.text();
        }
        throw new Error(msg);
      }
      return api.jobs.feedback.create.responses[201].parse(await res.json());
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.jobs.feedback.list.path, variables.jobId] });
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
