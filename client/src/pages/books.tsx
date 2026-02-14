import { useState } from "react";
import { useBooks } from "@/hooks/use-books";
import { LayoutShell } from "@/components/layout-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, Search, Filter } from "lucide-react";

export default function BooksPage() {
  const [filters, setFilters] = useState({ subject: "", classLevel: "" });
  const { data: books, isLoading } = useBooks(filters);

  return (
    <LayoutShell>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl font-heading font-bold">Book Marketplace</h1>
            <p className="text-muted-foreground">Buy and sell textbooks within your community.</p>
          </div>
          <div className="flex gap-2">
            <Input 
              placeholder="Search by subject..." 
              className="w-full md:w-64 rounded-xl"
              value={filters.subject}
              onChange={(e) => setFilters({...filters, subject: e.target.value})}
            />
            <Button variant="outline" size="icon" className="shrink-0 rounded-xl">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {books?.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
            {books?.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
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
    <Card className="group overflow-hidden border-border/60 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-[4/3] overflow-hidden bg-secondary relative">
        <img 
          src={image} 
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2">
          <Badge className="bg-background/90 text-foreground backdrop-blur font-bold shadow-sm hover:bg-background/90">
            ${book.price}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-2">
        <h3 className="font-bold text-lg leading-tight line-clamp-1">{book.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{book.description || "No description provided."}</p>
        
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge variant="secondary" className="text-xs">{book.condition.replace('_', ' ')}</Badge>
          <Badge variant="outline" className="text-xs">{book.classLevel}</Badge>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button className="w-full rounded-lg bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
          Contact Seller
        </Button>
      </CardFooter>
    </Card>
  );
}
