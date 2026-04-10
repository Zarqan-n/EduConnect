import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapSectionSkeleton } from "@/components/app-skeletons";
import { LocationSearch } from "@/components/location-search";
import { MapMarkers } from "@/components/map-markers";
import { FilterPanel } from "@/components/filter-panel";
import { ResultsList } from "@/components/results-list";
import { useMapData } from "@/hooks/use-map-data";

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
  details?: any;
}

interface MapContainerProps {
  userRole: string;
  tutors?: any[];
  books?: any[];
  jobs?: any[];
  students?: any[];
  center?: [number, number];
  onMarkerClick?: (marker: MapMarker) => void;
  loading?: boolean;
}

export function MapContainer({
  userRole,
  tutors = [],
  books = [],
  jobs = [],
  students = [],
  center: initialCenter = [28.6139, 77.209],
  onMarkerClick,
  loading = false,
}: MapContainerProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [center, setCenter] = useState<[number, number]>(initialCenter);
  const [highlightedMarkerId, setHighlightedMarkerId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    subject: "",
    class: "",
    feeMin: 0,
    feeMax: 10000,
    mode: "any" as "any" | "online" | "home" | "both",
    searchRadius: 10,
    sortBy: "distance" as "distance" | "price",
  });

  const mapRawData = useMemo(
    () => ({ tutors, books, jobs, students }),
    [tutors, books, jobs, students],
  );

  const { markers, isLoading: markersLoading } = useMapData(userRole, selectedLocation, mapRawData, filters);

  const handleMarkerClick = (marker: MapMarker) => {
    if (onMarkerClick) {
      onMarkerClick(marker);
    }
  };

  const handleLocationSelect = useCallback((location: LocationSuggestion) => {
    setSelectedLocation(location);
    setCenter([location.lat, location.lon]);
  }, []);

  if (loading) {
    return <MapSectionSkeleton />;
  }

  return (
    <Card className="w-full overflow-visible">
      <CardHeader>
        <CardTitle>Explore Map</CardTitle>
        <CardDescription>
          {selectedLocation ? `Results near ${selectedLocation.displayName}` : "Search for a location to get started"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <LocationSearch onLocationSelect={handleLocationSelect} />
        </div>

        {!selectedLocation ? (
          <div className="h-96 flex items-center justify-center text-muted-foreground">
            Select a location to see nearby {userRole === "student" ? "teachers, institutions, and books" : "results"}
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {userRole === "student" && (
              <FilterPanel filters={filters} onFilterChange={setFilters} />
            )}

            <div className="h-96 w-full rounded-lg overflow-hidden border">
              <MapMarkers
                center={center}
                markers={markers}
                searchRadius={filters.searchRadius}
                onMarkerClick={handleMarkerClick}
                highlightedMarkerId={highlightedMarkerId}
              />
            </div>

            <div className="flex min-h-[min(70vh,28rem)] max-h-[min(85vh,40rem)] flex-col overflow-hidden rounded-lg border bg-card">
              <ResultsList
                markers={markers}
                isLoading={markersLoading}
                onItemHover={(id) => setHighlightedMarkerId(id == null ? null : String(id))}
                userRole={userRole}
              />
            </div>

            <div className="text-xs text-muted-foreground">
              Found {markers.length} result{markers.length !== 1 ? "s" : ""} within {filters.searchRadius} km
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
