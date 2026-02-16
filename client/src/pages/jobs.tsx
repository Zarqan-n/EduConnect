import { useState } from "react";
import { useJobs, useApplyJob } from "@/hooks/use-jobs";
import { useAuth } from "@/hooks/use-auth";
import { LayoutShell } from "@/components/layout-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Briefcase, MapPin, Building2, CheckCircle2 } from "lucide-react";

export default function JobsPage() {
  const [query, setQuery] = useState("");
  const { data: jobs, isLoading } = useJobs(query);
  const { user } = useAuth();

  return (
    <LayoutShell>
      <div className="space-y-8">
        <div className="gradient-hero rounded-3xl p-8 sm:p-16">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div className="space-y-2 flex-1">
              <h1 className="text-3xl font-heading font-bold header-gradient-text">Teaching Opportunities</h1>
              <p className="text-muted-foreground">Find your next role at top institutions.</p>
            </div>
            <div className="relative w-full md:w-96">
              <SearchInput value={query} onChange={setQuery} />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {jobs?.map((job) => (
              <JobCard key={job.id} job={job} userRole={user?.role} />
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
        className="pl-10 rounded-xl"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="absolute left-3 top-2.5 text-muted-foreground">
        <Briefcase className="w-5 h-5" />
      </div>
    </div>
  );
}

function JobCard({ job, userRole }: { job: any, userRole?: string }) {
  const applyMutation = useApplyJob();
  const [isOpen, setIsOpen] = useState(false);

  const handleApply = () => {
    applyMutation.mutate(job.id, {
      onSuccess: () => setIsOpen(false),
    });
  };

  return (
    <Card className="hover:border-orange-300/50 transition-colors duration-200 border-l-4 border-l-orange-400 hover:border-l-orange-600 bg-gradient-to-r from-orange-50/50 to-transparent card-job">
      <div className="flex flex-col md:flex-row md:items-center p-6 gap-6">
        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 text-orange-600 flex items-center justify-center shrink-0 shadow-md">
          <Building2 className="w-8 h-8" />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xl font-bold text-orange-900">{job.title}</h3>
            {job.status === "open" ? (
              <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 w-fit font-semibold shadow-sm">
                🟢 Actively Hiring
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-200 text-gray-800">Closed</Badge>
            )}
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
              <span className="font-bold text-orange-900 bg-orange-100 px-2 py-1 rounded">{job.salaryRange}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 md:pt-0 md:pl-6 border-t md:border-t-0 md:border-l border-orange-200">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button 
                disabled={userRole !== "teacher" || job.status !== "open"}
                className="whitespace-nowrap px-8 rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                Apply Now
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Apply for {job.title}</DialogTitle>
                <DialogDescription>
                  Confirm your application to {job.institution.name}. They will receive your profile details.
                </DialogDescription>
              </DialogHeader>
              <div className="bg-orange-50 p-4 rounded-lg text-sm space-y-2 my-2 border border-orange-200">
                <p><strong>Subject:</strong> {job.subject}</p>
                <p><strong>Requirements:</strong> {job.qualification}</p>
                <p><strong>Experience:</strong> {job.experience} years required</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={handleApply} disabled={applyMutation.isPending} className="bg-orange-600 hover:bg-orange-700 text-white">
                  {applyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 spin-smooth" />}
                  Confirm Application
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Card>
  );
}
