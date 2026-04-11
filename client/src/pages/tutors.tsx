import { useState } from "react";
import { useLocation } from "wouter";
import { useAllTuitions } from "@/hooks/use-tuitions";
import { useEnrollStudent, useStudentEnrollments } from "@/hooks/use-enrollments";
import { useAuth } from "@/hooks/use-auth";
import { LayoutShell } from "@/components/layout-shell";
import { GridCardSkeleton } from "@/components/app-skeletons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Home, DollarSign, GraduationCap, Clock, Star, CheckCircle2, Loader2, Shield, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PLATFORM_COMMISSION = 49;

export default function TutorsPage() {
  const [filters, setFilters] = useState({ subject: "" });
  const { data: tuitions, isLoading: tuitionsLoading } = useAllTuitions();

  // Debounced search could be better, but simple state is fine for now
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Re-trigger query via state change
  };

  // Filter tuitions by subject
  const filteredTuitions = tuitions?.filter((tuition: any) => {
    const subjectMatch = !filters.subject || tuition.subject.toLowerCase().includes(filters.subject.toLowerCase());
    return subjectMatch;
  });

  return (
    <LayoutShell>
      <div className="space-y-8">
        <div className="gradient-hero rounded-3xl p-8 sm:p-16 text-center space-y-4">
          <h1 className="text-4xl font-heading font-bold header-gradient-text">Find Your Perfect Tuition</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Browse through posted tuitions from qualified tutors to find the right match for you.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-2xl shadow-lg border border-border">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by subject..."
                className="pl-10 h-11 border-none bg-secondary/50 focus-visible:ring-0 rounded-xl"
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
              />
            </div>
            <Button size="lg" className="rounded-xl px-8 h-11" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </div>

        {/* Results */}
        {tuitionsLoading ? (
          <GridCardSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTuitions?.map((tuition: any) => (
              <TuitionCard key={tuition.id} tuition={tuition} />
            ))}
            {filteredTuitions?.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No tuitions found matching your criteria. Try adjusting your search.
              </div>
            )}
          </div>
        )}
      </div>
    </LayoutShell>
  );
}

