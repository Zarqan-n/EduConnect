import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Building2, Star, DollarSign } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
      mode?: string;
      timings?: string;
  };
}

interface MapViewProps {
  center: [number, number];
  markers: MapMarker[];
  distanceFilter: number;
  onMarkerClick?: (marker: MapMarker) => void;
  loading?: boolean;
}

// Custom icons for different marker types
const baseStyle = "width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.2);";

const getTutorIcon = () => {
  const svg = renderToStaticMarkup(<Users className="w-4 h-4" />);
  const html = `<div style="background:#3b82f6;color:white;${baseStyle}">${svg}</div>`;
  return L.divIcon({ className: "custom-marker tutor-marker", html, iconSize: [32, 32] });
};

const getSellerIcon = () => {
  const svg = renderToStaticMarkup(<BookOpen className="w-4 h-4" />);
  const html = `<div style="background:#10b981;color:white;${baseStyle}">${svg}</div>`;
  return L.divIcon({ className: "custom-marker seller-marker", html, iconSize: [32, 32] });
};

const getInstitutionIcon = () => {
  const svg = renderToStaticMarkup(<Building2 className="w-4 h-4" />);
  const html = `<div style="background:#f59e0b;color:white;${baseStyle}">${svg}</div>`;
  return L.divIcon({ className: "custom-marker institution-marker", html, iconSize: [32, 32] });
};

const getMarkerIcon = (type: "tutor" | "seller" | "institution" | "student") => {
  switch (type) {
    case "tutor":
      return getTutorIcon();
    case "student":
      return getTutorIcon();
    case "seller":
      return getSellerIcon();
    case "institution":
      return getInstitutionIcon();
  }
};

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

const getTypeIcon = (type: string) => {
  switch (type) {
    case "student":
      return <Users className="w-4 h-4" />;
    case "tutor":
      return <Users className="w-4 h-4" />;
    case "seller":
      return <BookOpen className="w-4 h-4" />;
    case "institution":
      return <Building2 className="w-4 h-4" />;
    default:
      return null;
  }
};

export function MapView({
  center,
  markers,
  distanceFilter,
  onMarkerClick,
  loading,
}: MapViewProps) {
  const [filteredMarkers, setFilteredMarkers] = useState<MapMarker[]>([]);

  useEffect(() => {
    // Filter markers based on distance
    const filtered = markers.filter((m) => m.distance <= distanceFilter);
    setFilteredMarkers(filtered);
  }, [markers, distanceFilter]);

  if (loading) {
    return (
      <Card className="w-full h-96">
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <CardTitle>Nearby Services</CardTitle>
        <CardDescription>
          Found {filteredMarkers.length} results within {distanceFilter} km
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row gap-4 h-96">
          {/* Map */}
          <div className="flex-1 rounded-lg overflow-hidden">
            <MapContainer
              center={center as LatLngExpression}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              
              {/* Circle showing search radius */}
              <Circle
                center={center as LatLngExpression}
                radius={distanceFilter * 1000}
                pathOptions={{
                  color: "#3b82f6",
                  fillColor: "#3b82f6",
                  fillOpacity: 0.1,
                  weight: 2,
                  className: "search-radius-circle"
                }}
              />

              {/* Markers */}
              {filteredMarkers.map((marker) => (
                <Marker
                  key={`${marker.type}-${marker.id}`}
                  position={[marker.lat, marker.lon] as LatLngExpression}
                  icon={getMarkerIcon(marker.type)}
                >
                  <Popup>
                    <div className="w-48 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm leading-tight">{marker.name}</h3>
                        <Badge className={`text-xs ${getTypeBadgeColor(marker.type)}`}>
                          {marker.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        📍 {marker.distance.toFixed(1)} km away
                      </p>
                      {marker.details && (
                        <div className="text-xs space-y-1 bg-secondary/30 p-2 rounded">
                          {marker.details.rate && (
                            <p className="flex items-center gap-1">
                             ₹{marker.details.rate}/Month
                            </p>
                          )}
                          {marker.details.subjects && marker.details.subjects.length > 0 && (
                            <p className="text-xs">
                              📚 {marker.details.subjects.slice(0, 2).join(", ")}
                              {marker.details.subjects.length > 2 && ` +${marker.details.subjects.length - 2}`}
                            </p>
                          )}
                          {marker.details.rating && (
                            <p className="flex items-center gap-1">
                              <Star className="w-3 h-3" /> {marker.details.rating}/5
                            </p>
                          )}
                          {marker.details.price && (
                            <p className="flex items-center gap-1">
                              ₹{marker.details.price}
                            </p>
                          )}
                          {(marker.details as any).mode && (
                            <p className="text-xs">Mode: {(marker.details as any).mode === 'home' ? 'In-person' : (marker.details as any).mode}</p>
                          )}
                          {(marker.details as any).timings && (
                            <p className="text-xs">Timings: {(marker.details as any).timings}</p>
                          )}
                        </div>
                      )}
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => onMarkerClick?.(marker)}
                      >
                        View Details
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>


        </div>
      </CardContent>
    </Card>
  );
}
