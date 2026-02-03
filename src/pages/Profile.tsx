import { Layout } from "@/components/Layout";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { StatsOverview } from "@/components/profile/StatsOverview";
import { PreferencesSettings } from "@/components/profile/PreferencesSettings";
import { DataManagement } from "@/components/profile/DataManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Profile() {
  return (
    <Layout>
       <div className="container mx-auto px-4 py-8 max-w-5xl">
          <h1 className="text-3xl font-bold mb-6">Mon Profil</h1>
          
          <ProfileHeader />

          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="stats">Statistiques</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
            </TabsList>
            <TabsContent value="stats" className="space-y-6">
              <StatsOverview />
            </TabsContent>
            <TabsContent value="settings" className="space-y-6">
              <PreferencesSettings />
              <DataManagement />
            </TabsContent>
          </Tabs>
       </div>
    </Layout>
  )
}
