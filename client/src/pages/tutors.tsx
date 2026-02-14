import { useState } from "react";
import { useTutors } from "@/hooks/use-tutors";
import { LayoutShell } from "@/components/layout-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MapPin, Search, Star, BookOpen } from "lucide-react";

export default function TutorsPage() {
  const [filters, setFilters] = useState({ subject: "", location: "" });
  const { data: tutors, isLoading } = useTutors(filters);

  // Debounced search could be better, but simple state is fine for now
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Re-trigger query via state change
  };

  return (
    <LayoutShell>
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-heading font-bold">Find Your Perfect Tutor</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Browse through hundreds of qualified tutors ready to help you succeed.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-2xl shadow-lg border border-border">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Subject (e.g. Math, Physics)"
                className="pl-10 h-11 border-none bg-secondary/50 focus-visible:ring-0 rounded-xl"
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Location (City)"
                className="pl-10 h-11 border-none bg-secondary/50 focus-visible:ring-0 rounded-xl"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </div>
            <Button size="lg" className="rounded-xl px-8 h-11" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutors?.map((user) => (
              <TutorCard key={user.id} user={user} />
            ))}
            {tutors?.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No tutors found matching your criteria. Try adjusting your search.
              </div>
            )}
          </div>
        )}
      </div>
    </LayoutShell>
  );
}

function TutorCard({ user }: { user: any }) {
  const profile = user.tutorProfile;

  return (
    <Card className="hover-lift border-border/60 overflow-hidden flex flex-col h-full">
      <CardHeader className="p-6 pb-0">
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-lg leading-tight">{user.name}</h3>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="w-3 h-3 mr-1" />
                {user.location || "Online"}
              </div>
            </div>
          </div>
          <div className="flex items-center bg-primary/10 text-primary px-2 py-1 rounded-lg text-sm font-bold">
            <Star className="w-3 h-3 mr-1 fill-current" />
            {(profile.rating / 10).toFixed(1)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 flex-1">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {user.bio || "No bio available."}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {profile.subjects?.slice(0, 3).map((subject: string) => (
              <Badge key={subject} variant="secondary" className="font-medium">
                {subject}
              </Badge>
            ))}
            {(profile.subjects?.length || 0) > 3 && (
              <Badge variant="outline">+{profile.subjects.length - 3}</Badge>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 bg-secondary/30 border-t border-border/50 flex justify-between items-center">
        <div className="font-bold text-lg">
          ${profile.hourlyRate}<span className="text-sm text-muted-foreground font-normal">/hr</span>
        </div>
        <Button size="sm" className="rounded-lg">
          Contact
        </Button>
      </CardFooter>
    </Card>
  );
}
