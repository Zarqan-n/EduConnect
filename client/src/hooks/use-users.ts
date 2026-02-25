import { useQuery } from "@tanstack/react-query";

export function useUsersByRole(role?: string, location?: string) {
  return useQuery({
    queryKey: ["/api/users", role, location],
    enabled: !!role,
    queryFn: async () => {
      const url = new URL("/api/users", window.location.origin);
      if (role) url.searchParams.append("role", role);
      if (location) url.searchParams.append("location", location);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });
}
