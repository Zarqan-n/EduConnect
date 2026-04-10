import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationSearch } from "@/components/location-search";
import { MapContainer } from "@/components/map-container";
import { GridCardSkeleton } from "@/components/app-skeletons";
import { useTutors } from "@/hooks/use-tutors";
import { useBooks } from "@/hooks/use-books";
import { useJobs } from "@/hooks/use-jobs";
import { useUsersByRole } from "@/hooks/use-users";
import { MapPin } from "lucide-react";

interface LocationSuggestion {
  displayName: string;
  lat: number;
  lon: number;
  address?: string;
}

export function StudentDashboard({ title, description }: { title?: string; description?: string }) {
  const { data: tutors = [] } = useTutors();
  const { data: books = [] } = useBooks();
  const { data: jobs = [] } = useJobs();
  const { data: students = [] } = useUsersByRole("student");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {title || "Find Services Near You"}
          </CardTitle>
          <CardDescription>
            {description || "Search for tutors, book sellers, and educational institutions in your area"}
          </CardDescription>
        </CardHeader>
      </Card>

      <MapContainer
        userRole="student"
        tutors={tutors}
        books={books}
        jobs={jobs}
        students={students}
      />
    </div>
  );
}
