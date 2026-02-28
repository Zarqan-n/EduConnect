import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocationSearch } from "@/components/location-search";
import { MapView } from "@/components/map-view";
import { useTutors } from "@/hooks/use-tutors";
import { useBooks } from "@/hooks/use-books";
import { useJobs } from "@/hooks/use-jobs";
import { useUsersByRole } from "@/hooks/use-users";
import { Loader2, MapPin, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
          if (budgetFilter != null && (tutor.tutorProfile?.hourlyRate ?? Infinity) > budgetFilter) return;
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
              rate: tutor.tutorProfile?.hourlyRate || 500,
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
                  className={`transition-all duration-500 ${isHighlighted
                    ? "ring-2 ring-blue-500 shadow-lg shadow-blue-200 scale-[1.02] bg-blue-50/50"
                    : ""
                    }`}
                >
                  <CardContent>
                    <div className="flex pt-6 justify-between">
                      <div>
                        <h4 className="font-medium">{marker.name}</h4>
                        <p className="text-xs text-muted-foreground">{marker.type} • {marker.distance.toFixed(1)} km</p>
                        {marker.details?.subjects && (
                          <p className="text-xs mt-1">Subjects: {marker.details.subjects.join(", ")}</p>
                        )}
                        {marker.details?.rate && (
                          <p className="text-xs mt-1">Rate: ₹{marker.details.rate}/Month</p>
                        )}
                        {marker.details?.mode && (
                          <p className="text-xs mt-1">Mode: {marker.details.mode === 'home' ? 'In-person' : marker.details.mode}</p>
                        )}
                        {marker.details && (marker.details as any).timings && (
                          <p className="text-xs mt-1">Timings: {(marker.details as any).timings}</p>
                        )}
                        {marker.details?.price && (
                          <p className="text-xs mt-1">Price: ₹{marker.details.price}</p>
                        )}
                      </div>
                      <div className="flex items-center">
                        <button
                          className="border rounded p-1.5 bg-blue-300"
                          onClick={() => {
                            const email = (marker.details as any)?.sellerEmail || (marker.details as any)?.contactEmail;
                            if (email) {
                              const subject = encodeURIComponent(`Inquiry about ${marker.name}`);
                              window.location.href = `mailto:${email}?subject=${subject}`;
                            } else {
                              // fallback: navigate to profile if userId available
                              const uid = (marker.details as any)?.userId || (marker.details as any)?.sellerId;
                              if (uid) {
                                window.location.href = `/profile/${uid}`;
                              } else {
                                alert("No contact information available.");
                              }
                            }
                          }}
                        >
                          Contact
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
