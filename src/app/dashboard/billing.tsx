import { AppSidebar } from "@/components/dashboard/layout/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/@/ui/sidebar"
import { SiteHeader } from "@/components/dashboard/layout/site-header"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/@/ui/progress"
import { Badge } from "@/components/@/ui/badge"
import { Check, HardDrive, Database, Cloud, CreditCard, Download, Upload } from "lucide-react"

const plans = [
  {
    name: "Basic",
    price: 9.99,
    storage: "10GB",
    features: [
      "10GB Storage Space",
      "Basic Audio Quality",
      "2 Projects",
      "Email Support"
    ],
    popular: false
  },
  {
    name: "Pro",
    price: 19.99,
    storage: "50GB",
    features: [
      "50GB Storage Space",
      "High Quality Audio",
      "Unlimited Projects",
      "Priority Support",
      "Advanced Analytics"
    ],
    popular: true
  },
  {
    name: "Enterprise",
    price: 49.99,
    storage: "200GB",
    features: [
      "200GB Storage Space",
      "Lossless Audio Quality",
      "Unlimited Everything",
      "24/7 Support",
      "Custom Features",
      "API Access"
    ],
    popular: false
  }
];

export default function BillingPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 animate-fade-in p-8">
            {/* Current Plan Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Storage Overview</CardTitle>
                <CardDescription>Manage your storage and subscription</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Current Plan</p>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold">Pro Plan</h3>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </div>
                  <Button variant="outline">Manage Plan</Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Storage Used</span>
                    <span className="font-medium">34.2GB of 50GB</span>
                  </div>
                  <Progress value={68} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Upload className="h-3 w-3" />
                      <span>2.1GB Uploaded this month</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      <span>5.3GB Downloaded</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Next Payment</p>
                    <p className="text-sm text-muted-foreground">$19.99 due on April 1, 2024</p>
                  </div>
                  <Button variant="outline">Update Payment</Button>
                </div>
              </CardContent>
            </Card>

            {/* Plans */}
            <div className="grid gap-6 lg:grid-cols-3">
              {plans.map((plan) => (
                <Card key={plan.name} className={plan.popular ? "border-primary" : ""}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {plan.name}
                      {plan.popular && (
                        <Badge className="ml-2">Popular</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      {plan.name === "Basic" && <HardDrive className="h-8 w-8 text-primary" />}
                      {plan.name === "Pro" && <Database className="h-8 w-8 text-primary" />}
                      {plan.name === "Enterprise" && <Cloud className="h-8 w-8 text-primary" />}
                      <div>
                        <p className="font-medium">{plan.storage} Storage</p>
                        <p className="text-sm text-muted-foreground">High-speed cloud storage</p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                      {plan.popular ? "Upgrade to Pro" : `Get ${plan.name}`}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}