import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useChangePassword, useUserContent, useDeleteBook, useDeleteJob, useDeleteFeedback, useDeleteReview, useDeleteAccount } from "@/hooks/use-profile";
import { useUpdateJob } from "@/hooks/use-jobs";
import { useMyTuitions, useUpdateTuition, useDeleteTuition } from "@/hooks/use-tuitions";
import { LayoutShell } from "@/components/layout-shell";
import { FormCardSkeleton, GridCardSkeleton } from "@/components/app-skeletons";
import { AvatarUpload } from "@/components/avatar-upload";
import { CertificateUpload } from "@/components/certificate-upload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  Key,
  User,
  LogOut,
  Trash2,
  Mail,
  MapPin,
  FileText,
  AlertTriangle,
  BookOpen,
  Briefcase,
  MessageSquare,
  Star,
  X,
  Edit3,
  GraduationCap,
  Clock,
  CheckCircle2,
  Download,
} from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [currentUser, setCurrentUser] = useState(user);
  const [tutorProfile, setTutorProfile] = useState<any>(null);
  const [loadingTutorProfile, setLoadingTutorProfile] = useState(false);

  // Hooks
  const changePassword = useChangePassword();
  const userContent = useUserContent();
  const deleteBook = useDeleteBook();
  const deleteJob = useDeleteJob();
  const updateJob = useUpdateJob();
  const deleteFeedback = useDeleteFeedback();
  const deleteReview = useDeleteReview();
  const deleteAccount = useDeleteAccount();
  const myTuitions = useMyTuitions();
  const updateTuition = useUpdateTuition();
  const deleteTuition = useDeleteTuition();
  const [editingTuition, setEditingTuition] = useState<any>(null);

  // Form states
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [infoForm, setInfoForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    location: user?.location || "",
    bio: user?.bio || "",
  });
  const [tutorProfileForm, setTutorProfileForm] = useState({
    mode: "",
    timings: "",
    experience: "",
    qualifications: "",
    expertise: "",
    languages: "",
  });
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Fetch tutor profile when component mounts
  useEffect(() => {
    if (user?.role === "teacher") {
      setLoadingTutorProfile(true);
      fetch("/api/tutor-profile", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          setTutorProfile(data);
          setTutorProfileForm({
            mode: data.mode || "",
            timings: data.timings || "",
            experience: data.experience?.toString() || "",
            qualifications: data.qualifications || "",
            expertise: Array.isArray(data.subjects) ? data.subjects.join(", ") : data.subjects || "",
            languages: Array.isArray(data.languages) ? data.languages.join(", ") : "",
          });
        })
        .catch((err) => console.error("Failed to fetch tutor profile:", err))
        .finally(() => setLoadingTutorProfile(false));
    }
  }, [user?.role]);

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    changePassword.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleUpdateInfo = async () => {
    setUpdatingProfile(true);
    try {
      const body: any = { ...infoForm };
      
      // Add tutor profile fields if user is a teacher
      if (user.role === "teacher") {
        body.mode = tutorProfileForm.mode;
        body.timings = tutorProfileForm.timings;
        body.experience = tutorProfileForm.experience;
        body.qualifications = tutorProfileForm.qualifications;
        body.expertise = tutorProfileForm.expertise;
        body.languages = tutorProfileForm.languages;
      }

      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (res.ok) {
        alert("Profile updated successfully");
        const updatedUser = await res.json();
        setCurrentUser(updatedUser);
      } else {
        alert("Failed to update profile");
      }
    } catch (err) {
      alert("Failed to update profile");
      console.error(err);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    await deleteAccount.mutateAsync(deleteConfirmPassword);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "teacher":
        return "bg-blue-100 text-blue-800";
      case "institution":
        return "bg-purple-100 text-purple-800";
      case "student":
        return "bg-green-100 text-green-800";
      case "admin":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <LayoutShell>
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        {/* Header with Avatar and Basic Info */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24 ring-4 ring-blue-200">
                <AvatarImage src={currentUser?.avatar || `https://avatar.vercel.sh/${user.username}`} />
                <AvatarFallback className="text-lg font-bold">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="mb-3">
                  <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge className={`${getRoleColor(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                    {user.role === "teacher" && tutorProfile?.certificate && (
                      <Badge className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Teacher
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  {user.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {user.location}
                    </div>
                  )}
                </div>
                {user.bio && (
                  <p className="mt-3 text-sm text-gray-700 italic">"{user.bio}"</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="content">My Content</TabsTrigger>
            <TabsTrigger value="danger">Account</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>View your current profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-lg font-semibold">{user.name}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Username</label>
                    <p className="text-lg font-semibold">{user.username}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-lg font-semibold">{user.email || "Not provided"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Role</label>
                    <p className="text-lg font-semibold capitalize">{user.role}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Location</label>
                    <p className="text-lg font-semibold">{user.location || "Not provided"}</p>
                  </div>
                </div>
                {user.bio && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Bio</label>
                    <p className="text-base text-gray-700">{user.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Teacher Profile Details */}
            {user.role === "teacher" && tutorProfile && (
              <>
                <Card className="border-blue-200 bg-blue-50/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                      Teaching Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    {tutorProfile.mode && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">Teaching Mode</label>
                        <p className="text-lg font-semibold capitalize">{tutorProfile.mode === 'home' ? 'In-person' : tutorProfile.mode === 'both' ? 'Online & In-person' : 'Online'}</p>
                      </div>
                    )}
                    {tutorProfile.experience && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">Experience</label>
                        <p className="text-lg font-semibold">{tutorProfile.experience} years</p>
                      </div>
                    )}
                    {tutorProfile.timings && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">Available Timings</label>
                        <p className="text-lg font-semibold">{tutorProfile.timings}</p>
                      </div>
                    )}
                    {tutorProfile.qualifications && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">Qualifications</label>
                        <p className="text-base text-gray-700">{tutorProfile.qualifications}</p>
                      </div>
                    )}
                    {tutorProfile.subjects && tutorProfile.subjects.length > 0 && (
                      <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium text-gray-600">Expertise</label>
                        <div className="flex flex-wrap gap-2">
                          {tutorProfile.subjects.map((subject: string) => (
                            <Badge key={subject} className="bg-blue-100 text-blue-800">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {tutorProfile.languages && tutorProfile.languages.length > 0 && (
                      <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium text-gray-600">Languages</label>
                        <div className="flex flex-wrap gap-2">
                          {tutorProfile.languages.map((language: string) => (
                            <Badge key={language} variant="outline" className="text-gray-700">
                              {language}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Certificate Display */}
                {tutorProfile.certificate && (
                  <Card className="border-green-200 bg-green-50/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        Verified Certificate
                      </CardTitle>
                      <CardDescription>Your uploaded teaching certificate</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="relative max-w-md">
                        <img 
                          src={tutorProfile.certificate} 
                          alt="Certificate" 
                          className="w-full rounded-lg border-2 border-green-200 shadow-md max-h-96 object-contain"
                        />
                        <a
                          href={tutorProfile.certificate}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download Certificate
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-blue-600" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="currentPassword" className="text-sm font-medium">
                    Current Password
                  </label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter current password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    disabled={changePassword.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium">
                    New Password
                  </label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    disabled={changePassword.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    disabled={changePassword.isPending}
                  />
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={changePassword.isPending || !passwordForm.currentPassword || !passwordForm.newPassword}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {changePassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-indigo-600" />
                  Update Profile Information
                </CardTitle>
                <CardDescription>Edit your profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={infoForm.name}
                    onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your email"
                    value={infoForm.email}
                    onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-medium">
                    Location
                  </label>
                  <Input
                    id="location"
                    placeholder="Your city or area"
                    value={infoForm.location}
                    onChange={(e) => setInfoForm({ ...infoForm, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-medium">
                    Bio / About
                  </label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself"
                    value={infoForm.bio}
                    onChange={(e) => setInfoForm({ ...infoForm, bio: e.target.value })}
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleUpdateInfo}
                  disabled={updatingProfile}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  {updatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Teacher Profile Settings */}
            {user.role === "teacher" && (
              <Card className="border-blue-200 bg-blue-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    Teaching Profile
                  </CardTitle>
                  <CardDescription>Edit your teaching details and expertise</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingTutorProfile ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-10 rounded-lg" />
                        <Skeleton className="h-10 rounded-lg" />
                        <Skeleton className="h-10 rounded-lg" />
                        <Skeleton className="h-10 rounded-lg" />
                      </div>
                      <Skeleton className="h-24 rounded-xl" />
                      <Skeleton className="h-11 w-40 rounded-lg" />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label htmlFor="mode" className="text-sm font-medium">
                          Teaching Mode
                        </label>
                        <select
                          id="mode"
                          value={tutorProfileForm.mode}
                          onChange={(e) => setTutorProfileForm({ ...tutorProfileForm, mode: e.target.value })}
                          className="w-full p-2 rounded-md border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select mode</option>
                          <option value="online">Online</option>
                          <option value="home">In-person</option>
                          <option value="both">Both Online & In-person</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="timings" className="text-sm font-medium">
                          Available Timings
                        </label>
                        <Input
                          id="timings"
                          placeholder="e.g., 10 AM - 12 PM, 4 PM - 6 PM"
                          value={tutorProfileForm.timings}
                          onChange={(e) => setTutorProfileForm({ ...tutorProfileForm, timings: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="experience" className="text-sm font-medium">
                          Experience (Years)
                        </label>
                        <Input
                          id="experience"
                          type="number"
                          placeholder="e.g., 5"
                          value={tutorProfileForm.experience}
                          onChange={(e) => setTutorProfileForm({ ...tutorProfileForm, experience: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="expertise" className="text-sm font-medium">
                          Expertise / Subjects
                        </label>
                        <Input
                          id="expertise"
                          placeholder="e.g., Mathematics, Physics, Chemistry"
                          value={tutorProfileForm.expertise}
                          onChange={(e) => setTutorProfileForm({ ...tutorProfileForm, expertise: e.target.value })}
                        />
                        <p className="text-xs text-gray-500">Separate multiple subjects with commas</p>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="qualifications" className="text-sm font-medium">
                          Qualifications
                        </label>
                        <Textarea
                          id="qualifications"
                          placeholder="e.g., B.Sc Physics, M.Sc Mathematics"
                          value={tutorProfileForm.qualifications}
                          onChange={(e) => setTutorProfileForm({ ...tutorProfileForm, qualifications: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="languages" className="text-sm font-medium">
                          Languages
                        </label>
                        <Input
                          id="languages"
                          placeholder="e.g., English, Hindi, Spanish"
                          value={tutorProfileForm.languages}
                          onChange={(e) => setTutorProfileForm({ ...tutorProfileForm, languages: e.target.value })}
                        />
                        <p className="text-xs text-gray-500">Separate multiple languages with commas</p>
                      </div>

                      <Button
                        onClick={handleUpdateInfo}
                        disabled={updatingProfile}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {updatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Teaching Profile
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Avatar Upload */}
            <AvatarUpload
              currentAvatar={currentUser?.avatar || null}
              userName={user.name}
              onUploadSuccess={(avatarUrl) => {
                if (currentUser) {
                  setCurrentUser({ ...currentUser, avatar: avatarUrl } as typeof currentUser);
                }
              }}
            />

            {/* Certificate Upload (Teachers Only) */}
            {user.role === "teacher" && (
              <CertificateUpload
                onUploadSuccess={(certificateUrl) => {
                  // Refetch user content to update certificate
                }}
              />
            )}
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            {userContent.isLoading ? (
              <div className="space-y-4">
                <GridCardSkeleton count={2} className="lg:grid-cols-2" />
                {user.role === "teacher" && <FormCardSkeleton />}
              </div>
            ) : (
              <>
                {/* Books */}
                {userContent.data?.books && userContent.data.books.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-orange-600" />
                        My Books ({userContent.data.books.length})
                      </CardTitle>
                      <CardDescription>Books you've listed for sale</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {userContent.data.books.map((book: any) => (
                          <div key={book.id} className="flex items-start justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{book.title}</h4>
                              <p className="text-sm text-gray-600">{book.subject} • {book.classLevel}</p>
                              <p className="text-sm text-gray-700 mt-1">{book.description}</p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteBook.mutate(book.id)}
                              disabled={deleteBook.isPending}
                            >
                              {deleteBook.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Jobs (Institution only) */}
                {userContent.data?.jobs && userContent.data.jobs.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                        My Job Postings ({userContent.data.jobs.length})
                      </CardTitle>
                      <CardDescription>Jobs you've posted</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {userContent.data.jobs.map((job: any) => (
                          <div key={job.id} className="flex items-start justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-lg">{job.title}</h4>
                                <Badge className={job.status === "open" ? "bg-green-100 text-green-700 border border-green-300" : "bg-gray-200 text-gray-700"}>
                                  {job.status === "open" ? "🟢 Open" : "⚫ Closed"}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{job.subject} • {job.location}</p>
                              <p className="text-sm text-gray-700 mt-1">{job.qualification}</p>
                            </div>
                            <div className="flex flex-col gap-2 ml-3">
                              <Button
                                variant={job.status === "open" ? "outline" : "default"}
                                size="sm"
                                onClick={() => updateJob.mutate({ jobId: job.id, status: job.status === "open" ? "closed" : "open" })}
                                disabled={updateJob.isPending}
                                className={job.status === "open" ? "border-red-300 text-red-600 hover:bg-red-50" : "bg-green-600 hover:bg-green-700 text-white"}
                              >
                                {updateJob.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : job.status === "open" ? (
                                  <>Close Job</>
                                ) : (
                                  <>Reopen</>
                                )}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteJob.mutate(job.id)}
                                disabled={deleteJob.isPending}
                              >
                                {deleteJob.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Applications (Teacher only) */}
                {userContent.data?.applications && userContent.data.applications.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-green-600" />
                        My Applications ({userContent.data.applications.length})
                      </CardTitle>
                      <CardDescription>Jobs you've applied to</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {userContent.data.applications.map((app: any) => (
                          <div key={app.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">Job ID: {app.jobId}</p>
                                <Badge className="mt-2">{app.status}</Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                Applied: {new Date(app.appliedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Job Feedback/Comments */}
                {userContent.data?.jobFeedback && userContent.data.jobFeedback.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-purple-600" />
                        My Job Feedback ({userContent.data.jobFeedback.length})
                      </CardTitle>
                      <CardDescription>Feedback and comments you've left on jobs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {userContent.data.jobFeedback.map((feedback: any) => (
                          <div key={feedback.id} className="flex items-start justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex-1">
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= feedback.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-sm text-gray-700 mt-2">{feedback.comment || "No comment"}</p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteFeedback.mutate(feedback.id)}
                              disabled={deleteFeedback.isPending}
                            >
                              {deleteFeedback.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tutor Reviews (Student only) */}
                {userContent.data?.tutorReviews && userContent.data.tutorReviews.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-600" />
                        My Reviews ({userContent.data.tutorReviews.length})
                      </CardTitle>
                      <CardDescription>Reviews you've left on tutors</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {userContent.data.tutorReviews.map((review: any) => (
                          <div key={review.id} className="flex items-start justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex-1">
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-sm text-gray-700 mt-2">{review.comment || "No comment"}</p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteReview.mutate(review.id)}
                              disabled={deleteReview.isPending}
                            >
                              {deleteReview.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!userContent.data?.books?.length && !userContent.data?.jobs?.length && !userContent.data?.applications?.length &&
                  !userContent.data?.jobFeedback?.length && !userContent.data?.tutorReviews?.length && !myTuitions.data?.length && (
                  <Card>
                    <CardContent className="pt-8 text-center">
                      <p className="text-gray-600">No content yet</p>
                    </CardContent>
                  </Card>
                )}

                {/* My Tuitions (Teacher only) */}
                {user.role === "teacher" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-teal-600" />
                        My Tuitions ({myTuitions.data?.length || 0})
                      </CardTitle>
                      <CardDescription>Tuition classes you've posted</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {myTuitions.isLoading ? (
                        <div className="space-y-4 py-2">
                          {Array.from({ length: 2 }).map((_, index) => (
                            <div key={index} className="rounded-lg border border-teal-200 bg-teal-50 p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-center gap-2">
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                  </div>
                                  <div className="flex gap-3">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                  </div>
                                  <Skeleton className="h-4 w-3/4" />
                                </div>
                                <div className="flex gap-2">
                                  <Skeleton className="h-9 w-9 rounded-md" />
                                  <Skeleton className="h-9 w-9 rounded-md" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : !myTuitions.data?.length ? (
                        <p className="text-sm text-gray-500 py-4 text-center">No tuitions posted yet. Go to Dashboard → Actions to create one.</p>
                      ) : (
                        <div className="space-y-4">
                          {myTuitions.data.map((tuition: any) => (
                            <div key={tuition.id} className="flex items-start justify-between p-4 bg-teal-50 rounded-lg border border-teal-200">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-lg">{tuition.subject}</h4>
                                  <Badge className="bg-teal-100 text-teal-800 text-xs">{tuition.classLevel}</Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" /> {tuition.timing}
                                  </span>
                                  <span className="font-semibold text-teal-700">₹{tuition.fees}/mo</span>
                                  <Badge variant="outline" className="text-xs">{tuition.mode === "home" ? "In-person" : tuition.mode === "both" ? "Both" : "Online"}</Badge>
                                </div>
                                {tuition.description && (
                                  <p className="text-sm text-gray-700 mt-2">{tuition.description}</p>
                                )}
                              </div>
                              <div className="flex gap-2 ml-3">
                                <Dialog open={editingTuition?.id === tuition.id} onOpenChange={(open) => !open && setEditingTuition(null)}>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" onClick={() => setEditingTuition({ ...tuition })}>
                                      <Edit3 className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Edit Tuition</DialogTitle>
                                      <DialogDescription>Update your tuition listing details</DialogDescription>
                                    </DialogHeader>
                                    {editingTuition && (
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                          <div className="space-y-1">
                                            <label className="text-sm font-medium">Subject</label>
                                            <Input value={editingTuition.subject} onChange={(e) => setEditingTuition({ ...editingTuition, subject: e.target.value })} />
                                          </div>
                                          <div className="space-y-1">
                                            <label className="text-sm font-medium">Class Level</label>
                                            <Input value={editingTuition.classLevel} onChange={(e) => setEditingTuition({ ...editingTuition, classLevel: e.target.value })} />
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                          <div className="space-y-1">
                                            <label className="text-sm font-medium">Timing</label>
                                            <Input value={editingTuition.timing} onChange={(e) => setEditingTuition({ ...editingTuition, timing: e.target.value })} />
                                          </div>
                                          <div className="space-y-1">
                                            <label className="text-sm font-medium">Fees (₹)</label>
                                            <Input type="number" value={editingTuition.fees} onChange={(e) => setEditingTuition({ ...editingTuition, fees: Number(e.target.value) })} />
                                          </div>
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-sm font-medium">Mode</label>
                                          <select value={editingTuition.mode || "online"} onChange={(e) => setEditingTuition({ ...editingTuition, mode: e.target.value })} className="w-full p-2 rounded-md border">
                                            <option value="online">Online</option>
                                            <option value="home">In-person</option>
                                            <option value="both">Both</option>
                                          </select>
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-sm font-medium">Description</label>
                                          <Input value={editingTuition.description || ""} onChange={(e) => setEditingTuition({ ...editingTuition, description: e.target.value })} />
                                        </div>
                                        <Button
                                          className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                                          disabled={updateTuition.isPending}
                                          onClick={() => {
                                            updateTuition.mutate(
                                              { id: editingTuition.id, subject: editingTuition.subject, classLevel: editingTuition.classLevel, timing: editingTuition.timing, fees: editingTuition.fees, mode: editingTuition.mode, description: editingTuition.description },
                                              { onSuccess: () => setEditingTuition(null) }
                                            );
                                          }}
                                        >
                                          {updateTuition.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                          Save Changes
                                        </Button>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deleteTuition.mutate(tuition.id)}
                                  disabled={deleteTuition.isPending}
                                >
                                  {deleteTuition.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger" className="space-y-4">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <LogOut className="w-5 h-5" />
                  Log Out
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">Log out of your account on this device</p>
                <Button
                  variant="outline"
                  onClick={() => logout.mutate()}
                  disabled={logout.isPending}
                  className="border-red-300 hover:bg-red-100 text-red-600"
                >
                  {logout.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </Button>
              </CardContent>
            </Card>

            <Card className="border-red-300 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-5 h-5" />
                  Delete Account
                </CardTitle>
                <CardDescription className="text-red-600">
                  This action cannot be undone. Please be certain.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4 border-red-300 bg-red-100">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Deleting your account will permanently remove all your data, including books, jobs, applications, and comments.
                  </AlertDescription>
                </Alert>

                <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full bg-red-600 hover:bg-red-700">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete My Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-red-600">Delete Account</DialogTitle>
                      <DialogDescription>
                        This will permanently delete your account and all associated data. This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Alert className="border-red-300 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          Please enter your password to confirm deletion.
                        </AlertDescription>
                      </Alert>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        value={deleteConfirmPassword}
                        onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                        disabled={deleteAccount.isPending}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={deleteAccount.isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          disabled={deleteAccount.isPending || !deleteConfirmPassword}
                          className="flex-1"
                        >
                          {deleteAccount.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </LayoutShell>
  );
}
