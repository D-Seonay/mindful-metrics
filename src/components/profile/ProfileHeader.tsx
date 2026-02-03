import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ProfileHeader() {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold">Utilisateur Anonyme</h2>
            <p className="text-muted-foreground">user@example.com</p>
            <div className="mt-2 flex flex-wrap gap-2 justify-center md:justify-start">
              <Badge variant="secondary">Membre depuis 2024</Badge>
              <Badge variant="outline">Niveau 5</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