function TuitionCard({ tuition }: { tuition: any }) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { mutate: enrollStudent, isPending: isEnrolling } = useEnrollStudent();
  const { data: enrollments } = useStudentEnrollments();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const getModeLabel = (mode: string) => {
    if (mode === 'home') return 'In-person';
    if (mode === 'both') return 'Online & In-person';
    return 'Online';
  };

  // Get tutor info
  const tutor = tuition.tutor;
  const tutorName = tutor?.name || 'Unknown Tutor';
  const tutorAvatar = tutor?.avatar || null;
  const tutorRating = tutor?.tutorProfile?.rating ? (tutor.tutorProfile.rating / 10).toFixed(1) : 0;
  const isVerified = tutor?.tutorProfile?.certificate ? true : false;

  // Parse classes if they're stored as array or string
  const classesArray = Array.isArray(tuition.classLevel) ? tuition.classLevel : tuition.classLevel.split(',').map((c: string) => c.trim());
  
  // Parse subjects - also handle comma-separated strings
  const subjectsArray = Array.isArray(tuition.subject) ? tuition.subject : tuition.subject.split(',').map((s: string) => s.trim());

  // Check if already enrolled
  const isEnrolled = enrollments?.some((e: any) => e.tuitionId === tuition.id);

  const totalPayment = tuition.fees + PLATFORM_COMMISSION;

  const handleEnrollClick = () => {
    if (!user) {
      toast({ title: "Please log in first", description: "You need to be logged in to enroll", variant: "destructive" });
      navigate("/auth");
      return;
    }

    if (user.role !== "student") {
      toast({ title: "Only students can enroll", description: "Please use a student account to enroll", variant: "destructive" });
      return;
    }

    // Show payment dialog instead of enrolling directly
    setShowPaymentDialog(true);
  };

  const handleConfirmPayment = () => {
    enrollStudent(
      { tuitionId: tuition.id, paymentAmount: totalPayment },
      {
        onSuccess: () => {
          setShowPaymentDialog(false);
          toast({ title: "🎉 Enrolled & Paid!", description: `You are now enrolled. ₹${totalPayment} paid successfully.` });
        },
        onError: (error: any) => {
          toast({ title: "Enrollment failed", description: error.message || "Failed to enroll. Please try again.", variant: "destructive" });
        }
      }
    );
  };

  return (
    <>
      <Card className="hover-lift border-border/99 overflow-hidden flex flex-col h-full card-tutor border-l-4 border-l-indigo-400 hover:border-l-indigo-600 transition-colors">
        {/* Header Section with Avatar, Name, and Rating */}
        <CardHeader className="p-4 pb-3 bg-gradient-to-br from-indigo-50/50 to-transparent border-b border-indigo-100">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Avatar and Name with Verified Badge */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="h-14 w-14 border-2 border-indigo-300 flex-shrink-0">
                {tutorAvatar ? (
                  <AvatarImage src={tutorAvatar} alt={tutorName} />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-indigo-600 text-white font-bold text-lg">
                  {tutorName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-lg font-bold text-indigo-900 line-clamp-2 break-words">{tutorName}</p>
                  {isVerified && (
                    <Badge className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1 px-2 py-0.5 text-xs flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Rating */}
            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-200 flex-shrink-0">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-bold text-yellow-900">{tutorRating}</span>
            </div>
          </div>
        </CardHeader>

        {/* Content Section */}
        <CardContent className="p-4 pb-3 flex-1">
          <div className="space-y-3">
            {/* Subject Badges */}
            <div>
              <p className="text-sm font-semibold text-indigo-600 mb-2">Subjects</p>
              <div className="flex flex-wrap gap-2">
                {subjectsArray.map((subject: string) => (
                  <Badge key={subject} className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Classes Badges */}
            <div>
              <p className="text-sm font-semibold text-indigo-600 mb-2">Classes</p>
              <div className="flex flex-wrap gap-2">
                {classesArray.map((cls: string) => (
                  <Badge key={cls} variant="outline" className="border-indigo-300 text-indigo-700 px-2 py-1">
                    {cls}
                  </Badge>
                ))}
              </div>
            </div>

            {tuition.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {tuition.description}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-xs bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                <Clock className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                <div>
                  <p className="text-indigo-600 font-semibold">Timing</p>
                  <p className="text-indigo-800 font-medium text-xs">{tuition.timing}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                <Home className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                <div>
                  <p className="text-indigo-600 font-semibold">Mode</p>
                  <p className="text-indigo-800 font-medium text-xs">{getModeLabel(tuition.mode)}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-xs text-green-600 font-semibold">Monthly Fee</span>
                </div>
                <span className="text-lg font-bold text-green-800">₹{tuition.fees}</span>
              </div>
            </div>

            {tuition.isActive && (
              <Badge className="w-full justify-center bg-green-100 text-green-800 border-green-300 py-1 text-xs">
                ✓ Active & Available
              </Badge>
            )}

            {isEnrolled && (
              <Badge className="w-full justify-center bg-blue-100 text-blue-800 border-blue-300 py-1 text-xs">
                ✓ You are Enrolled
              </Badge>
            )}
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className="p-3 bg-gradient-to-r from-indigo-50/50 to-transparent border-t border-indigo-200 gap-2">
          {!isEnrolled && user?.role === "student" ? (
            <>
              <Button
                size="sm"
                className="flex-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs"
                onClick={handleEnrollClick}
                disabled={isEnrolling}
              >
                {isEnrolling ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Processing</> : "Enroll Now"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 rounded-lg text-xs"
                onClick={() => navigate(`/tutors/${tuition.tutorId}`)}
              >
                View Profile
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
              onClick={() => navigate(`/tutors/${tuition.tutorId}`)}
            >
              View Full Profile
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Payment Confirmation Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CreditCard className="h-5 w-5 text-green-600" />
              Confirm Payment & Enroll
            </DialogTitle>
            <DialogDescription>
              Complete payment to enroll in <span className="font-semibold text-foreground">{tuition.subject}</span> by <span className="font-semibold text-foreground">{tutorName}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Tuition Summary */}
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10 border-2 border-indigo-300">
                  {tutorAvatar ? <AvatarImage src={tutorAvatar} alt={tutorName} /> : null}
                  <AvatarFallback className="bg-indigo-500 text-white font-bold">{tutorName[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-indigo-900">{tutorName}</p>
                  <p className="text-xs text-indigo-600">{tuition.subject} • {tuition.classLevel}</p>
                </div>
              </div>
              <div className="text-xs text-indigo-700 flex items-center gap-1">
                <Clock className="h-3 w-3" /> {tuition.timing} • {getModeLabel(tuition.mode)}
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Monthly Tuition Fee</span>
                  <span className="font-semibold text-gray-900">₹{tuition.fees}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-gray-600">Platform Commission</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-300 text-amber-700 bg-amber-50">One-time</Badge>
                  </div>
                  <span className="font-semibold text-gray-900">₹{PLATFORM_COMMISSION}</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-200 p-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-green-900">Total Due Now</span>
                  <span className="text-2xl font-bold text-green-700">₹{totalPayment}</span>
                </div>
              </div>
            </div>

            {/* Future payments note */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700 leading-relaxed">
                <span className="font-semibold">Future months:</span> You'll only pay <span className="font-bold">₹{tuition.fees}/month</span> for tuition fees. The ₹{PLATFORM_COMMISSION} platform commission is charged only once during enrollment.
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowPaymentDialog(false)}
              className="sm:flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPayment}
              disabled={isEnrolling}
              className="sm:flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              {isEnrolling ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
              ) : (
                <><CreditCard className="h-4 w-4" /> Pay ₹{totalPayment} & Enroll</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
