import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout, User, Scissors, Package, Calendar, Store } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-2 mb-6">
        <Layout className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Welcome, {user?.username}</CardTitle>
          <CardDescription>
            Manage your barbershop's services, products, and appointments.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 gap-2">
          <TabsTrigger value="overview" className="flex items-center">
            <Layout className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center">
            <Scissors className="h-4 w-4 mr-2" />
            Services
          </TabsTrigger>
          <TabsTrigger value="barbers" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Barbers
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center">
            <Package className="h-4 w-4 mr-2" />
            Products
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Appointments
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Overview</CardTitle>
              <CardDescription>Quick statistics and information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard 
                  title="Total Services" 
                  value="3" 
                  icon={<Scissors className="h-6 w-6 text-blue-500" />}
                  description="Available haircut services"
                />
                <StatsCard 
                  title="Total Barbers" 
                  value="2" 
                  icon={<User className="h-6 w-6 text-green-500" />}
                  description="Professional staff"
                />
                <StatsCard 
                  title="Total Products" 
                  value="4" 
                  icon={<Package className="h-6 w-6 text-amber-500" />}
                  description="Items in shop inventory"
                />
                <StatsCard 
                  title="Pending Appointments" 
                  value="0" 
                  icon={<Calendar className="h-6 w-6 text-red-500" />}
                  description="Upcoming bookings"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Service Management</CardTitle>
              <CardDescription>Add, edit, or remove services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center">
                <p className="text-gray-500">Service management functionality will be implemented in future updates.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="barbers">
          <Card>
            <CardHeader>
              <CardTitle>Barber Management</CardTitle>
              <CardDescription>Add, edit, or remove barbers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center">
                <p className="text-gray-500">Barber management functionality will be implemented in future updates.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>Add, edit, or remove products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center">
                <p className="text-gray-500">Product management functionality will be implemented in future updates.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Management</CardTitle>
              <CardDescription>View and manage client appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center">
                <p className="text-gray-500">Appointment management functionality will be implemented in future updates.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}

function StatsCard({ title, value, icon, description }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}