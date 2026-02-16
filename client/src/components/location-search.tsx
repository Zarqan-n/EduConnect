import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";

interface LocationSuggestion {
  displayName: string;
  lat: number;
  lon: number;
  address?: string;
}

interface LocationSearchProps {
  onLocationSelect: (location: LocationSuggestion) => void;
  loading?: boolean;
}

export function LocationSearch({ onLocationSelect, loading }: LocationSearchProps) {
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch location suggestions from OpenStreetMap Nominatim API
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      const formattedSuggestions = data.map((item: any) => ({
        displayName: item.display_name.split(",")[0],
        address: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      }));
      setSuggestions(formattedSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchValue) {
        fetchSuggestions(searchValue);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchValue, fetchSuggestions]);

  const handleUseCurrentLocation = async () => {
    setIsSearching(true);
    try {
      const position = await new Promise<GeolocationCoordinates>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos.coords),
          reject
        );
      });

      // Reverse geocode to get location name
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.latitude}&lon=${position.longitude}`
      );
      const data = await response.json();

      onLocationSelect({
        displayName: data.address.city || data.address.town || data.address.village || "Current Location",
        address: data.display_name,
        lat: position.latitude,
        lon: position.longitude,
      });
      setSearchValue("");
      setSuggestions([]);
      setShowSuggestions(false);
    } catch (error) {
      console.error("Error getting current location:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative w-full space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            placeholder="Search location (e.g., Mumbai, Delhi, Bangalore)..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="rounded-lg"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" />
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleUseCurrentLocation}
          disabled={isSearching || loading}
          className="rounded-lg"
          title="Use your current location"
        >
          <MapPin className="w-4 h-4" />
        </Button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-y-auto bg-background border border-border shadow-lg">
          <div className="space-y-0">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onLocationSelect(suggestion);
                  setSearchValue("");
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-secondary/50 transition-colors border-b last:border-b-0 flex items-start gap-2"
              >
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{suggestion.displayName}</div>
                  <div className="text-xs text-muted-foreground truncate">{suggestion.address}</div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
