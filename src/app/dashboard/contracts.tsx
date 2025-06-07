import { AppSidebar } from "@/components/dashboard/layout/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/@/ui/sidebar"
import { SiteHeader } from "@/components/dashboard/layout/site-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/@/ui/card"
import { Button } from "@/components/@/ui/button"
import { Input } from "@/components/@/ui/input"
import { Label } from "@/components/@/ui/label"
import { Badge } from "@/components/@/ui/badge"
import { FileText, Upload, Download, Clock, CheckCircle, XCircle, Search, Filter, Plus } from 'lucide-react'
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/@/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/@/ui/tabs"

interface Contract {
  id: string
  title: string
  type: 'service' | 'audio'
  status: 'draft' | 'pending' | 'active' | 'expired'
  createdAt: string
  expiresAt?: string
  counterparty: string
  value: number
}

export default function ContractsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [contracts] = useState<Contract[]>([
    {
      id: '1',
      title: 'Beat License Agreement',
      type: 'audio',
      status: 'active',
      createdAt: '2024-03-15',
      expiresAt: '2025-03-15',
      counterparty: 'John Doe',
      value: 500
    },
    {
      id: '2',
      title: 'Mixing Service Contract',
      type: 'service',
      status: 'pending',
      createdAt: '2024-03-10',
      counterparty: 'Studio XYZ',
      value: 1200
    }
  ])

  const getStatusColor = (status: Contract['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500'
      case 'expired':
        return 'bg-red-500/10 text-red-500'
      default:
        return 'bg-gray-500/10 text-gray-500'
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 animate-fade-in p-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Contracts</h1>
                <p className="text-muted-foreground">Manage your service and audio contracts</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Search contracts..." />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Contract
                </Button>
              </div>
            </div>

            {/* Contract Types */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">All Contracts</TabsTrigger>
                <TabsTrigger value="service">Service Contracts</TabsTrigger>
                <TabsTrigger value="audio">Audio Contracts</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="grid gap-4">
                  {contracts.map((contract) => (
                    <Card key={contract.id}>
                      <CardContent className="flex items-center gap-4 p-6">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium truncate">{contract.title}</h3>
                            <Badge variant="outline">{contract.type}</Badge>
                            <Badge className={getStatusColor(contract.status)}>
                              {contract.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>With {contract.counterparty}</span>
                            <span>•</span>
                            <span>${contract.value.toLocaleString()}</span>
                            <span>•</span>
                            <span>Created {new Date(contract.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button size="sm">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="service" className="mt-6">
                <div className="grid gap-4">
                  {contracts
                    .filter(contract => contract.type === 'service')
                    .map((contract) => (
                      <Card key={contract.id}>
                        <CardContent className="flex items-center gap-4 p-6">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <h3 className="font-medium truncate">{contract.title}</h3>
                              <Badge variant="outline">{contract.type}</Badge>
                              <Badge className={getStatusColor(contract.status)}>
                                {contract.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span>With {contract.counterparty}</span>
                              <span>•</span>
                              <span>${contract.value.toLocaleString()}</span>
                              <span>•</span>
                              <span>Created {new Date(contract.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            <Button size="sm">
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="audio" className="mt-6">
                <div className="grid gap-4">
                  {contracts
                    .filter(contract => contract.type === 'audio')
                    .map((contract) => (
                      <Card key={contract.id}>
                        <CardContent className="flex items-center gap-4 p-6">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <h3 className="font-medium truncate">{contract.title}</h3>
                              <Badge variant="outline">{contract.type}</Badge>
                              <Badge className={getStatusColor(contract.status)}>
                                {contract.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span>With {contract.counterparty}</span>
                              <span>•</span>
                              <span>${contract.value.toLocaleString()}</span>
                              <span>•</span>
                              <span>Created {new Date(contract.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            <Button size="sm">
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Create Contract Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Contract</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Contract Title</Label>
                    <Input id="title" placeholder="Enter contract title" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Contract Type</Label>
                    <select
                      id="type"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="service">Service Contract</option>
                      <option value="audio">Audio Contract</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="counterparty">Counterparty</Label>
                    <Input id="counterparty" placeholder="Enter counterparty name" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="value">Contract Value ($)</Label>
                    <Input id="value" type="number" placeholder="Enter contract value" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="file">Upload Contract</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Drag and drop your contract file here or{" "}
                        <Button variant="link" className="p-0 h-auto">browse</Button>
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button>Create Contract</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}