import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStudentEnrollments, useRemoveEnrollment, useStudentPayments, usePayFees } from "@/hooks/use-enrollments";
import { Loader2, Trash2, Clock, BookOpen, DollarSign, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export function StudentEnrolledTutors() {
  const { data: enrollments, isLoading: enrollmentsLoading } = useStudentEnrollments();
  const { data: payments } = useStudentPayments();
  const { mutate: removeEnrollment, isPending: isRemoving } = useRemoveEnrollment();
  const { mutate: payFees, isPending: isPaying } = usePayFees();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [paymentDialog, setPaymentDialog] = useState<any>(null);

  if (enrollmentsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!enrollments || enrollments.length === 0) {
    return (
      <Card className="border-gray-200 bg-gray-50/50">
        <CardContent className="pt-6 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600 font-medium">No enrollments yet</p>
          <p className="text-gray-500 text-sm mb-4">Start by browsing and enrolling in tuitions</p>
          <Button onClick={() => navigate("/tutors")} className="bg-blue-600 hover:bg-blue-700">
            Browse Tuitions
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Get pending payments list
  const pendingPayments = payments?.filter((p: any) => p.status === "pending") || [];

  const handlePayFees = (payment: any) => {
    setPaymentDialog(payment);
  };

  const confirmPayment = () => {
    if (!paymentDialog) return;
    payFees(paymentDialog.id, {
      onSuccess: () => {
        setPaymentDialog(null);
        toast({ title: "Payment Successful!", description: `₹${paymentDialog.amount} paid successfully.` });
      },
      onError: (error: any) => {
        toast({ title: "Payment failed", description: error.message || "Failed to process payment.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Enrollments */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-900">Total Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{enrollments.length}</div>
            <p className="text-xs text-blue-700 mt-1">Active tuitions</p>
          </CardContent>
        </Card>

        {/* Active Teachers */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-900">Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {new Set(enrollments.map((e: any) => e.tuition?.tutor?.id)).size}
            </div>
            <p className="text-xs text-green-700 mt-1">Unique tutors</p>
          </CardContent>
        </Card>

        {/* Pending Payments */}
        <Card className={`bg-gradient-to-br border ${pendingPayments.length > 0 ? 'from-orange-50 to-amber-50 border-orange-300 ring-2 ring-orange-200' : 'from-orange-50 to-amber-50 border-orange-200'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-900 flex items-center gap-2">
              Pending Payments
              {pendingPayments.length > 0 && <AlertCircle className="h-4 w-4 text-orange-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{pendingPayments.length}</div>
            <p className="text-xs text-orange-700 mt-1">Outstanding dues</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments Section - Prominent when there are pending payments */}
      {pendingPayments.length > 0 && (
        <Card className="border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50 ring-1 ring-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Pending Fee Payments
            </CardTitle>
            <CardDescription className="text-orange-700">Pay your outstanding tuition fees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingPayments.map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-orange-200 hover:border-orange-300 transition-colors shadow-sm">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{payment.tuition?.subject || 'Tuition'}</p>
                      <p className="text-xs text-gray-500">
                        {payment.tutor?.name || 'Teacher'} • {payment.month}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-700">₹{payment.amount}</p>
                      <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-[10px]">Pending</Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handlePayFees(payment)}
                      disabled={isPaying}
                      className="bg-green-600 hover:bg-green-700 text-white gap-1.5 px-4"
                    >
                      {isPaying ? <Loader2 className="h-3 w-3 animate-spin" /> : <CreditCard className="h-3 w-3" />}
                      Pay Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enrolled Tutors List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Your Teachers</h3>
        {enrollments.map((enrollment: any) => {
          const pendingForThis = payments?.find((p: any) => p.tuitionId === enrollment.tuitionId && p.status === "pending");
          return (
            <Card key={enrollment.id} className="hover-lift border-blue-100">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  {/* Teacher Info */}
                  <div className="flex gap-4 flex-1">
                    <Avatar className="h-14 w-14 flex-shrink-0 border-2 border-blue-200">
                      {enrollment.tuition?.tutor?.avatar && <AvatarImage src={enrollment.tuition.tutor.avatar} alt={enrollment.tuition.tutor.name} />}
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold">
                        {enrollment.tuition?.tutor?.name?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-bold text-gray-900">{enrollment.tuition?.tutor?.name}</h4>
                      
                      {/* Tuition Details */}
                      <div className="space-y-2 mt-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{enrollment.tuition?.subject}</span>
                          <Badge variant="outline" className="ml-1">{enrollment.tuition?.classLevel}</Badge>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span>{enrollment.tuition?.timing}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-600">₹{enrollment.tuition?.fees}/month</span>
                        </div>
                      </div>

                      {/* Mode Badge */}
                      <div className="mt-2">
                        <Badge className={`${
                          enrollment.tuition?.mode === 'online' ? 'bg-blue-100 text-blue-800' :
                          enrollment.tuition?.mode === 'home' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {enrollment.tuition?.mode === 'both' ? 'Online & In-person' :
                           enrollment.tuition?.mode === 'home' ? 'In-person' : 'Online'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/tutors/${enrollment.tuition?.tutor?.id}`)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      View Profile
                    </Button>
                    {pendingForThis && (
                      <Button
                        size="sm"
                        onClick={() => handlePayFees(pendingForThis)}
                        disabled={isPaying}
                        className="bg-green-600 hover:bg-green-700 text-white gap-1"
                      >
                        <CreditCard className="h-3 w-3" />
                        Pay ₹{pendingForThis.amount}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeEnrollment(enrollment.id)}
                      disabled={isRemoving}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Pending Payment Alert on Card */}
                {pendingForThis && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-orange-700">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>Pending payment of <span className="font-bold">₹{pendingForThis.amount}</span> for this month</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handlePayFees(pendingForThis)}
                      disabled={isPaying}
                      className="bg-orange-600 hover:bg-orange-700 text-white text-xs gap-1 ml-2"
                    >
                      <CreditCard className="h-3 w-3" />
                      Pay Fees
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment History */}
      {payments && payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Your recent tuition payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {payments.slice(0, 10).map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{payment.tutor?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-600">{payment.tuition?.subject} - {payment.month}</p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className="font-semibold text-gray-900">₹{payment.amount}</span>
                    {payment.status === "paid" ? (
                      <Badge className="bg-green-100 text-green-800 border-green-300 gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Paid
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-800 border-orange-300">Pending</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Confirmation Dialog */}
      <Dialog open={!!paymentDialog} onOpenChange={(open) => !open && setPaymentDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CreditCard className="h-5 w-5 text-green-600" />
              Pay Monthly Fees
            </DialogTitle>
            <DialogDescription>
              Confirm your monthly tuition fee payment
            </DialogDescription>
          </DialogHeader>

          {paymentDialog && (
            <div className="space-y-4 py-4">
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                <p className="font-semibold text-indigo-900">{paymentDialog.tuition?.subject || 'Tuition'}</p>
                <p className="text-xs text-indigo-600">{paymentDialog.tutor?.name || 'Teacher'} • Month: {paymentDialog.month}</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Monthly Tuition Fee</span>
                    <span className="font-semibold text-gray-900">₹{paymentDialog.amount}</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-200 p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-green-900">Total Due</span>
                    <span className="text-2xl font-bold text-green-700">₹{paymentDialog.amount}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  No platform commission on monthly fee payments. Commission is only charged once during enrollment.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setPaymentDialog(null)} className="sm:flex-1">
              Cancel
            </Button>
            <Button
              onClick={confirmPayment}
              disabled={isPaying}
              className="sm:flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              {isPaying ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
              ) : (
                <><CreditCard className="h-4 w-4" /> Pay ₹{paymentDialog?.amount}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
