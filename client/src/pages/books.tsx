import { useState } from "react";
import { useBooks } from "@/hooks/use-books";
import { LayoutShell } from "@/components/layout-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, Search, Filter, MapPin } from "lucide-react";

export default function BooksPage() {
  const [filters, setFilters] = useState({ subject: "", classLevel: "" });
  const { data: books, isLoading } = useBooks(filters);

  return (
    <LayoutShell>
      <div className="space-y-8">
        <div className="gradient-hero rounded-3xl p-8 sm:p-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="space-y-2 text-center md:text-left flex-1">
              <h1 className="text-3xl font-heading font-bold header-gradient-text">Book Marketplace</h1>
              <p className="text-muted-foreground">Buy and sell textbooks within your community.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Input 
                placeholder="Search by subject..." 
                className="w-full md:w-64 rounded-xl focus-glow"
                value={filters.subject}
                onChange={(e) => setFilters({...filters, subject: e.target.value})}
              />
              <Button variant="outline" size="icon" className="shrink-0 rounded-xl hover:bg-green-100 hover:text-green-700 transition-colors">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
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

  return (
    <Card className="group overflow-hidden border-border/60 card-hover card-book border-l-4 border-l-green-400 hover:border-l-green-600 transition-colors">
      <div className="aspect-[4/3] overflow-hidden bg-secondary relative bg-gradient-to-br from-green-100/30 to-transparent">
        <img 
          src={image} 
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-2 right-2 animate-slide-in-from-right">
          <Badge className="bg-green-600 text-white backdrop-blur font-bold shadow-sm hover:bg-green-700 transition-all duration-300">
            ₹{book.price}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-2 bg-gradient-to-b from-green-50/50 to-transparent">
        <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-green-700 transition-colors duration-300">{book.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 transition-colors duration-300">{book.description || "No description provided."}</p>
        
        {(book.seller?.location || book.location) && (
          <div className="flex items-center text-xs text-green-700 gap-1 pt-1 font-medium">
            <MapPin className="w-3 h-3" />
            <span>{book.seller?.location || book.location}</span>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge variant="secondary" className="text-xs animate-fade-in bg-green-200 text-green-800">{book.condition.replace('_', ' ')}</Badge>
          <Badge variant="outline" className="text-xs animate-fade-in border-green-300 text-green-700">{book.classLevel}</Badge>
        </div>
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
