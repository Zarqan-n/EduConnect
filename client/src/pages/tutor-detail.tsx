import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useTutor, useReviews, useSubmitReview } from "@/hooks/use-tutors";
import { useAuth } from "@/hooks/use-auth";
import { LayoutShell } from "@/components/layout-shell";
import { DetailPageSkeleton } from "@/components/app-skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2, MapPin, Star, BookOpen, Clock, ArrowLeft,
  GraduationCap, Award, MessageSquare, CreditCard, CheckCircle2, Send,
  Target, Languages, Mail, Phone, Download, FileText
} from "lucide-react";

export default function TutorDetailPage() {
  const [, params] = useRoute("/tutors/:id");
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const tutorId = params?.id ? Number(params.id) : undefined;
  const { data: tutor, isLoading } = useTutor(tutorId!);
  const { data: reviews } = useReviews(tutorId);
  const submitReview = useSubmitReview();
  const [paid, setPaid] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const profile = tutor?.tutorProfile;
  const avgRating = (profile?.rating ?? 0) / 10;
  const reviewsList = (reviews || (tutor as any)?.reviews || []).slice(0, 5);
  const myReview = reviewsList.find((review: any) => review.studentId === user?.id);

  useEffect(() => {
    if (!myReview) return;
    setReviewRating(myReview.rating || 0);
    setReviewComment(myReview.comment || "");
  }, [myReview]);

  const handleSubmitReview = () => {
    if (!tutorId || reviewRating === 0) return;
    submitReview.mutate(
      { tutorId, rating: reviewRating, comment: reviewComment },
      {
        onSuccess: () => {
          setReviewRating(0);
          setHoverRating(0);
          setReviewComment("");
        },
      }
    );
  };

  const handlePayment = () => {
    setPaymentProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaid(true);
    }, 2000);
  };

  if (isLoading) {
    return (
      <LayoutShell>
        <DetailPageSkeleton accentClassName="bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-800" />
      </LayoutShell>
    );
  }

  if (!tutor) {
    return (
      <LayoutShell>
        <div className="text-center py-20 space-y-4">
          <h2 className="text-2xl font-bold text-muted-foreground">Tutor not found</h2>
          <Button onClick={() => navigate("/tutors")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tutors
          </Button>
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/tutors")}
          className="text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tutors
        </Button>

        {/* ── Hero Header ── */}
        <Card className="overflow-hidden border-none shadow-xl">
          <div className="relative bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-800 p-8 sm:p-12 overflow-hidden before:absolute before:top-0 before:-left-full before:w-[200%] before:h-full before:bg-[linear-gradient(115deg,transparent_70%,rgba(255,255,255,0.45)_50%,transparent_70%)] before:blur-sm before:animate-shine">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <Avatar className="h-24 w-24 border-4 border-white/30 shadow-2xl">
                {tutor.avatar ? (
                  <AvatarImage src={tutor.avatar} alt={tutor.name} />
                ) : null}
                <AvatarFallback className="text-2xl bg-white/20 text-white font-bold">{tutor.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-heading font-bold text-white">{tutor.name}</h1>
                  <div className="flex items-center bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-bold">
                    <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                    {avgRating.toFixed(1)}
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-blue-100">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>{tutor.location || "Online"}</span>
                  </div>
                  {profile?.mode && (
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" />
                      <span>{profile.mode === 'home' ? 'In-person' : profile.mode === 'both' ? 'Online & In-person' : 'Online'}</span>
                    </div>
                  )}
                  {profile?.timings && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{profile.timings}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left Column: About + Qualifications + Reviews ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* About Section */}
            <Card className="border border-border/50 shadow-md">
              <CardHeader className="pb-3">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" /> About
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {tutor.bio || "This tutor hasn't added a bio yet."}
                </p>
                {profile?.experience != null && profile.experience > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span className="font-semibold">{profile.experience} years</span> of teaching experience
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Qualifications Section */}
            <Card className="border border-border/50 shadow-md">
              <CardHeader className="pb-3">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" /> Qualifications & Expertise
                </h2>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Subjects */}
                {profile?.subjects && profile.subjects.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Subjects
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.subjects.map((subject: string) => (
                        <Badge key={subject} className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {/* Classes */}
                {profile?.classes && profile.classes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" /> Classes Taught
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.classes.map((cls: string) => (
                        <Badge key={cls} variant="outline" className="border-indigo-300 text-indigo-700 px-3 py-1">
                          {cls}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {/* Qualifications */}
                {profile?.qualifications && profile.qualifications.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4" /> Qualifications
                    </h3>
                    <p className="text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200">{profile.qualifications}</p>
                  </div>
                )}
                {/* Certificate */}
                {profile?.certificate && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Teaching Certificate
                    </h3>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 rounded-full p-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-green-900">Verified Teaching Certificate</p>
                            <p className="text-xs text-green-700">Tutor has uploaded teaching credentials</p>
                          </div>
                        </div>
                        <a
                          href={profile.certificate}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          <Download className="w-4 h-4" /> View
                        </a>
                      </div>
                      {profile.certificate && (
                        <div className="mt-4">
                          <img
                            src={profile.certificate}
                            alt="Teaching Certificate"
                            className="max-h-64 rounded-lg border border-green-300 object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* Languages */}
                {profile?.languages && profile.languages.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                      <Languages className="w-4 h-4" /> Languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((lang: string) => (
                        <Badge key={lang} variant="secondary" className="bg-green-100 text-green-800 border-green-300 px-3 py-1">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {/* Experience Summary */}
                {profile?.experience != null && profile.experience > 0 && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-100 rounded-full p-2">
                        <Award className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-amber-900">{profile.experience}+ Years Experience</p>
                        <p className="text-xs text-amber-700">Verified teaching experience</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card className="border border-border/50 shadow-md">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" /> Recent Reviews & Feedback
                  </h2>
                  {reviewsList.length > 0 && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {reviewsList.length} recent review{reviewsList.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {reviewsList.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No reviews yet. Be the first to review this tutor!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviewsList.map((review: any, i: number) => (
                      <div key={review.id || i} className="bg-secondary/30 rounded-xl p-4 border border-border/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.studentName || 'A'}`} />
                              <AvatarFallback className="text-xs">{(review.studentName || 'A')[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-sm">{review.studentName || "Anonymous"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star
                                key={idx}
                                className={`w-3.5 h-3.5 ${idx < (review.rating || 0)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment || "No comment."}</p>
                        {review.createdAt && (
                          <p className="text-xs text-muted-foreground/60 mt-2">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Write a Review Form */}
                {user && user.id !== tutorId && (
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                      <Send className="w-4 h-4 text-blue-600" />
                      Write a Review
                    </h3>
                    <div className="space-y-4">
                      {/* Star Rating Selector */}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">Your Rating</label>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
                              onMouseEnter={() => setHoverRating(idx + 1)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => setReviewRating(idx + 1)}
                            >
                              <Star
                                className={`w-7 h-7 cursor-pointer transition-colors ${
                                  idx < (hoverRating || reviewRating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300 hover:text-yellow-300'
                                }`}
                              />
                            </button>
                          ))}
                          {reviewRating > 0 && (
                            <span className="ml-2 text-sm font-medium text-muted-foreground">
                              {reviewRating === 1 ? 'Poor' : reviewRating === 2 ? 'Fair' : reviewRating === 3 ? 'Good' : reviewRating === 4 ? 'Very Good' : 'Excellent'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Comment */}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">Your Comment</label>
                        <Textarea
                          placeholder="Share your experience with this tutor..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="min-h-[100px] resize-none rounded-xl border-border/50 focus-visible:ring-blue-500"
                          maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground/60 mt-1 text-right">
                          {reviewComment.length}/500
                        </p>
                      </div>

                      {/* Submit */}
                      <Button
                        className="w-full rounded-xl bg-blue-600 hover:bg-blue-700"
                        onClick={handleSubmitReview}
                        disabled={reviewRating === 0 || submitReview.isPending}
                      >
                        {submitReview.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            {myReview ? "Update Review" : "Submit Review"}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Login prompt for non-logged-in users */}
                {!user && (
                  <div className="mt-6 pt-6 border-t border-border/50 text-center">
                    <p className="text-sm text-muted-foreground">Please <a href="/login" className="text-blue-600 font-medium hover:underline">log in</a> to leave a review.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Right Column: Payment / Contact ── */}
          <div className="space-y-6">
            <Card className="border-2 border-blue-200 shadow-lg sticky top-24">
              <CardHeader className="pb-3 bg-gradient-to-br from-blue-50 to-indigo-50">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" /> Contact This Tutor
                </h2>
                <p className="text-sm text-muted-foreground">
                  Unlock contact details to get started with this tutor
                </p>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {!paid ? (
                  <>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 space-y-3 border border-blue-100">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Contact Access Fee</span>
                        <span className="text-2xl font-bold text-blue-900">₹49</span>
                      </div>
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          Get tutor's email and phone number
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          Direct communication channel
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                          Schedule a trial session
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 rounded-xl"
                      onClick={handlePayment}
                      disabled={paymentProcessing}
                    >
                      {paymentProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay ₹49 to Contact
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Secure payment • Instant access
                    </p>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                      <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="font-semibold text-green-800">Payment Successful!</p>
                      <p className="text-xs text-green-600">Contact details unlocked</p>
                    </div>

                    <div className="space-y-3">
                      {tutor.email && (
                        <a
                          href={`mailto:${tutor.email}?subject=${encodeURIComponent('Tutoring enquiry from EduConnect')}`}
                          className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-200"
                        >
                          <div className="bg-blue-100 rounded-full p-2">
                            <Mail className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="font-medium text-blue-900 text-sm">{tutor.email}</p>
                          </div>
                        </a>
                      )}
                      <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                        <div className="bg-indigo-100 rounded-full p-2">
                          <Phone className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="font-medium text-indigo-900 text-sm">Available after first session</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full rounded-xl"
                      onClick={() => {
                        if (tutor.email) {
                          window.location.href = `mailto:${tutor.email}?subject=${encodeURIComponent('Tutoring enquiry from EduConnect')}`;
                        }
                      }}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}
