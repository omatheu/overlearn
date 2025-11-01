import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="container max-w-4xl mx-auto p-6">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    </div>
  );
}
