import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export function useUploadAvatar() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!file) throw new Error("No file selected");

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Only JPG and PNG files are allowed");
      }

      // Validate file size (2MB)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(`File size exceeds 2MB limit. Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      }

      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to upload avatar");
      }

      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast({
        title: "Success",
        description: "Avatar uploaded successfully!",
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

export function useUploadCertificate() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!file) throw new Error("No file selected");

      // Validate file type (JPG, PNG, PDF)
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Only JPG, PNG, and PDF files are allowed");
      }

      // Validate file size (2MB)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(`File size exceeds 2MB limit. Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      }

      const formData = new FormData();
      formData.append("certificate", file);

      const res = await fetch("/api/upload/certificate", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to upload certificate");
      }

      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-content"] });
      toast({
        title: "Success",
        description: "Certificate uploaded successfully!",
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

export function useUploadBookCover() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!file) throw new Error("No file selected");

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Only JPG and PNG files are allowed");
      }

      // Validate file size (2MB)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(`File size exceeds 2MB limit. Your file: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      }

      const formData = new FormData();
      formData.append("bookCover", file);

      const res = await fetch("/api/upload/book-cover", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to upload book cover");
      }

      return await res.json();
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
