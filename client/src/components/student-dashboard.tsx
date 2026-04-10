import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocationSearch } from "@/components/location-search";
import { MapView } from "@/components/map-view";
import { GridCardSkeleton } from "@/components/app-skeletons";
import { useTutors } from "@/hooks/use-tutors";
import { useBooks } from "@/hooks/use-books";
import { useJobs } from "@/hooks/use-jobs";
import { useUsersByRole } from "@/hooks/use-users";
import { MapPin, Search, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// badge color helper copied from map-view for consistency
const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case "student":
      return "bg-violet-100 text-violet-800";
    case "tutor":
      return "bg-blue-100 text-blue-800";
    case "seller":
      return "bg-green-100 text-green-800";
    case "institution":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

interface LocationSuggestion {
  displayName: string;
  lat: number;
  lon: number;
  address?: string;
}

interface MapMarker {
  id: number;
  name: string;
  type: "tutor" | "seller" | "institution" | "student";
  lat: number;
  lon: number;
  distance: number;
  details?: {
    rate?: number;
    subjects?: string[];
    price?: number;
    books?: number;
    jobs?: number;
    rating?: number;
    // optional contact fields
    contactEmail?: string;
    sellerEmail?: string;
    userId?: number;
    sellerId?: number;
    mode?: string;
    timings?: string;
  };
}

export function StudentDashboard({ title, description, showStudents = false, viewerRole = "student" }: { title?: string; description?: string; showStudents?: boolean; viewerRole?: string }) {
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [distanceFilter, setDistanceFilter] = useState(2); // Default 2km
  const [modeFilter, setModeFilter] = useState<"any" | "online" | "home" | "both">("any");
  const [budgetFilter, setBudgetFilter] = useState<number | null>(null);
  const [timeFilter, setTimeFilter] = useState<string>("");
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(false);
  const [highlightedMarkerId, setHighlightedMarkerId] = useState<string | null>(null);
  const resultCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { data: tutors } = useTutors();
  const { data: books } = useBooks();
  const { data: jobs } = useJobs();
  const { data: students } = useUsersByRole("student");

  // Filter real data by location match and generate map markers
  useEffect(() => {
    if (!selectedLocation) {
      setMapMarkers([]);
      return;
    }

    setIsLoadingMarkers(true);

    const timer = setTimeout(() => {
      const markers: MapMarker[] = [];
      const locationQuery = selectedLocation.displayName.toLowerCase();
      const fullAddress = (selectedLocation.address || selectedLocation.displayName).toLowerCase();

      // Broad location matching: checks displayName, full address, and word overlap
      const locationMatches = (itemLocation: string): boolean => {
        if (!itemLocation) return false;
        const loc = itemLocation.toLowerCase();
        // Direct substring match either way
        if (loc.includes(locationQuery) || locationQuery.includes(loc)) return true;
        // Match item location against full Nominatim address
        if (fullAddress.includes(loc) || loc.includes(fullAddress)) return true;
        // Word-level overlap: split both into words and check for common words (skip short words)
        const searchWords = fullAddress.split(/[\s,]+/).filter(w => w.length > 2);
        const itemWords = loc.split(/[\s,]+/).filter(w => w.length > 2);
        return searchWords.some(sw => itemWords.some(iw => sw.includes(iw) || iw.includes(sw)));
      };

      // Helper: deterministic offset based on ID to spread markers on map
      const offsetForId = (id: number, scale: number = 0.02) => {
        const angle = ((id * 137.508) % 360) * (Math.PI / 180);
        const r = scale * (0.3 + ((id * 7) % 10) / 10);
        return { lat: r * Math.cos(angle), lon: r * Math.sin(angle) };
      };

      // Add tutors
      if ((viewerRole === "student" || viewerRole === "seller" || viewerRole === "institution") && tutors && Array.isArray(tutors)) {
        tutors.forEach((tutor: any) => {
          const tutorLocation = (tutor.location || "");
          if (!locationMatches(tutorLocation)) return;

          // Apply mode filter
          if (modeFilter !== "any") {
            const tutorMode = tutor.tutorProfile?.mode || "online";
            if (modeFilter !== "both" && tutorMode !== modeFilter) return;
          }
          // Apply budget filter
          if (budgetFilter != null && (tutor.tutorProfile?.monthlyRate ?? Infinity) > budgetFilter) return;
          // Apply time filter
          if (timeFilter && timeFilter.trim() !== "") {
            const timings = (tutor.tutorProfile?.timings || "").toLowerCase();
            if (!timings.includes(timeFilter.toLowerCase())) return;
          }

          const off = offsetForId(tutor.id || 0);
          const lat = selectedLocation.lat + off.lat;
          const lon = selectedLocation.lon + off.lon;
          const distance = calculateDistance(selectedLocation.lat, selectedLocation.lon, lat, lon);

          markers.push({
            id: tutor.id,
            name: tutor.name || "Tutor",
            type: "tutor",
            lat,
            lon,
            distance,
            details: {
              rate: tutor.tutorProfile?.monthlyRate || 500,
              subjects: tutor.tutorProfile?.subjects || [],
              rating: tutor.tutorProfile?.rating ? tutor.tutorProfile.rating / 10 : 4.5,
              contactEmail: tutor.email,
              userId: tutor.id,
              mode: tutor.tutorProfile?.mode || "online",
              timings: tutor.tutorProfile?.timings || "",
            },
          });
        });
      }

      // Add book sellers
      if ((viewerRole === "student" || viewerRole === "tutor" || viewerRole === "seller") && books && Array.isArray(books)) {
        books.forEach((book: any) => {
          const bookLocation = (book.location || book.seller?.location || "");
          if (!locationMatches(bookLocation)) return;

          const off = offsetForId(1000 + (book.id || 0));
          const lat = selectedLocation.lat + off.lat;
          const lon = selectedLocation.lon + off.lon;
          const distance = calculateDistance(selectedLocation.lat, selectedLocation.lon, lat, lon);

          markers.push({
            id: 1000 + (book.id || 0),
            name: book.title || "Book",
            type: "seller",
            lat,
            lon,
            distance,
            details: {
              price: book.price || 200,
              books: 1,
              sellerEmail: book.seller?.email,
              sellerId: book.seller?.id,
            },
          });
        });
      }

      // Add institutions/jobs
      if ((viewerRole === "tutor" || viewerRole === "student") && jobs && Array.isArray(jobs)) {
        jobs.forEach((job: any) => {
          const jobLocation = (job.location || job.institution?.location || "");
          if (!locationMatches(jobLocation)) return;

          const off = offsetForId(2000 + (job.id || 0));
          const lat = selectedLocation.lat + off.lat;
          const lon = selectedLocation.lon + off.lon;
          const distance = calculateDistance(selectedLocation.lat, selectedLocation.lon, lat, lon);

          markers.push({
            id: 2000 + (job.id || 0),
            name: job.title || "Job",
            type: "institution",
            lat,
            lon,
            distance,
            details: {
              jobs: 1,
            },
          });
        });
      }

      // Add students
      if ((viewerRole === "tutor" || viewerRole === "seller") && students && Array.isArray(students)) {
        students.forEach((s: any) => {
          const studentLocation = (s.location || "");
          if (!locationMatches(studentLocation)) return;

          const off = offsetForId(3000 + (s.id || 0));
          const lat = selectedLocation.lat + off.lat;
          const lon = selectedLocation.lon + off.lon;
          const distance = calculateDistance(selectedLocation.lat, selectedLocation.lon, lat, lon);

          markers.push({
            id: 3000 + (s.id || 0),
            name: s.name || "Student",
            type: "student",
            lat,
            lon,
            distance,
            details: {
              rating: undefined,
              contactEmail: s.email,
              userId: s.id,
            },
          });
        });
      }

      setMapMarkers(markers);
      setIsLoadingMarkers(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedLocation, tutors, books, jobs, students, modeFilter, budgetFilter, timeFilter]);

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleMarkerClick = (marker: MapMarker) => {
    const markerId = `${marker.type}-${marker.id}`;
    setHighlightedMarkerId(markerId);
    // Scroll to the corresponding result card
    const cardEl = resultCardRefs.current[markerId];
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    // Auto-clear highlight after 3 seconds
    setTimeout(() => setHighlightedMarkerId(null), 3000);
  };

  const filteredMarkers = mapMarkers.filter(m => {
    if (m.distance > distanceFilter) return false;
    if (budgetFilter != null && (m.details?.rate ?? Infinity) > budgetFilter) return false;
    if (modeFilter !== "any") {
      const mode = (m.details as any)?.mode || "online";
      if (modeFilter === "both") {
        // allow either
      } else if (mode !== modeFilter) return false;
    }
    if (timeFilter && timeFilter.trim() !== "") {
      const timings = ((m.details as any)?.timings || "").toLowerCase();
      if (!timings.includes(timeFilter.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Location Search Section */}
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
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location-search" className="text-base">
                Location
              </Label>
              <LocationSearch
                onLocationSelect={setSelectedLocation}
                loading={isLoadingMarkers}
              />
            </div>

            {selectedLocation && (
              <div className="p-3 bg-secondary/50 rounded-lg border border-border">
                <p className="text-sm font-medium">Selected Location:</p>
                <p className="text-sm text-muted-foreground">
                  {selectedLocation.displayName}
                </p>
              </div>
            )}

            {/* Distance Filter */}
            {selectedLocation && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="distance-slider" className="text-base">
                    Search Radius
                  </Label>
                  <Badge variant="secondary" className="rounded-full">
                    {distanceFilter} km
                  </Badge>
                </div>
                <div className="space-y-2">
                  <input
                    id="distance-slider"
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={distanceFilter}
                    onChange={(e) => setDistanceFilter(parseFloat(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.5 km</span>
                    <span>10 km</span>
                  </div>
                </div>
              </div>
            )}
            {/* Additional Filters: Mode, Budget, Time */}
            {selectedLocation && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-base">Mode</Label>
                  <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value as any)} className="w-full p-2 rounded-md border">
                    <option value="any">Any</option>
                    <option value="online">Online</option>
                    <option value="home">In-person</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-base">Max Budget (₹/Month)</Label>
                  <Input type="number" value={budgetFilter ?? ""} onChange={(e) => setBudgetFilter(e.target.value ? parseInt(e.target.value) : null)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-base">Preferred Time</Label>
                  <Input placeholder="e.g. Morning, Evening" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Map Section */}
      {selectedLocation ? (
        <MapView
          center={[selectedLocation.lat, selectedLocation.lon]}
          markers={filteredMarkers}
          distanceFilter={distanceFilter}
          onMarkerClick={handleMarkerClick}
          loading={isLoadingMarkers}
        />
      ) : (
        <Card className="h-96">
          <CardContent className="h-full flex flex-col items-center justify-center text-center">
            <Search className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-lg font-medium mb-1">Search a location to get started</p>
            <p className="text-sm text-muted-foreground">
              Enter your location above to see tutors, books, and opportunities near you
            </p>
          </CardContent>
        </Card>
      )}

      {/* Details below map */}
      {selectedLocation && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Results</h3>
          {isLoadingMarkers ? (
            <GridCardSkeleton count={3} className="md:grid-cols-3" />
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mapMarkers.filter(m => {
              if (m.distance > distanceFilter) return false;
              // Budget filter
              if (budgetFilter != null && (m.details?.rate ?? Infinity) > budgetFilter) return false;
              // Mode filter
              if (modeFilter !== "any") {
                const mode = (m.details as any)?.mode || "online";
                if (modeFilter === "both") {
                  // allow either
                } else if (mode !== modeFilter) return false;
              }
              // Time filter (simple substring match)
              if (timeFilter && timeFilter.trim() !== "") {
                const timings = ((m.details as any)?.timings || "").toLowerCase();
                if (!timings.includes(timeFilter.toLowerCase())) return false;
              }
              return true;
            }).map(marker => {
              const markerId = `${marker.type}-${marker.id}`;
              const isHighlighted = highlightedMarkerId === markerId;
              return (
                <Card
                  key={markerId}
                  ref={(el) => { resultCardRefs.current[markerId] = el; }}
                  className={`p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 cursor-pointer ${
                    isHighlighted
                      ? "ring-2 ring-blue-500 shadow-lg shadow-blue-200 scale-[1.02] bg-blue-50/50"
                      : ""
                  }`}
                  onClick={() => handleMarkerClick(marker)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                        {marker.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {marker.type} • {marker.distance.toFixed(1)} km
                      </p>
                    </div>
                    <Badge className={`text-xs flex-shrink-0 ${getTypeBadgeColor(marker.type)}`}>
                      {marker.type}
                    </Badge>
                  </div>

                  {marker.details && (
                    <div className="space-y-2 text-xs">
                      {marker.details.rate && (
                        <div className="flex items-center justify-between px-2 py-1 bg-white/50 dark:bg-slate-700/50 rounded">
                          <span className="text-slate-600 dark:text-slate-300">Rate:</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">₹{marker.details.rate}/Month</span>
                        </div>
                      )}

                      {marker.details.rating && (
                        <div className="flex items-center justify-between px-2 py-1 bg-white/50 dark:bg-slate-700/50 rounded">
                          <span className="text-slate-600 dark:text-slate-300">Rating:</span>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{marker.details.rating}</span>
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          </div>
                        </div>
                      )}

                      {marker.details.subjects && marker.details.subjects.length > 0 && (
                        <div className="px-2 py-1 bg-white/50 dark:bg-slate-700/50 rounded">
                          <p className="text-slate-600 dark:text-slate-300 mb-1">Subjects:</p>
                          <div className="flex gap-1 flex-wrap">
                            {marker.details.subjects.slice(0, 2).map((subject, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {subject}
                              </Badge>
                            ))}
                            {marker.details.subjects.length > 2 && (
                              <span className="text-xs text-slate-500 dark:text-slate-400 px-2 py-1">
                                +{marker.details.subjects.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {marker.details.price && (
                        <div className="flex items-center justify-between px-2 py-1 bg-white/50 dark:bg-slate-700/50 rounded">
                          <span className="text-slate-600 dark:text-slate-300">Price:</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">₹{marker.details.price}</span>
                        </div>
                      )}

                      {(marker.details as any).mode && (
                        <div className="flex items-center justify-between px-2 py-1 bg-white/50 dark:bg-slate-700/50 rounded">
                          <span className="text-slate-600 dark:text-slate-300">Mode:</span>
                          <span className="text-slate-900 dark:text-slate-100">{(marker.details as any).mode === 'home' ? 'In-person' : (marker.details as any).mode}</span>
                        </div>
                      )}

                      {(marker.details as any).timings && (
                        <div className="flex items-center justify-between px-2 py-1 bg-white/50 dark:bg-slate-700/50 rounded">
                          <span className="text-slate-600 dark:text-slate-300">Timings:</span>
                          <span className="text-slate-900 dark:text-slate-100 text-right">{(marker.details as any).timings}</span>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
          )}
        </div>
      )}
    </div>
  );
}
