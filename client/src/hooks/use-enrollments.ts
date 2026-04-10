import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

export function useStudentEnrollments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["enrollments", "student", user?.id],
    queryFn: async () => {
      const res = await fetch("/api/enrollments/student");
      if (!res.ok) throw new Error("Failed to fetch enrollments");
      return res.json();
    },
    enabled: !!user
  });
}

export function useTutorEnrollments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["enrollments", "teacher", user?.id],
    queryFn: async () => {
      const res = await fetch("/api/enrollments/teacher");
      if (!res.ok) throw new Error("Failed to fetch teacher enrollments");
      return res.json();
    },
    enabled: !!user
  });
}

export function useEnrollStudent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ tuitionId, paymentAmount }: { tuitionId: number; paymentAmount: number }) => {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tuitionId, paymentAmount })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to enroll");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments", "student", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["payments", "student", user?.id] });
    }
  });
}

export function useRemoveEnrollment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (enrollmentId: number) => {
      const res = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to remove enrollment");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments", "student", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["enrollments", "teacher", user?.id] });
    }
  });
}

export function useTutorAnalytics() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["analytics", "teacher", user?.id],
    queryFn: async () => {
      const res = await fetch("/api/analytics/teacher");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    enabled: !!user && user.role === "teacher",
    refetchInterval: 60000 // Refetch every minute
  });
}

export function useTutorPayments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["payments", "teacher", user?.id],
    queryFn: async () => {
      const res = await fetch("/api/payments/teacher");
      if (!res.ok) throw new Error("Failed to fetch payments");
      return res.json();
    },
    enabled: !!user && user.role === "teacher"
  });
}

export function useStudentPayments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["payments", "student", user?.id],
    queryFn: async () => {
      const res = await fetch("/api/payments/student");
      if (!res.ok) throw new Error("Failed to fetch payment history");
      return res.json();
    },
    enabled: !!user && user.role === "student"
  });
}

export function useMarkPaymentReceived() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (paymentId: number) => {
      const res = await fetch(`/api/payments/${paymentId}/mark-received`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error("Failed to mark payment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "teacher", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["analytics", "teacher", user?.id] });
    }
  });
}

export function usePayFees() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (paymentId: number) => {
      const res = await fetch(`/api/payments/${paymentId}/pay`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to pay fees");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "student", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["enrollments", "student", user?.id] });
    }
  });
}
