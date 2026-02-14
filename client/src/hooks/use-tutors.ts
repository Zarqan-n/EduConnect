import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertTutorProfile } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useTutors(filters?: { subject?: string; location?: string; mode?: string }) {
  // Construct query string for key
  const queryKey = [api.tutors.list.path, filters];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const url = new URL(api.tutors.list.path, window.location.origin);
      if (filters?.subject) url.searchParams.append("subject", filters.subject);
      if (filters?.location) url.searchParams.append("location", filters.location);
      if (filters?.mode) url.searchParams.append("mode", filters.mode);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch tutors");
      return api.tutors.list.responses[200].parse(await res.json());
    },
  });
}

export function useTutor(id: number) {
  return useQuery({
    queryKey: [api.tutors.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.tutors.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch tutor details");
      return api.tutors.get.responses[200].parse(await res.json());
    },
  });
}

export function useCreateTutorProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<InsertTutorProfile, "userId">) => {
      const res = await fetch(api.tutors.createProfile.path, {
        method: api.tutors.createProfile.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create profile");
      return api.tutors.createProfile.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tutors.list.path] });
      // Invalidate auth/me as user might now have a profile attached if we were fetching that deep
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] }); 
      toast({
        title: "Profile Created",
        description: "Your tutor profile is now live.",
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
