import { useState } from "react";
import { useLocation } from "wouter";
import { useJobs } from "@/hooks/use-jobs";
import { useAuth } from "@/hooks/use-auth";
import { LayoutShell } from "@/components/layout-shell";
import { ListCardSkeleton } from "@/components/app-skeletons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Building2 } from "lucide-react";

export default function JobsPage() {
  const [query, setQuery] = useState("");
  const [, navigate] = useLocation();
  const { data: jobs, isLoading } = useJobs(query);
  const { user } = useAuth();

  return (
    <LayoutShell>
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 px-8 sm:px-12 sm:py-24 text-center py-16 border border-orange-200/50">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 relative z-10">
            <div className="space-y-2 flex-1 text-left md:text-center">
              <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">Teaching Opportunities</h1>
              <p className="text-muted-foreground">Find your next role at top institutions.</p>
            </div>
            <div className="relative w-full md:w-96 md:text-right">
              <SearchInput value={query} onChange={setQuery} />
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-orange-300/10 to-amber-300/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-gradient-to-tr from-amber-300/10 to-orange-300/10 blur-3xl" />
          </div>
        </div>

        {isLoading ? (
          <ListCardSkeleton count={5} />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {jobs?.map((job) => (
              <JobCard key={job.id} job={job} userRole={user?.role} onDetailsClick={() => navigate(`/jobs/${job.id}`)} />
            ))}
            {jobs?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground bg-secondary/20 rounded-2xl border border-dashed border-border">
                No jobs found at the moment.
              </div>
            )}
          </div>
        )}
      </div>
    </LayoutShell>
  );
}

function SearchInput({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  return (
    <div className="relative">
      <Input
        placeholder="Search by title or subject..."
        className="pl-10 rounded-xl border-orange-200/50 focus-visible:ring-orange-500 bg-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="absolute left-3 top-2.5 text-orange-500">
        <Briefcase className="w-5 h-5" />
      </div>
    </div>
  );
}

function JobCard({ job, userRole, onDetailsClick }: { job: any, userRole?: string, onDetailsClick: () => void }) {
  return (
    <Card className="relative hover:border-orange-400 transition-all duration-300 border-l-4 border-l-orange-500 hover:border-l-orange-600 hover:shadow-2xl bg-gradient-to-r from-white to-orange-50/40 card-job border-orange-200/50">
      {/* Status Badge - Positioned at top right */}
      <div className="absolute top-4 right-4 z-20">
        {job.status === "open" ? (
          <Badge className="text-green-700 border-green-400 bg-green-100 border font-semibold shadow-lg animate-pulse">
            🟢 Actively Hiring
          </Badge>
        ) : (
          <Badge className="bg-gray-300 text-gray-800 font-semibold shadow-lg">
            ✓ Closed
          </Badge>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center p-6 gap-6">
        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-lg">
          <Building2 className="w-8 h-8" />
        </div>
        
        <div className="flex-1 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xl font-bold text-orange-900 pr-24">{job.title}</h3>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-orange-800">
            <div className="flex items-center font-medium">
              <Building2 className="w-4 h-4 mr-1.5 text-orange-600" />
              {job.institution.name}
            </div>
            <div className="flex items-center font-medium">
              <MapPin className="w-4 h-4 mr-1.5 text-orange-600" />
              {job.location || "Remote"}
            </div>
            <div>
              <span className="font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 px-3 py-1.5 rounded-lg shadow-md">{job.salaryRange}</span>
            </div>
          </div>

          {/* Working Time and Days */}
          {(job.workingTimeStart || job.workingTimeEnd || job.workingDays) && (
            <div className="flex flex-wrap gap-4 text-sm text-orange-700 pt-2 border-t border-orange-100">
              {(job.workingTimeStart || job.workingTimeEnd) && (
                <div className="flex items-center">
                  <span className="font-semibold">⏰</span>
                  <span className="ml-1.5">{job.workingTimeStart || "N/A"} - {job.workingTimeEnd || "N/A"}</span>
                </div>
              )}
              {job.workingDays && (
                <div className="flex items-center">
                  <span className="font-semibold">📅</span>
                  <span className="ml-1.5">{job.workingDays}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 md:pt-0 md:pl-6 border-t md:border-t-0 md:border-l border-orange-200">
          <Button 
            onClick={onDetailsClick}
            className="whitespace-nowrap px-8 rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            See Details
          </Button>
        </div>
      </div>
    </Card>
  );
}
