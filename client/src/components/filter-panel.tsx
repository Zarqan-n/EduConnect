import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterPanelProps {
  filters: {
    subject?: string;
    class?: string;
    feeMin?: number;
    feeMax?: number;
    mode?: "any" | "online" | "home" | "both";
    searchRadius?: number;
    sortBy?: "distance" | "price";
  };
  onFilterChange: (filters: any) => void;
}

export function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
  const handleFeeMaxChange = (values: number[]) => {
    onFilterChange({
      ...filters,
      feeMin: 0,
      feeMax: values[0],
    });
  };

  const handleRadiusChange = (values: number[]) => {
    onFilterChange({
      ...filters,
      searchRadius: values[0],
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      subject: "",
      class: "",
      feeMin: 0,
      feeMax: 10000,
      mode: "any",
      searchRadius: 10,
      sortBy: "distance",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Filters</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-5">
        <div className="min-w-0">
          <Label htmlFor="subject" className="text-sm font-medium">
            Subject
          </Label>
          <Input
            id="subject"
            placeholder="e.g., Mathematics"
            value={filters.subject || ""}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                subject: e.target.value,
              })
            }
            className="mt-1.5 h-9 text-sm"
          />
        </div>

        <div className="min-w-0">
          <Label htmlFor="class" className="text-sm font-medium">
            Class/Grade
          </Label>
          <Input
            id="class"
            placeholder="e.g., 10th, 12th"
            value={filters.class || ""}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                class: e.target.value,
              })
            }
            className="mt-1.5 h-9 text-sm"
          />
        </div>

        <div className="min-w-0">
          <Label className="text-sm font-medium mb-2 block">
            Fees Under: ₹{filters.feeMax ?? 10000}
          </Label>
          <Slider
            value={[filters.feeMax ?? 10000]}
            onValueChange={handleFeeMaxChange}
            min={0}
            max={10000}
            step={10}
            className="w-full"
          />
        </div>

        <div className="min-w-0">
          <Label htmlFor="mode" className="text-sm font-medium">
            Mode
          </Label>
          <Select
            value={filters.mode || "any"}
            onValueChange={(value: any) =>
              onFilterChange({
                ...filters,
                mode: value,
              })
            }
          >
            <SelectTrigger id="mode" className="mt-1.5 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="home">In-person</SelectItem>
              <SelectItem value="both">Online & In-person</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0">
          <Label className="text-sm font-medium mb-2 block">
            Search Radius: {filters.searchRadius || 10} km
          </Label>
          <Slider
            value={[filters.searchRadius || 10]}
            onValueChange={handleRadiusChange}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />
        </div>

        <div className="min-w-0">
          <Label htmlFor="sortBy" className="text-sm font-medium">
            Sort By
          </Label>
          <Select
            value={filters.sortBy || "distance"}
            onValueChange={(value: any) =>
              onFilterChange({
                ...filters,
                sortBy: value,
              })
            }
          >
            <SelectTrigger id="sortBy" className="mt-1.5 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="distance">Distance</SelectItem>
              <SelectItem value="price">Price</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
