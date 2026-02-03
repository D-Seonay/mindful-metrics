import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle"; // Reusing existing component for consistency

export function PreferencesSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Préférences</CardTitle>
        <CardDescription>
          Gérez vos paramètres d'application.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-1">
            <Label htmlFor="theme-toggle">Thème</Label>
            <p className="text-sm text-muted-foreground">
              Basculer entre le mode clair et sombre.
            </p>
          </div>
          <div id="theme-toggle">
             <ThemeToggle />
          </div>
        </div>

        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-1">
            <Label htmlFor="notifications">Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Recevoir des rappels d'entraînement.
            </p>
          </div>
          <Switch id="notifications" disabled checked={false} /> 
          {/* Disabled/Checked false as placeholder functionality */}
        </div>

        <div className="flex items-center justify-between space-x-2">
           <div className="space-y-1">
            <Label htmlFor="sound">Effets Sonores</Label>
            <p className="text-sm text-muted-foreground">
              Jouer des sons lors des interactions.
            </p>
          </div>
          <Switch id="sound" defaultChecked />
        </div>

        <div className="space-y-2">
            <Label htmlFor="language">Langue</Label>
             <Select disabled defaultValue="fr">
              <SelectTrigger id="language" className="w-[180px]">
                <SelectValue placeholder="Selectionner une langue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              La traduction complète n'est pas encore disponible.
            </p>
        </div>

        <div className="pt-4 flex justify-end">
            <Button>Sauvegarder les changements</Button>
        </div>

      </CardContent>
    </Card>
  );
}
