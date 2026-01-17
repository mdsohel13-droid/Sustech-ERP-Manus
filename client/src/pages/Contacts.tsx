import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
  Edit,
  Trash2,
  Star,
  StarOff,
  MessageSquare,
  FileText,
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  Tag,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";
import { trpc } from "@/lib/trpc";

interface Contact {
  id: number;
  name: string;
  company?: string;
  email: string;
  phone: string;
  address?: string;
  type: "customer" | "vendor" | "lead";
  status: "active" | "inactive";
  totalPurchases: number;
  lastContact?: string;
  tags: string[];
  segment?: string;
  isFavorite: boolean;
}

// Sample data
const SAMPLE_CONTACTS: Contact[] = [
  { id: 1, name: "Md. Rahim Khan", company: "Solar BD Ltd", email: "rahim@solarbd.com", phone: "+880 1712-345678", address: "Dhaka", type: "customer", status: "active", totalPurchases: 450000, lastContact: "2026-01-15", tags: ["VIP", "Solar"], segment: "High Value", isFavorite: true },
  { id: 2, name: "Fatima Begum", company: "Green Energy Co", email: "fatima@greenenergy.com", phone: "+880 1812-456789", address: "Chittagong", type: "customer", status: "active", totalPurchases: 280000, lastContact: "2026-01-10", tags: ["Regular"], segment: "Medium Value", isFavorite: false },
  { id: 3, name: "Abdul Karim", company: "Power Solutions", email: "karim@powersol.com", phone: "+880 1912-567890", address: "Sylhet", type: "vendor", status: "active", totalPurchases: 0, lastContact: "2026-01-12", tags: ["Supplier"], segment: "Partner", isFavorite: true },
  { id: 4, name: "Nasreen Akter", email: "nasreen@gmail.com", phone: "+880 1612-678901", address: "Rajshahi", type: "lead", status: "active", totalPurchases: 0, lastContact: "2026-01-14", tags: ["Hot Lead"], segment: "Prospect", isFavorite: false },
  { id: 5, name: "Jamal Uddin", company: "Tech Mart", email: "jamal@techmart.com", phone: "+880 1512-789012", address: "Khulna", type: "customer", status: "inactive", totalPurchases: 120000, lastContact: "2025-12-20", tags: ["Dormant"], segment: "At Risk", isFavorite: false },
];

const AI_SEGMENTS = [
  { name: "High Value", count: 1, color: "bg-purple-100 text-purple-700", description: "Top 20% by revenue" },
  { name: "Medium Value", count: 1, color: "bg-blue-100 text-blue-700", description: "Regular buyers" },
  { name: "At Risk", count: 1, color: "bg-orange-100 text-orange-700", description: "No activity in 30+ days" },
  { name: "Prospect", count: 1, color: "bg-green-100 text-green-700", description: "Potential customers" },
  { name: "Partner", count: 1, color: "bg-indigo-100 text-indigo-700", description: "Vendors & suppliers" },
];

