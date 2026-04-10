import { useEffect } from "react";
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { Users, BookOpen, Building2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import "leaflet/dist/leaflet.css";

interface MapMarker {
  id: number;
  name: string;
  type: "tutor" | "seller" | "institution" | "student";
  lat: number;
  lon: number;
  distance: number;
  details?: any;
}

interface MapMarkersProps {
  center: [number, number];
  markers: MapMarker[];
  searchRadius: number;
  onMarkerClick: (marker: MapMarker) => void;
  highlightedMarkerId?: string | null;
}

const baseStyle =
  "width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.2);";

const getTutorIcon = () => {
  const svg = renderToStaticMarkup(<Users className="w-4 h-4" />);
  const html = `<div style="background:#3b82f6;color:white;${baseStyle}">${svg}</div>`;
  return L.divIcon({ className: "custom-marker tutor-marker", html, iconSize: [32, 32] });
};

const getBookIcon = () => {
  const svg = renderToStaticMarkup(<BookOpen className="w-4 h-4" />);
  const html = `<div style="background:#10b981;color:white;${baseStyle}">${svg}</div>`;
  return L.divIcon({ className: "custom-marker book-marker", html, iconSize: [32, 32] });
};

const getInstitutionIcon = () => {
  const svg = renderToStaticMarkup(<Building2 className="w-4 h-4" />);
  const html = `<div style="background:#f59e0b;color:white;${baseStyle}">${svg}</div>`;
  return L.divIcon({ className: "custom-marker institution-marker", html, iconSize: [32, 32] });
};

const getStudentIcon = () => {
  const svg = renderToStaticMarkup(<Users className="w-4 h-4" />);
  const html = `<div style="background:#8b5cf6;color:white;${baseStyle}">${svg}</div>`;
  return L.divIcon({ className: "custom-marker student-marker", html, iconSize: [32, 32] });
};

const getUserLocationIcon = () => {
  const userStyle = "width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);";
  const svg = renderToStaticMarkup(<Users className="w-3 h-3" />);
  const html = `<div style="background:#ef4444;color:white;${userStyle}">${svg}</div>`;
  return L.divIcon({ className: "custom-marker user-location", html, iconSize: [24, 24] });
};

const getMarkerIcon = (type: "tutor" | "seller" | "institution" | "student") => {
  switch (type) {
    case "tutor":
      return getTutorIcon();
    case "student":
      return getStudentIcon();
    case "seller":
      return getBookIcon();
    case "institution":
      return getInstitutionIcon();
    default:
      return getTutorIcon();
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

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    tutor: "Teacher",
    student: "Student",
    seller: "Book",
    institution: "Job Post",
  };
  return labels[type] || type;
};

function MapViewSync({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center as LatLngExpression, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

export function MapMarkers({ center, markers, searchRadius, onMarkerClick, highlightedMarkerId }: MapMarkersProps) {
  return (
    <LeafletMapContainer
      center={center as LatLngExpression}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
    >
      <MapViewSync center={center} zoom={15} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <Circle
        center={center as LatLngExpression}
        radius={searchRadius * 1000}
        pathOptions={{
          color: "#3b82f6",
          fillColor: "#3b82f6",
          fillOpacity: 0.1,
          weight: 2,
        }}
      />

      <Marker position={center as LatLngExpression} icon={getUserLocationIcon()} />

      {markers.map((marker) => (
        <Marker
          key={`${marker.type}-${marker.id}`}
          position={[marker.lat, marker.lon] as LatLngExpression}
          icon={getMarkerIcon(marker.type)}
          eventHandlers={{
            click: () => onMarkerClick(marker),
          }}
        >
          <Popup>
            <div className="w-48 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm leading-tight">{marker.name}</h3>
                <Badge className={`text-xs ${getTypeBadgeColor(marker.type)}`}>
                  {getTypeLabel(marker.type)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {marker.distance.toFixed(1)} km away
              </p>
              {marker.details && (
                <div className="text-xs space-y-1 bg-secondary/30 p-2 rounded">
                  {marker.details.rate && (
                    <p className="flex items-center gap-1">₹{marker.details.rate}/Month</p>
                  )}
                  {marker.details.subjects && marker.details.subjects.length > 0 && (
                    <p className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> {marker.details.subjects.slice(0, 2).join(", ")}
                      {marker.details.subjects.length > 2 && ` +${marker.details.subjects.length - 2}`}
                    </p>
                  )}
                  {marker.details.rating && (
                    <p className="flex items-center gap-1">Rating: {marker.details.rating}/5</p>
                  )}
                  {marker.details.price && (
                    <p className="flex items-center gap-1">₹{marker.details.price}</p>
                  )}
                  {marker.details.mode && (
                    <p className="text-xs">Mode: {marker.details.mode === "home" ? "In-person" : marker.details.mode}</p>
                  )}
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </LeafletMapContainer>
  );
}
