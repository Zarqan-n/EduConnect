import { useState, useEffect } from "react";
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
  };
}

export function StudentDashboard({ title, description, showStudents = false, viewerRole = "student" }: { title?: string; description?: string; showStudents?: boolean; viewerRole?: string }) {
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [distanceFilter, setDistanceFilter] = useState(2); // Default 2km
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(false);

  const { data: tutors } = useTutors();
  const { data: books } = useBooks();
  const { data: jobs } = useJobs();
  const { data: students } = useUsersByRole("student");

  // Generate sample mock data if API doesn't return coordinates
  // In production, coordinates should come from the API
  useEffect(() => {
    if (!selectedLocation) return;

    setIsLoadingMarkers(true);

    // Simulate API delay
    const timer = setTimeout(() => {
      const markers: MapMarker[] = [];

      // Add tutors (or students when showStudents is true)
      if ((viewerRole === "student" || viewerRole === "seller" || viewerRole === "institution") && tutors && Array.isArray(tutors)) {
        // For viewers that should see tutors
        tutors.slice(0, 3).forEach((tutor: any, idx: number) => {
          // Generate mock coordinates near the selected location
          const offsetLat = (Math.random() - 0.5) * 0.05; // ~5km variation
          const offsetLon = (Math.random() - 0.5) * 0.05;
          const lat = selectedLocation.lat + offsetLat;
          const lon = selectedLocation.lon + offsetLon;

          // Calculate approximate distance
          const distance = calculateDistance(selectedLocation.lat, selectedLocation.lon, lat, lon);

          markers.push({
            id: tutor.id || idx,
            name: tutor.name || `Tutor ${idx + 1}`,
            type: "tutor",
            lat,
            lon,
            distance,
            details: {
              rate: tutor.hourlyRate || 500,
              subjects: tutor.subjects || ["Math", "Science"],
              rating: tutor.rating ? tutor.rating / 10 : 4.5,
              contactEmail: tutor.email,
              userId: tutor.id,
            },
          });
        });
      }

      // Add book sellers
      if ((viewerRole === "student" || viewerRole === "tutor" || viewerRole === "seller") && books && Array.isArray(books)) {
        books.slice(0, 2).forEach((book: any, idx: number) => {
          const offsetLat = (Math.random() - 0.5) * 0.05;
          const offsetLon = (Math.random() - 0.5) * 0.05;
          const lat = selectedLocation.lat + offsetLat;
          const lon = selectedLocation.lon + offsetLon;
          const distance = calculateDistance(selectedLocation.lat, selectedLocation.lon, lat, lon);

          markers.push({
            id: 1000 + (book.id || idx),
            name: book.title || `Book Seller ${idx + 1}`,
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
        jobs.slice(0, 2).forEach((job: any, idx: number) => {
          const offsetLat = (Math.random() - 0.5) * 0.05;
          const offsetLon = (Math.random() - 0.5) * 0.05;
          const lat = selectedLocation.lat + offsetLat;
          const lon = selectedLocation.lon + offsetLon;
          const distance = calculateDistance(selectedLocation.lat, selectedLocation.lon, lat, lon);

          markers.push({
            id: 2000 + (job.id || idx),
            name: job.title || `Institution ${idx + 1}`,
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

      // Add students for viewers that should see students (e.g., tutor, seller)
      if ((viewerRole === "tutor" || viewerRole === "seller") && students && Array.isArray(students)) {
        students.slice(0, 4).forEach((s: any, idx: number) => {
          const offsetLat = (Math.random() - 0.5) * 0.04;
          const offsetLon = (Math.random() - 0.5) * 0.04;
          const lat = selectedLocation.lat + offsetLat;
          const lon = selectedLocation.lon + offsetLon;
          const distance = calculateDistance(selectedLocation.lat, selectedLocation.lon, lat, lon);

          markers.push({
            id: 3000 + (s.id || idx),
            name: s.name || `Student ${idx + 1}`,
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
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedLocation, tutors, books, jobs]);

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
    console.log("Clicked marker:", marker);
    // You can navigate to detail page or show more info here
  };

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
          </div>
        </CardContent>
      </Card>

      {/* Map Section */}
      {selectedLocation ? (
        <MapView
          center={[selectedLocation.lat, selectedLocation.lon]}
          markers={mapMarkers}
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
            {mapMarkers.filter(m => m.distance <= distanceFilter).map(marker => (
              <Card key={`${marker.type}-${marker.id}`}>
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
