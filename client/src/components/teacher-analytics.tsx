import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useTutorAnalytics, useTutorPayments } from "@/hooks/use-enrollments";
import { useCreateTuition } from "@/hooks/use-tuitions";
import { Loader2, Users, TrendingUp, DollarSign, AlertCircle, Plus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Helper function to convert "2024-01" format to "Jan"
function formatMonthShort(monthStr: string): string {
  if (!monthStr) return "";
  const [year, month] = monthStr.split("-");
  const monthIndex = parseInt(month) - 1;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return monthNames[monthIndex] || monthStr;
}

// Helper function to get last 6 months with full month names
function getLast6Months(): { monthStr: string; monthName: string }[] {
  const months = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const monthStr = `${year}-${month}`;
    const monthName = formatMonthShort(monthStr);
    months.push({ monthStr, monthName });
  }
  
  return months;
}

export function TeacherAnalyticsDashboard() {
  const { data: analytics, isLoading: analyticsLoading } = useTutorAnalytics();
  const { data: payments, isLoading: paymentsLoading } = useTutorPayments();

  if (analyticsLoading || paymentsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="border-orange-200 bg-orange-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-orange-700">
            <AlertCircle className="h-5 w-5" />
            <p>Unable to load analytics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format monthly revenue data with month names and ensure at least 6 months
  const last6Months = getLast6Months();
  const revenueMap = new Map(
    (analytics.monthlyRevenue || []).map((item: any) => [item.month, item.amount])
  );
  
  const formattedMonthlyRevenue = last6Months.map(({ monthStr, monthName }) => ({
    month: monthName,
    monthStr: monthStr,
    amount: revenueMap.get(monthStr) || 0
  }));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Students */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{analytics.totalStudents}</div>
            <p className="text-xs text-blue-700 mt-1">Currently enrolled</p>
          </CardContent>
        </Card>

        {/* Expected Income */}
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-emerald-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Expected Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">₹{analytics.expectedIncome}</div>
            <p className="text-xs text-emerald-700 mt-1">All enrolled fees</p>
          </CardContent>
        </Card>

        {/* Income This Month */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-900 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Income This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">₹{analytics.incomeThisMonth}</div>
            <p className="text-xs text-green-700 mt-1">Fees received</p>
          </CardContent>
        </Card>

        {/* Pending Fees */}
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-900 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Pending Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">₹{analytics.pendingFees}</div>
            <p className="text-xs text-orange-700 mt-1">Expected - Received</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="post-tuition">Post a Tuition</TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Enrollment by Tuition */}
          {analytics.enrollmentsByTuition && analytics.enrollmentsByTuition.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Enrollment by Tuition</CardTitle>
                <CardDescription>Number of students in each tuition class</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.enrollmentsByTuition.map((enrollment: any) => (
                    <div key={enrollment.tuitionId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{enrollment.subject}</span>
                        <Badge variant="outline" className="ml-2">{enrollment.tuitionId}</Badge>
                      </div>
                      <div className="text-lg font-bold text-blue-600">{enrollment.count}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Monthly Revenue Chart */}
          {formattedMonthlyRevenue && formattedMonthlyRevenue.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Last 6 months of tuition fees received</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={formattedMonthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      angle={0}
                    />
                    <YAxis 
                      label={{ value: "Revenue (₹)", angle: -90, position: "insideLeft", offset: -5 }}
                    />
                    <Tooltip 
                      formatter={(value: any) => `₹${value}`}
                      labelFormatter={(label: string) => `Month: ${label}`}
                      contentStyle={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#2563eb" 
                      strokeWidth={3}
                      name="Revenue"
                      dot={{ fill: '#2563eb', r: 5 }}
                      activeDot={{ r: 7 }}
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Payment Details */}
          {payments && payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Payment Activity</CardTitle>
                <CardDescription>Latest fees received from students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {payments.slice(0, 10).map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
                      <div className="text-sm">
                        <p className="font-medium text-slate-900">{payment.student?.name}</p>
                        <p className="text-xs text-slate-600">{payment.tuition?.subject}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-slate-900">₹{payment.amount}</span>
                        <Badge 
                          className="ml-2" 
                          variant={payment.status === "paid" ? "default" : "outline"}
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Post Tuition Tab */}
        <TabsContent value="post-tuition">
          <PostTuitionForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PostTuitionForm() {
  const createTuition = useCreateTuition();
  const [form, setForm] = useState({
    subject: "",
    classLevel: "",
    timing: "",
    fees: "",
    mode: "online",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.classLevel || !form.timing || !form.fees) return;
    createTuition.mutate(
      {
        subject: form.subject,
        classLevel: form.classLevel,
        timing: form.timing,
        fees: parseInt(form.fees) || 0,
        mode: form.mode,
        description: form.description,
      },
      {
        onSuccess: () => {
          setForm({ subject: "", classLevel: "", timing: "", fees: "", mode: "online", description: "" });
        },
      }
    );
  };

  return (
    <Card className="bg-gradient-to-br from-teal-50/50 to-cyan-50/30 border-teal-200 border-l-4 border-l-teal-500">
      <CardHeader>
        <CardTitle className="text-teal-900 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Post a New Tuition
        </CardTitle>
        <CardDescription className="text-teal-800">
          Create a new tuition listing for students to discover.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-teal-900 font-semibold">Timing <span className="text-red-500">*</span></Label>
              <Input
                value={form.timing}
                onChange={(e) => setForm({ ...form, timing: e.target.value })}
                placeholder="10:30 AM - 12:00 PM"
                className="focus-glow border-teal-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-teal-900 font-semibold">Monthly Fee (₹) <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                value={form.fees}
                onChange={(e) => setForm({ ...form, fees: e.target.value })}
                placeholder="1000"
                className="focus-glow border-teal-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-teal-900 font-semibold">Mode</Label>
              <select
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
                className="w-full p-2 rounded-md border border-teal-200"
              >
                <option value="online">Online</option>
                <option value="home">In-person</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-teal-900 font-semibold">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What students will learn, prerequisites, etc."
              className="focus-glow border-teal-200"
            />
          </div>
          <Button disabled={createTuition.isPending} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
            {createTuition.isPending && <Loader2 className="mr-2 h-4 w-4 spin-smooth" />}
            Post Tuition
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
