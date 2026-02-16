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
        <div className="gradient-hero rounded-3xl p-8 sm:p-16 text-center space-y-4">
          <h1 className="text-4xl font-heading font-bold header-gradient-text">Find Your Perfect Tutor</h1>
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
    <Card className="hover-lift border-border/60 overflow-hidden flex flex-col h-full card-tutor border-l-4 border-l-blue-400 hover:border-l-blue-600 transition-colors">
      <CardHeader className="p-6 pb-0 bg-gradient-to-br from-blue-50/50 to-transparent">
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className="icon-bg-blue">
              <Avatar className="h-14 w-14 border-2 border-blue-200">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight text-blue-900">{user.name}</h3>
              <div className="flex items-center text-sm text-blue-700 mt-1">
                <MapPin className="w-3 h-3 mr-1" />
                {user.location || "Online"}
              </div>
            </div>
          </div>
          <div className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-md">
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
              <Badge key={subject} variant="secondary" className="font-medium bg-blue-100 text-blue-800">
                {subject}
              </Badge>
            ))}
            {(profile.subjects?.length || 0) > 3 && (
              <Badge variant="outline" className="border-blue-300 text-blue-700">+{profile.subjects.length - 3}</Badge>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 bg-gradient-to-r from-blue-50/50 to-transparent border-t border-blue-200 gap-2 flex justify-between items-center flex-wrap">
        <div className="flex items-center text-sm text-blue-700 gap-1 font-medium">
          <MapPin className="w-3 h-3" />
          <span className="text-xs">{user.location || "Online"}</span>
        </div>
        <div className="font-bold text-lg text-blue-900">
          ₹{profile.hourlyRate}<span className="text-sm text-blue-700 font-normal">/Month</span>
        </div>
        <Button
          size="sm"
          className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => {
            const email = user.email;
            if (email) {
              const subject = encodeURIComponent(`Tutoring enquiry from EduConnect`);
              window.location.href = `mailto:${email}?subject=${subject}`;
            } else {
              window.location.href = `/profile/${user.id}`;
            }
          }}
        >
          Contact
        </Button>
      </CardFooter>
    </Card>
  );
}
