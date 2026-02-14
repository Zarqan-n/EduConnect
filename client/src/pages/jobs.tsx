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
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-heading font-bold">Teaching Opportunities</h1>
            <p className="text-muted-foreground">Find your next role at top institutions.</p>
          </div>
          <div className="relative w-full md:w-96">
            <SearchInput value={query} onChange={setQuery} />
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
    <Card className="hover:border-primary/50 transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center p-6 gap-6">
        <div className="h-16 w-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Building2 className="w-8 h-8" />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xl font-bold">{job.title}</h3>
            {job.status === "open" ? (
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 w-fit">
                Actively Hiring
              </Badge>
            ) : (
              <Badge variant="secondary">Closed</Badge>
            )}
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Building2 className="w-4 h-4 mr-1.5" />
              {job.institution.name}
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1.5" />
              {job.location || "Remote"}
            </div>
            <div>
              <span className="font-medium text-foreground">{job.salaryRange}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 md:pt-0 md:pl-6 border-t md:border-t-0 md:border-l border-border/50">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button 
                disabled={userRole !== "teacher" || job.status !== "open"}
                className="whitespace-nowrap px-8 rounded-xl"
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
              <div className="bg-secondary/30 p-4 rounded-lg text-sm space-y-2 my-2">
                <p><strong>Subject:</strong> {job.subject}</p>
                <p><strong>Requirements:</strong> {job.qualification}</p>
                <p><strong>Experience:</strong> {job.experience} years required</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={handleApply} disabled={applyMutation.isPending}>
                  {applyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
