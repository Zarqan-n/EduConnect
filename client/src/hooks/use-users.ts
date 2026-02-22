import { useQuery } from "@tanstack/react-query";

export function useUsersByRole(role?: string, location?: string) {
  return useQuery({
    queryKey: ["/api/users", role, location],
    // always enabled; role is optional now. callers outside admin still should pass role.
    enabled: true,
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

// helper for admin endpoints
export function useAdminUsers(role?: string, location?: string) {
  return useQuery({
    queryKey: ["/api/admin/users", role, location],
    enabled: true,
    queryFn: async () => {
      const url = new URL("/api/admin/users", window.location.origin);
      if (role) url.searchParams.append("role", role);
      if (location) url.searchParams.append("location", location);
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch admin users");
      return res.json();
    },
  });
}
