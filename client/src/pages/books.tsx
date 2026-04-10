import { useState } from "react";
import { useBooks, useCreateBook } from "@/hooks/use-books";
import { useUploadBookCover } from "@/hooks/use-upload";
import { LayoutShell } from "@/components/layout-shell";
import { GridCardSkeleton } from "@/components/app-skeletons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Filter, MapPin, Loader2, Plus, Upload, X, Book } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBookSchema } from "@shared/schema";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function BooksPage() {
  const [filters, setFilters] = useState({ subject: "", classLevel: "" });
  const [showListForm, setShowListForm] = useState(false);
  const { data: books, isLoading } = useBooks(filters);

  const handleFormClose = () => {
    setShowListForm(false);
  };

  return (
    <LayoutShell>
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 px-8 sm:px-12 sm:py-24 text-center py-16 border border-green-200/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
            <div className="space-y-2 text-center md:text-left flex-1">
              <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">Book Marketplace</h1>
              <p className="text-muted-foreground">Buy and sell textbooks within your community.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Input 
                placeholder="Search by subject..." 
                className="w-full md:w-64 rounded-xl focus-visible:ring-green-500 border-green-200/50 bg-white"
                value={filters.subject}
                onChange={(e) => setFilters({...filters, subject: e.target.value})}
              />
              <Button variant="outline" size="icon" className="shrink-0 rounded-xl hover:bg-green-100 hover:text-green-700 border-green-200/50 transition-colors">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* List a Book Section */}
        <div>
          <div className="flex items-center mb-4">
            <Button
              onClick={() => setShowListForm(!showListForm)}
              className="bg-green-600 hover:bg-green-700 text-white gap-2 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              {showListForm ? "Hide Form" : "List Book Now"}
            </Button>
          </div>
          {showListForm && <SellerActions onSubmitSuccess={handleFormClose} />}
        </div>

        {isLoading ? (
          <GridCardSkeleton count={8} className="lg:grid-cols-4" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {books?.map((book, index) => (
              <div key={book.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-scale-in">
                <BookCard book={book} />
              </div>
            ))}
            {books?.length === 0 && (
              <div className="col-span-full py-20 text-center animate-fade-in">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4 animate-bounce-soft" />
                <p className="text-lg text-muted-foreground">No books listed yet. Be the first!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </LayoutShell>
  );
}

function BookCard({ book }: { book: any }) {
  // Use book.imageUrl if available, else a placeholder with subject text
  const image = book.imageUrl || `https://placehold.co/400x300/e2e8f0/1e293b?text=${encodeURIComponent(book.subject || 'Book')}`;

  // Condition display helper
  const conditionColors: Record<string, string> = {
    "new": "bg-emerald-100 text-emerald-700",
    "like_new": "bg-teal-100 text-teal-700",
    "good": "bg-blue-100 text-blue-700",
    "fair": "bg-amber-100 text-amber-700",
    "poor": "bg-orange-100 text-orange-700"
  };

  const conditionLabel: Record<string, string> = {
    "new": "New",
    "like_new": "Like New",
    "good": "Good",
    "fair": "Fair",
    "poor": "Poor"
  };

  return (
    <Card className="group overflow-hidden border-border/60 card-hover card-book border-l-4 border-l-green-400 hover:border-l-green-600 transition-colors flex flex-col h-full">
      <div className="aspect-[4/3] overflow-hidden bg-secondary relative bg-gradient-to-br from-green-100/30 to-transparent">
        <img 
          src={image} 
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-2 right-2 animate-slide-in-from-right flex flex-col gap-2">
          <Badge className="bg-green-600 text-white backdrop-blur font-bold shadow-sm hover:bg-green-700 transition-all duration-300 text-base px-3 py-1">
            ₹{book.price}
          </Badge>
          {book.condition && (
            <Badge className={`${conditionColors[book.condition] || 'bg-gray-100 text-gray-700'} backdrop-blur font-medium shadow-sm text-xs`}>
              {conditionLabel[book.condition] || book.condition}
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3 bg-gradient-to-b from-green-50/50 to-transparent flex-1 flex flex-col">
        <div>
          <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-green-700 transition-colors duration-300">
            {book.title}
          </h3>
        </div>

        {/* Subject and Class Level */}
        {(book.subject || book.classLevel) && (
          <div className="space-y-1 text-xs">
            {book.subject && (
              <p className="text-green-700 font-semibold flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> Subject: <span className="text-gray-700 font-normal">{book.subject}</span>
              </p>
            )}
            {book.classLevel && (
              <p className="text-green-700 font-semibold flex items-center gap-1">
                <Book className="w-3.5 h-3.5" /> Class/Grade: <span className="text-gray-700 font-normal">{book.classLevel}</span>
              </p>
            )}
          </div>
        )}

        {/* Location */}
        {(book.seller?.location || book.location) && (
          <div className="flex items-center text-xs text-green-700 gap-1 font-medium">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="line-clamp-1">{book.seller?.location || book.location}</span>
          </div>
        )}

        {/* Description */}
        {book.description && (
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed italic">
            "{book.description}"
          </p>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all btn-hover shadow-md hover:shadow-lg"
          onClick={() => {
            const email = book.seller?.email;
            if (email) {
              const subject = encodeURIComponent(`Interested in ${book.title}`);
              window.location.href = `mailto:${email}?subject=${subject}`;
            } else if (book.sellerId) {
              window.location.href = `/profile/${book.sellerId}`;
            } else {
              alert("Seller contact not available.");
            }
          }}
        >
          Contact Seller
        </Button>
      </CardFooter>
    </Card>
  );
}

function SellerActions({ onSubmitSuccess }: { onSubmitSuccess?: () => void }) {
  const createBook = useCreateBook();
  const uploadBookCover = useUploadBookCover();
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const form = useForm({
    resolver: zodResolver(insertBookSchema.omit({ sellerId: true })),
    defaultValues: {
      title: "",
      subject: "",
      classLevel: "",
      price: 0,
      condition: "good" as const,
      location: "",
      description: "",
      sold: false,
      imageUrl: ""
    }
  });

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image
    uploadBookCover.mutate(file, {
      onSuccess: (data) => {
        setUploadedImageUrl(data.imageUrl);
      },
    });
  };

  const removeImage = () => {
    setUploadedImageUrl(null);
    setPreviewUrl(null);
  };

  const onSubmit = (data: any) => {
    const submitData = {
      ...data,
      imageUrl: uploadedImageUrl || data.imageUrl || undefined,
    };
    createBook.mutate(submitData, {
      onSuccess: () => {
        form.reset();
        setUploadedImageUrl(null);
        setPreviewUrl(null);
        onSubmitSuccess?.();
      }
    });
  };

  return (
    <Card className="bg-gradient-to-br from-green-50/50 to-emerald-50/30 border-green-200 border-l-4 border-l-green-500 animate-slide-in-from-top">
      <CardHeader>
        <CardTitle className="text-green-900">List a Book</CardTitle>
        <CardDescription className="text-green-800">Sell your used textbooks to other students.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Book Cover Upload */}
          <div className="space-y-2">
            <Label className="text-green-900 font-semibold">Book Cover Image</Label>
            <div className="border-2 border-dashed border-green-300 rounded-lg p-4 hover:border-green-500 transition-colors">
              {previewUrl || uploadedImageUrl ? (
                <div className="relative inline-block w-full">
                  <img 
                    src={(previewUrl || uploadedImageUrl)!} 
                    alt="Book cover preview"
                    className="w-32 h-40 object-cover rounded-lg mx-auto"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={uploadBookCover.isPending}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {uploadBookCover.isPending && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer py-6">
                  <Upload className="w-8 h-8 text-green-500 mb-2" />
                  <span className="text-sm font-medium text-green-900">Click to upload book cover</span>
                  <span className="text-xs text-green-600">JPG or PNG, max 2MB</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleImageSelect}
                    disabled={uploadBookCover.isPending}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-green-900 font-semibold">Book Title</Label>
              <Input {...form.register("title")} placeholder="Calculus 101" className="focus-glow border-green-200" />
            </div>
            <div className="space-y-2">
              <Label className="text-green-900 font-semibold">Price (₹)</Label>
              <Input {...form.register("price", { valueAsNumber: true })} type="number" className="focus-glow border-green-200" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-green-900 font-semibold">Subject</Label>
              <Input {...form.register("subject")} placeholder="Mathematics" className="focus-glow border-green-200" />
            </div>
            <div className="space-y-2">
              <Label className="text-green-900 font-semibold">Class/Grade Level</Label>
              <Input {...form.register("classLevel")} placeholder="Class 10" className="focus-glow border-green-200" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-green-900 font-semibold">Book Condition <span className="text-red-500">*</span></Label>
            <select {...form.register("condition")} className="w-full p-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="new">New</option>
              <option value="like_new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-green-900 font-semibold">Location</Label>
            <Input {...form.register("location")} placeholder="Your city/area" className="focus-glow border-green-200" />
          </div>
          <div className="space-y-2">
            <Label className="text-green-900 font-semibold">Description</Label>
            <Textarea {...form.register("description")} placeholder="Details about the book, any damage, highlights, etc..." className="focus-glow border-green-200" />
          </div>
          <Button disabled={createBook.isPending || uploadBookCover.isPending} className="w-full bg-green-600 hover:bg-green-700 text-white">
            {(createBook.isPending || uploadBookCover.isPending) && <Loader2 className="mr-2 h-4 w-4 spin-smooth" />}
            List Book
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
