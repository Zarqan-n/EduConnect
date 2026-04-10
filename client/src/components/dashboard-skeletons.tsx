import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function DashboardPageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="gradient-primary rounded-3xl p-8 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-10 w-40 rounded-lg" />
          <Skeleton className="h-4 w-60 rounded-lg" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>

      {/* Welcome Card Skeleton */}
      <Card className="border-blue-200">
        <CardHeader>
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-4 w-80 rounded-lg mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 bg-gray-100 rounded-xl">
                <Skeleton className="h-5 w-20 rounded" />
                <Skeleton className="h-6 w-24 rounded mt-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 1 Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-48 rounded-lg" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-full rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Section 2 Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-48 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-48">
              <Skeleton className="w-full h-full rounded" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-16 rounded mb-2" />
        <Skeleton className="h-6 w-24 rounded" />
      </div>
    </div>
  );
}

export function FormCardSkeleton() {
  return (
    <Card className="border-blue-200">
      <CardHeader>
        <Skeleton className="h-6 w-40 rounded-lg" />
        <Skeleton className="h-4 w-64 rounded-lg mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}
        <Skeleton className="h-10 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

export function JobListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-5 w-48 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-64 rounded" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded" />
              <Skeleton className="h-8 w-20 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-40 rounded" />
          </CardHeader>
          <CardContent className="h-64">
            <Skeleton className="w-full h-full rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