export default function Contacts() {
  const { currency } = useCurrency();
  const [contacts, setContacts] = useState<Contact[]>(SAMPLE_CONTACTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "customer" | "vendor" | "lead">("all");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Filter contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesType = selectedType === "all" || contact.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [contacts, searchQuery, selectedType]);

  // Stats
  const stats = useMemo(() => {
    const totalContacts = contacts.length;
    const customers = contacts.filter(c => c.type === "customer").length;
    const vendors = contacts.filter(c => c.type === "vendor").length;
    const leads = contacts.filter(c => c.type === "lead").length;
    const totalRevenue = contacts.reduce((sum, c) => sum + c.totalPurchases, 0);
    return { totalContacts, customers, vendors, leads, totalRevenue };
  }, [contacts]);

  const toggleFavorite = (id: number) => {
    setContacts(contacts.map(c => 
      c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
    ));
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">Contacts</h1>
              <p className="text-muted-foreground">Manage customers, vendors, and leads</p>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Contact</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-sm font-medium">Full Name *</label>
                      <Input placeholder="Enter full name" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email *</label>
                      <Input type="email" placeholder="email@example.com" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone *</label>
                      <Input placeholder="+880 1XXX-XXXXXX" className="mt-1" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium">Company</label>
                      <Input placeholder="Company name (optional)" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Type *</label>
                      <select className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                        <option value="customer">Customer</option>
                        <option value="vendor">Vendor</option>
                        <option value="lead">Lead</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Address</label>
                      <Input placeholder="City, Country" className="mt-1" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                    <Button onClick={() => setShowAddDialog(false)}>Create Contact</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-xl font-bold">{stats.totalContacts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Customers</p>
                    <p className="text-xl font-bold">{stats.customers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Vendors</p>
                    <p className="text-xl font-bold">{stats.vendors}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Leads</p>
                    <p className="text-xl font-bold">{stats.leads}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="text-lg font-bold">{formatCurrency(stats.totalRevenue, currency)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Segments */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm">AI-Powered Segments</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {AI_SEGMENTS.map(segment => (
                  <button
                    key={segment.name}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105 ${segment.color}`}
                    title={segment.description}
                  >
                    {segment.name} ({segment.count})
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              {(["all", "customer", "vendor", "lead"] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors capitalize ${
                    selectedType === type
                      ? "bg-background shadow-sm"
                      : "hover:bg-background/50"
                  }`}
                >
                  {type === "all" ? "All" : type + "s"}
                </button>
              ))}
            </div>
          </div>

          {/* Contacts List */}
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {filteredContacts.map(contact => (
                  <div
                    key={contact.id}
                    className={`p-4 hover:bg-muted/30 cursor-pointer transition-colors ${
                      selectedContact?.id === contact.id ? "bg-muted/50" : ""
                    }`}
                    onClick={() => setSelectedContact(contact)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {contact.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm truncate">{contact.name}</h3>
                          {contact.isFavorite && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            contact.type === "customer" ? "bg-green-100 text-green-700" :
                            contact.type === "vendor" ? "bg-blue-100 text-blue-700" :
                            "bg-orange-100 text-orange-700"
                          }`}>
                            {contact.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          {contact.company && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {contact.company}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {contact.email}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {contact.totalPurchases > 0 && (
                          <p className="font-medium text-sm">{formatCurrency(contact.totalPurchases, currency)}</p>
                        )}
                        {contact.segment && (
                          <span className="text-xs text-muted-foreground">{contact.segment}</span>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(contact.id); }}
                        className="p-1.5 hover:bg-muted rounded-md"
                      >
                        {contact.isFavorite ? (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        ) : (
                          <StarOff className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 360° View Panel */}
        {selectedContact && (
          <div className="w-96 border-l border-border bg-muted/30 p-6 overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold">Contact Details</h2>
              <button
                onClick={() => setSelectedContact(null)}
                className="p-1 hover:bg-muted rounded-md"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Profile */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-medium mx-auto mb-3">
                {selectedContact.name.charAt(0)}
              </div>
              <h3 className="font-semibold">{selectedContact.name}</h3>
              {selectedContact.company && (
                <p className="text-sm text-muted-foreground">{selectedContact.company}</p>
              )}
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedContact.type === "customer" ? "bg-green-100 text-green-700" :
                  selectedContact.type === "vendor" ? "bg-blue-100 text-blue-700" :
                  "bg-orange-100 text-orange-700"
                }`}>
                  {selectedContact.type}
                </span>
                {selectedContact.segment && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                    {selectedContact.segment}
                  </span>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{selectedContact.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{selectedContact.phone}</span>
              </div>
              {selectedContact.address && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedContact.address}</span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mb-6">
              <Button variant="outline" size="sm" className="flex-1">
                <MessageSquare className="w-4 h-4 mr-1" />
                Message
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <FileText className="w-4 h-4 mr-1" />
                Invoice
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Card>
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground">Total Purchases</p>
                  <p className="font-semibold">{formatCurrency(selectedContact.totalPurchases, currency)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground">Last Contact</p>
                  <p className="font-semibold">{selectedContact.lastContact || "Never"}</p>
                </CardContent>
              </Card>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {selectedContact.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 bg-muted rounded-full">
                    {tag}
                  </span>
                ))}
                <button className="text-xs px-2 py-1 bg-muted rounded-full hover:bg-muted/80">
                  + Add
                </button>
              </div>
            </div>

            {/* Activity Timeline */}
            <div>
              <h4 className="text-sm font-medium mb-3">Recent Activity</h4>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                  <div>
                    <p className="text-sm">Invoice #INV-001 paid</p>
                    <p className="text-xs text-muted-foreground">2 days ago</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                  <div>
                    <p className="text-sm">Email sent</p>
                    <p className="text-xs text-muted-foreground">5 days ago</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5" />
                  <div>
                    <p className="text-sm">Order #ORD-042 placed</p>
                    <p className="text-xs text-muted-foreground">1 week ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
