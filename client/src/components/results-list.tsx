import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ComponentType, ReactNode } from "react";
import { BookOpen, MapPin, Star, DollarSign, Sparkles, Monitor } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface MapMarker {
  id: number;
  name: string;
  type: "tutor" | "seller" | "institution" | "student";
  lat: number;
  lon: number;
  distance: number;
  details?: any;
}

interface ResultsListProps {
  markers: MapMarker[];
  isLoading: boolean;
  onItemHover?: (markerId: number | null) => void;
  userRole?: string;
}

const typeThemes: Record<
  MapMarker["type"],
  {
    bar: string;
    border: string;
    shadow: string;
    headerBg: string;
    avatar: string;
    badge: string;
    metricIcon: string;
    distancePill: string;
    footerBg: string;
    button: string;
  }
> = {
  tutor: {
    bar: "bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600",
    border: "border-sky-200/90 dark:border-sky-800/50",
    shadow: "shadow-sky-500/10 hover:shadow-sky-500/20 dark:shadow-sky-900/30",
    headerBg: "bg-gradient-to-br from-sky-500/[0.12] via-blue-500/[0.06] to-transparent dark:from-sky-500/20 dark:via-blue-950/30",
    avatar: "bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25",
    badge: "border-sky-300/60 bg-sky-50 text-sky-900 dark:border-sky-700/50 dark:bg-sky-950/60 dark:text-sky-100",
    metricIcon: "text-sky-600 dark:text-sky-400",
    distancePill: "bg-sky-500/10 text-sky-800 ring-1 ring-sky-500/20 dark:bg-sky-950/50 dark:text-sky-200 dark:ring-sky-500/30",
    footerBg: "border-t border-sky-200/50 bg-gradient-to-b from-sky-500/[0.06] to-muted/40 dark:border-sky-900/40 dark:from-sky-950/20",
    button:
      "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/25 hover:from-sky-500 hover:to-indigo-500 dark:shadow-sky-900/40",
  },
  student: {
    bar: "bg-gradient-to-r from-violet-500 via-purple-600 to-fuchsia-600",
    border: "border-violet-200/90 dark:border-violet-800/50",
    shadow: "shadow-violet-500/10 hover:shadow-violet-500/20 dark:shadow-violet-900/30",
    headerBg:
      "bg-gradient-to-br from-violet-500/[0.12] via-purple-500/[0.06] to-transparent dark:from-violet-500/20 dark:via-purple-950/30",
    avatar: "bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-md shadow-violet-500/25",
    badge: "border-violet-300/60 bg-violet-50 text-violet-900 dark:border-violet-700/50 dark:bg-violet-950/60 dark:text-violet-100",
    metricIcon: "text-violet-600 dark:text-violet-400",
    distancePill:
      "bg-violet-500/10 text-violet-800 ring-1 ring-violet-500/20 dark:bg-violet-950/50 dark:text-violet-200 dark:ring-violet-500/30",
    footerBg: "border-t border-violet-200/50 bg-gradient-to-b from-violet-500/[0.06] to-muted/40 dark:border-violet-900/40 dark:from-violet-950/20",
    button:
      "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/25 hover:from-violet-500 hover:to-fuchsia-500 dark:shadow-violet-900/40",
  },
  seller: {
    bar: "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600",
    border: "border-emerald-200/90 dark:border-emerald-800/50",
    shadow: "shadow-emerald-500/10 hover:shadow-emerald-500/20 dark:shadow-emerald-900/30",
    headerBg:
      "bg-gradient-to-br from-emerald-500/[0.12] via-teal-500/[0.06] to-transparent dark:from-emerald-500/20 dark:via-emerald-950/30",
    avatar: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25",
    badge: "border-emerald-300/60 bg-emerald-50 text-emerald-900 dark:border-emerald-700/50 dark:bg-emerald-950/60 dark:text-emerald-100",
    metricIcon: "text-emerald-600 dark:text-emerald-400",
    distancePill:
      "bg-emerald-500/10 text-emerald-800 ring-1 ring-emerald-500/20 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-500/30",
    footerBg: "border-t border-emerald-200/50 bg-gradient-to-b from-emerald-500/[0.06] to-muted/40 dark:border-emerald-900/40 dark:from-emerald-950/20",
    button:
      "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25 hover:from-emerald-500 hover:to-teal-500 dark:shadow-emerald-900/40",
  },
  institution: {
    bar: "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600",
    border: "border-amber-200/90 dark:border-amber-800/50",
    shadow: "shadow-amber-500/10 hover:shadow-amber-500/20 dark:shadow-amber-900/30",
    headerBg:
      "bg-gradient-to-br from-amber-500/[0.12] via-orange-500/[0.06] to-transparent dark:from-amber-500/20 dark:via-amber-950/30",
    avatar: "bg-gradient-to-br from-amber-500 to-rose-600 text-white shadow-md shadow-amber-500/25",
    badge: "border-amber-300/60 bg-amber-50 text-amber-950 dark:border-amber-700/50 dark:bg-amber-950/60 dark:text-amber-100",
    metricIcon: "text-amber-700 dark:text-amber-400",
    distancePill:
      "bg-amber-500/10 text-amber-950 ring-1 ring-amber-500/20 dark:bg-amber-950/50 dark:text-amber-100 dark:ring-amber-500/30",
    footerBg: "border-t border-amber-200/50 bg-gradient-to-b from-amber-500/[0.06] to-muted/40 dark:border-amber-900/40 dark:from-amber-950/20",
    button:
      "bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-md shadow-amber-500/25 hover:from-amber-500 hover:to-rose-500 dark:shadow-amber-900/40",
  },
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    tutor: "Teacher",
    student: "Student",
    seller: "Book",
    institution: "Job Post",
  };
  return labels[type] || type;
};

