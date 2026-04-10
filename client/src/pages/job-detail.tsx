import { useEffect, useMemo, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useJobDetail, useJobFeedback, useSubmitJobFeedback } from "@/hooks/use-job-detail";
import { useApplyJob } from "@/hooks/use-jobs";
import { useAuth } from "@/hooks/use-auth";
import { LayoutShell } from "@/components/layout-shell";
import { DetailPageSkeleton } from "@/components/app-skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2, MapPin, Briefcase, Building2, ArrowLeft, Star, GraduationCap,
  MessageSquare, CreditCard, Send, CheckCircle2, FileText, Users, Target, DollarSign, BookOpen
} from "lucide-react";

export default function JobDetailPage() {
  const [, params] = useRoute("/jobs/:id");
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const jobId = params?.id ? Number(params.id) : undefined;
  const { data: job, isLoading } = useJobDetail(jobId!);
  const { data: feedback } = useJobFeedback(jobId || 0);
  const submitFeedback = useSubmitJobFeedback();
  const applyMutation = useApplyJob();

  const [feedbackRating, setFeedbackRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const myFeedback = useMemo(
    () => feedback?.find((fb) => fb.userId === user?.id),
    [feedback, user?.id],
  );
  const recentOtherFeedback = useMemo(
    () => feedback?.filter((fb) => fb.userId !== user?.id).slice(0, 5) ?? [],
    [feedback, user?.id],
  );

  useEffect(() => {
    if (!myFeedback) return;
    setFeedbackRating(myFeedback.rating || 0);
    setFeedbackComment(myFeedback.comment || "");
  }, [myFeedback]);

  const handleSubmitFeedback = () => {
    if (!jobId || feedbackRating === 0) return;
    submitFeedback.mutate(
      {
        jobId,
        feedback: {
          rating: feedbackRating,
          comment: feedbackComment,
        },
      },
      {
        onSuccess: () => {
          setFeedbackRating(0);
          setHoverRating(0);
          setFeedbackComment("");
        },
      }
    );
  };

  const handleApply = () => {
    if (!jobId) return;
    applyMutation.mutate(jobId, {
      onSuccess: () => setIsOpen(false),
    });
  };

  if (isLoading) {
    return (
      <LayoutShell>
        <DetailPageSkeleton accentClassName="bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-600" />
      </LayoutShell>
    );
  }

  if (!job) {
    return (
      <LayoutShell>
        <div className="text-center py-20 space-y-4">
          <h2 className="text-2xl font-bold text-muted-foreground">Job not found</h2>
          <Button onClick={() => navigate("/jobs")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
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
          onClick={() => navigate("/jobs")}
          className="text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
        </Button>

        {/* ── Hero Header ── */}
        <Card className="overflow-hidden border-none shadow-xl">
          <div className="bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-600 p-8 sm:p-12">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <Avatar className="h-24 w-24 border-4 border-white/30 shadow-2xl">
                {job.institution.avatar ? (
                  <AvatarImage src={job.institution.avatar} alt={job.institution.name} />
                ) : null}
                <AvatarFallback className="text-2xl bg-white/20 text-white font-bold">{job.institution.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <div className="space-y-1">
                  <h1 className="text-4xl font-heading font-bold text-white">{job.title}</h1>
                  <p className="text-orange-100 text-lg">{job.institution.name}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {job.status === "open" ? (
                    <Badge className="text-green-700 bg-green-100 border-green-300 border font-semibold shadow-sm">
                      🟢 Actively Hiring
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-300 text-gray-800">
                      ❌ Closed
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ── Job Details ── */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Role & Responsibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-orange-600" />
                  Job Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg text-orange-900 mb-2 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" /> Role
                  </h3>
                  <p className="text-muted-foreground">{job.title}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-orange-900 mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5" /> Responsibilities
                  </h3>
                  <p className="text-muted-foreground">{job.qualification || "Not specified"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-sm text-orange-900 mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" /> Salary Range
                    </h3>
                    <p className="text-lg font-bold text-orange-600">{job.salaryRange || "Not specified"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-orange-900 mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Subject
                    </h3>
                    <p className="text-muted-foreground">{job.subject || "Not specified"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-sm text-orange-900 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" /> Experience Required
                    </h3>
                    <p className="text-muted-foreground">{job.experience ? `${job.experience} years` : "Not specified"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-orange-900 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Location
                    </h3>
                    <p className="text-muted-foreground">{job.location || "Remote"}</p>
                  </div>
                </div>

                {/* Working Time and Days */}
                {(job.workingTimeStart || job.workingTimeEnd || job.workingDays) && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h3 className="font-semibold text-orange-900 mb-3">Working Hours & Schedule</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {(job.workingTimeStart || job.workingTimeEnd) && (
                        <div>
                          <h4 className="text-sm font-medium text-orange-900 mb-1">⏰ Working Hours</h4>
                          <p className="text-muted-foreground">{job.workingTimeStart || "N/A"} - {job.workingTimeEnd || "N/A"}</p>
                        </div>
                      )}
                      {job.workingDays && (
                        <div>
                          <h4 className="text-sm font-medium text-orange-900 mb-1">📅 Working Days</h4>
                          <p className="text-muted-foreground">{job.workingDays}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Feedback Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-orange-600" />
                  Recent Feedback & Comments
                </CardTitle>
                {feedback && feedback.length > 0 && (
                  <CardDescription>
                    {(() => {
                      if (recentOtherFeedback.length === 0) return "No other ratings yet";
                      const avgRating = (recentOtherFeedback.reduce((sum, fb) => sum + fb.rating, 0) / recentOtherFeedback.length).toFixed(1);
                      return `${avgRating} ⭐ from ${recentOtherFeedback.length} recent ${recentOtherFeedback.length === 1 ? "user" : "users"}`;
                    })()}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Submit Feedback Form */}
                <div className="bg-orange-50 p-6 rounded-xl border-2 border-orange-200 space-y-4">
                  <h4 className="font-semibold text-orange-900">Share Your Experience</h4>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-orange-900">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setFeedbackRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= (hoverRating || feedbackRating)
                                ? "fill-orange-400 text-orange-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="feedbackComment" className="text-sm font-medium text-orange-900">
                      Comment
                    </label>
                    <Textarea
                      id="feedbackComment"
                      placeholder="Share your thoughts about this job opportunity..."
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      className="rounded-lg border-orange-200 focus:border-orange-400"
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleSubmitFeedback}
                    disabled={feedbackRating === 0 || submitFeedback.isPending}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {submitFeedback.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Send className="w-4 h-4 mr-2" />
                    {myFeedback ? "Update" : "Submit"} Feedback
                  </Button>
                </div>

                {/* Your Rating (if exists) */}
                {myFeedback && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-2">
                    <h4 className="font-semibold text-blue-900">Your Rating</h4>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= (myFeedback.rating || 0)
                              ? "fill-blue-400 text-blue-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    {myFeedback.comment && (
                      <p className="text-sm text-blue-900">{myFeedback.comment}</p>
                    )}
                  </div>
                )}

                {/* Other Feedback List */}
                <div className="space-y-4">
                  {feedback && feedback.length > 0 ? (
                    <>
                      <h4 className="font-semibold text-orange-900">
                        Other Feedback ({recentOtherFeedback.length})
                      </h4>
                      {recentOtherFeedback.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {recentOtherFeedback.map((fb) => (
                              <div key={fb.id} className="bg-white p-4 rounded-lg border border-orange-200">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`w-4 h-4 ${
                                          star <= fb.rating ? "fill-orange-400 text-orange-400" : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : ""}
                                  </span>
                                </div>
                                {fb.comment && (
                                  <p className="text-muted-foreground text-sm">{fb.comment}</p>
                                )}
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Be the first to share your feedback!</p>
                      )}
                    </>
                  ) : (
                    <div className="text-center space-y-2">
                      <p className="text-muted-foreground italic">No feedback yet</p>
                      <p className="text-sm text-muted-foreground">Be the first to share your thoughts!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-900">Institution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-semibold text-orange-900">{job.institution.name}</p>
                    </div>
                  </div>
                  {job.institution.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-semibold text-orange-900">{job.institution.location}</p>
                      </div>
                    </div>
                  )}
                  {job.institution.email && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-semibold text-orange-900 text-sm break-all">{job.institution.email}</p>
                      </div>
                    </div>
                  )}
                </div>

                {job.status === "open" && user?.role === "teacher" && (
                  <Button
                    onClick={handleApply}
                    disabled={applyMutation.isPending}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    {applyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Apply Now
                  </Button>
                )}

                {job.status !== "open" && (
                  <Badge className="w-full justify-center py-2 bg-gray-200 text-gray-800">
                    This position is closed
                  </Badge>
                )}

                {user?.role !== "teacher" && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    <p className="text-sm text-blue-900">
                      {user?.role ? "Only teachers can apply." : "Log in as a teacher to apply."}
                    </p>
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
