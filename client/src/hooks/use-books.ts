import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertBook } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useBooks(filters?: { subject?: string; classLevel?: string }) {
  return useQuery({
    queryKey: [api.books.list.path, filters],
    queryFn: async () => {
      const url = new URL(api.books.list.path, window.location.origin);
      if (filters?.subject) url.searchParams.append("subject", filters.subject);
      if (filters?.classLevel) url.searchParams.append("classLevel", filters.classLevel);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch books");
      return api.books.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<InsertBook, "sellerId">) => {
      const res = await fetch(api.books.create.path, {
        method: api.books.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to list book");
      return api.books.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.books.list.path] });
      toast({
        title: "Book Listed",
        description: "Your book is now available in the marketplace.",
      });
    },
  });
}