function DetailRow({
  icon: Icon,
  children,
  className,
  iconClassName,
}: {
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg bg-background/80 px-2.5 py-2 text-xs text-foreground/90 ring-1 ring-border/60 backdrop-blur-sm dark:bg-background/40",
        className,
      )}
    >
      <Icon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0 opacity-90", iconClassName)} />
      <span className="min-w-0 leading-relaxed">{children}</span>
    </div>
  );
}

export function ResultsList({ markers, isLoading, onItemHover }: ResultsListProps) {
  const [, navigate] = useLocation();

  const getNavigationPath = (marker: MapMarker) => {
    if (marker.type === "tutor") {
      return `/tutors/${marker.id}`;
    } else if (marker.type === "institution") {
      return `/jobs/${marker.id - 2000}`;
    } else if (marker.type === "seller") {
      return `/books`;
    } else if (marker.type === "student") {
      return `/profile?id=${marker.id - 3000}`;
    }
    return "#";
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-border/80 bg-gradient-to-r from-primary/[0.06] via-transparent to-accent/[0.06] px-4 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-[family-name:var(--font-heading)] text-sm font-semibold tracking-tight text-foreground">
              Nearby results
            </h3>
            <p className="text-xs text-muted-foreground">{markers.length} match{markers.length !== 1 ? "es" : ""} on the map</p>
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="flex min-h-[12rem] flex-1 items-center justify-center px-4 text-muted-foreground">
          Loading results...
        </div>
      ) : markers.length === 0 ? (
        <div className="flex min-h-[12rem] flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
          <div className="rounded-full bg-muted p-3 text-muted-foreground">
            <MapPin className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-foreground">No results in this area</p>
          <p className="max-w-xs text-xs text-muted-foreground">Try another location or widen your search radius.</p>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-muted/30 to-transparent p-4 dark:from-muted/10">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {markers.map((marker) => {
              const theme = typeThemes[marker.type];
              return (
                <Card
                  key={`${marker.type}-${marker.id}`}
                  className={cn(
                    "group relative flex cursor-pointer flex-col overflow-hidden border-2 bg-card/95 backdrop-blur-sm transition-all duration-300",
                    "hover:-translate-y-0.5 hover:shadow-lg",
                    theme.border,
                    theme.shadow,
                  )}
                  onMouseEnter={() => onItemHover?.(marker.id)}
                  onMouseLeave={() => onItemHover?.(null)}
                  onClick={() => navigate(getNavigationPath(marker))}
                >
                  <div className={cn("h-1 w-full shrink-0", theme.bar)} aria-hidden />
                  <CardHeader className={cn("space-y-0 border-b border-border/50 p-4 pb-3", theme.headerBg)}>
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 shrink-0 ring-2 ring-background shadow-sm">
                        <AvatarFallback className={cn("text-sm font-semibold", theme.avatar)}>{marker.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <h4 className="font-[family-name:var(--font-heading)] line-clamp-2 text-[0.9375rem] font-semibold leading-snug tracking-tight text-foreground">
                          {marker.name}
                        </h4>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className={cn("border px-2 py-0.5 text-[10px] font-medium", theme.badge)}>
                            {getTypeLabel(marker.type)}
                          </Badge>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                              theme.distancePill,
                            )}
                          >
                            <MapPin className="h-3 w-3" />
                            {marker.distance.toFixed(1)} km
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-2 p-4 pt-3">
                    {marker.details ? (
                      <div className="space-y-2">
                        {marker.details.rate != null && (
                          <DetailRow icon={DollarSign} iconClassName={theme.metricIcon}>
                            <span className="font-medium text-foreground">
                              ₹{marker.details.rate}
                            </span>
                            <span className="text-muted-foreground"> / month</span>
                          </DetailRow>
                        )}
                        {marker.details.subjects && marker.details.subjects.length > 0 && (
                          <DetailRow icon={BookOpen} iconClassName={theme.metricIcon}>
                            <span className="line-clamp-2">{marker.details.subjects.slice(0, 2).join(", ")}</span>
                          </DetailRow>
                        )}
                        {marker.details.rating != null && (
                          <DetailRow icon={Star} iconClassName={theme.metricIcon}>
                            <span className="font-medium text-foreground">{marker.details.rating}</span>
                            <span className="text-muted-foreground"> / 5 rating</span>
                          </DetailRow>
                        )}
                        {marker.details.price != null && (
                          <DetailRow icon={DollarSign} iconClassName={theme.metricIcon}>
                            <span className="font-medium text-foreground">
                              ₹{marker.details.price}
                            </span>
                            <span className="text-muted-foreground"> listed price</span>
                          </DetailRow>
                        )}
                        {marker.details.mode && (
                          <DetailRow icon={Monitor} iconClassName={theme.metricIcon}>
                            <span className="capitalize text-foreground">
                              {marker.details.mode === "home" ? "In-person" : marker.details.mode}
                            </span>
                            <span className="text-muted-foreground"> · teaching mode</span>
                          </DetailRow>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Tap to open details</p>
                    )}
                  </CardContent>
                  <CardFooter className={cn("mt-auto p-3", theme.footerBg)}>
                    <Button
                      size="sm"
                      className={cn("w-full text-xs font-semibold shadow-sm transition-transform group-hover:scale-[1.02]", theme.button)}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(getNavigationPath(marker));
                      }}
                    >
                      View more
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
