import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl border-border/50">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-24 w-24 text-destructive opacity-80" />
          </div>
          
          <h1 className="text-4xl font-heading font-bold text-foreground">404</h1>
          <p className="text-xl text-muted-foreground mt-4">
            Oops! The page you're looking for doesn't exist.
          </p>

          <Link href="/">
            <Button size="lg" className="w-full mt-4 rounded-xl font-semibold">
              Return Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
