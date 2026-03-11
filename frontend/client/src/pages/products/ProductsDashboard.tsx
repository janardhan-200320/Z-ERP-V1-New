import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Search, Filter, Grid, List, Package, DollarSign, AlertTriangle, XCircle, Upload, Download, Eye, Edit, TrendingUp, TrendingDown, Warehouse, Image as ImageIcon, Tag, Users, MapPin, Calendar, Trash2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import StatsCard from '@/components/StatsCard';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  reorderLevel: number;
  price: number;
  costPrice: number;
  status: 'Active' | 'Inactive';
  image?: string;
  supplier?: string;
  location?: string;
  description?: string;
}

interface InventoryRecord {
  id: string;
  productName: string;
  location: string;
  stockIn: number;
  stockOut: number;
  available: number;
  reorderLevel: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

interface PricingRecord {
  id: string;
  productName: string;
  costPrice: number;
  sellingPrice: number;
  marginPercent: number;
  priceType: 'Standard' | 'Promotional';
  lastUpdated: string;
}

interface Category {
  id: string;
  name: string;
  parentCategory?: string;
  productCount: number;
  status: 'Active' | 'Inactive';
  description?: string;
}

export default function ProductsDashboard() {
  const [activeTab, setActiveTab] = useState('list');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showProductDetailsModal, setShowProductDetailsModal] = useState(false);
  const [showInventoryAdjustModal, setShowInventoryAdjustModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showPricingEditModal, setShowPricingEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');

  // Mock data
  const products: Product[] = [
    {
      id: '1',
      name: 'Wireless Mouse Pro',
      sku: 'WMP-001',
      category: 'Electronics',
      stock: 150,
      reorderLevel: 50,
      price: 29.99,
      costPrice: 15.0,
      status: 'Active',
      supplier: 'Tech Supplies Co.',
      location: 'Warehouse A',
      description: 'High-precision wireless mouse with ergonomic design',
    },
    {
      id: '2',
      name: 'Office Chair Executive',
      sku: 'OCE-002',
      category: 'Furniture',
      stock: 25,
      reorderLevel: 30,
      price: 299.99,
      costPrice: 150.0,
      status: 'Active',
      supplier: 'Furniture Plus',
      location: 'Warehouse B',
      description: 'Premium executive chair with lumbar support',
    },
    {
      id: '3',
      name: 'USB-C Cable 2m',
      sku: 'USB-003',
      category: 'Accessories',
      stock: 0,
      reorderLevel: 100,
      price: 12.99,
      costPrice: 5.0,
      status: 'Active',
      supplier: 'Cable World',
      location: 'Warehouse A',
      description: 'High-speed USB-C charging and data cable',
    },
    {
      id: '4',
      name: 'Notebook A4 Premium',
      sku: 'NBA-004',
      category: 'Stationery',
      stock: 500,
      reorderLevel: 200,
      price: 4.99,
      costPrice: 2.0,
      status: 'Active',
      supplier: 'Paper Co.',
      location: 'Warehouse C',
      description: 'Premium quality ruled notebook',
    },
    {
      id: '5',
      name: 'Desk Lamp LED',
      sku: 'DLL-005',
      category: 'Electronics',
      stock: 15,
      reorderLevel: 20,
      price: 45.99,
      costPrice: 22.0,
      status: 'Active',
      supplier: 'Tech Supplies Co.',
      location: 'Warehouse A',
      description: 'Adjustable LED desk lamp with touch control',
    },
  ];

  const initialCategories: Category[] = [
    { id: '1', name: 'Electronics', productCount: 2, status: 'Active', description: 'Electronic devices and gadgets' },
    { id: '2', name: 'Furniture', productCount: 1, status: 'Active', description: 'Office and home furniture' },
    { id: '3', name: 'Accessories', productCount: 1, status: 'Active', description: 'Computer and office accessories' },
    { id: '4', name: 'Stationery', productCount: 1, status: 'Active', description: 'Office stationery supplies' },
  ];

  // Make categories editable in UI
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showViewCategoryModal, setShowViewCategoryModal] = useState(false);
  const [viewCategory, setViewCategory] = useState<Category | null>(null);

  const openEditCategory = (cat: Category) => {
    setSelectedCategory(cat);
    setShowEditCategoryModal(true);
  };

  const openViewCategory = (cat: Category) => {
    setViewCategory(cat);
    setShowViewCategoryModal(true);
  };

  const saveCategory = (updated: Category) => {
    setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
    setShowEditCategoryModal(false);
    setSelectedCategory(null);
  };

  const initialInventoryRecords: InventoryRecord[] = [
    {
      id: '1',
      productName: 'Wireless Mouse Pro',
      location: 'Warehouse A',
      stockIn: 200,
      stockOut: 50,
      available: 150,
      reorderLevel: 50,
      status: 'In Stock',
    },
    {
      id: '2',
      productName: 'Office Chair Executive',
      location: 'Warehouse B',
      stockIn: 50,
      stockOut: 25,
      available: 25,
      reorderLevel: 30,
      status: 'Low Stock',
    },
    {
      id: '3',
      productName: 'USB-C Cable 2m',
      location: 'Warehouse A',
      stockIn: 0,
      stockOut: 100,
      available: 0,
      reorderLevel: 100,
      status: 'Out of Stock',
    },
  ];

  // Make inventory records editable in UI
  const [inventoryRecords, setInventoryRecords] = useState<InventoryRecord[]>(initialInventoryRecords);

  const initialPricingRecords: PricingRecord[] = [
    {
      id: '1',
      productName: 'Wireless Mouse Pro',
      costPrice: 15.0,
      sellingPrice: 29.99,
      marginPercent: 49.98,
      priceType: 'Standard',
      lastUpdated: '2026-01-10',
    },
    {
      id: '2',
      productName: 'Office Chair Executive',
      costPrice: 150.0,
      sellingPrice: 299.99,
      marginPercent: 50.0,
      priceType: 'Standard',
      lastUpdated: '2026-01-08',
    },
    {
      id: '3',
      productName: 'USB-C Cable 2m',
      costPrice: 5.0,
      sellingPrice: 12.99,
      marginPercent: 61.51,
      priceType: 'Promotional',
      lastUpdated: '2026-01-05',
    },
  ];

  // Make pricing records editable in UI (allow changing Price Type inline)
  const [pricingRecords, setPricingRecords] = useState<PricingRecord[]>(initialPricingRecords);

  const updatePricingType = (id: string, type: PricingRecord['priceType']) => {
    setPricingRecords(prev => prev.map(r => r.id === id ? { ...r, priceType: type } : r));
  };

  // selected/editing pricing record for Actions -> Edit
  const [selectedPricingRecord, setSelectedPricingRecord] = useState<PricingRecord | null>(null);
  const [editingPricing, setEditingPricing] = useState<PricingRecord | null>(null);

  // Computed values
  const filteredProducts = products.filter(p => {
    const matchesCategory = !categoryFilter || categoryFilter === 'all' || p.category === categoryFilter;
    const matchesStock = !stockFilter || stockFilter === 'all' || 
      (stockFilter === 'in-stock' && p.stock > p.reorderLevel) ||
      (stockFilter === 'low-stock' && p.stock > 0 && p.stock <= p.reorderLevel) ||
      (stockFilter === 'out-of-stock' && p.stock === 0);
    return matchesCategory && matchesStock;
  });

  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= p.reorderLevel).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  const totalProducts = products.length;
  const inventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStockItems = products.filter((p) => p.stock < p.reorderLevel && p.stock > 0).length;
  const outOfStockItems = products.filter((p) => p.stock === 0).length;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Active':
      case 'In Stock':
        return 'default';
      case 'Inactive':
        return 'secondary';
      case 'Low Stock':
        return 'outline';
      case 'Out of Stock':
        return 'destructive';
      default:
        return 'default';
    }
  };

  // Update inventory record status handler
  const updateInventoryStatus = (id: string, status: InventoryRecord['status']) => {
    setInventoryRecords(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const ProductFormModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>Enter product details across multiple sections</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
            <TabsTrigger value="supplier">Supplier</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name *</Label>
                <Input id="productName" placeholder="Enter product name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input id="sku" placeholder="ABC-123" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="stationery">Stationery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Product description" rows={4} />
            </div>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price *</Label>
                <Input id="costPrice" type="number" placeholder="0.00" step="0.01" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price *</Label>
                <Input id="sellingPrice" type="number" placeholder="0.00" step="0.01" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="margin">Margin %</Label>
                <Input id="margin" type="number" placeholder="0.00" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate %</Label>
                <Input id="taxRate" type="number" placeholder="0.00" step="0.01" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountPrice">Discount Price</Label>
              <Input id="discountPrice" type="number" placeholder="0.00" step="0.01" />
            </div>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="initialStock">Initial Stock *</Label>
                <Input id="initialStock" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorderLevel">Reorder Level *</Label>
                <Input id="reorderLevel" type="number" placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Warehouse Location</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warehouse-a">Warehouse A</SelectItem>
                    <SelectItem value="warehouse-b">Warehouse B</SelectItem>
                    <SelectItem value="warehouse-c">Warehouse C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit of Measure</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="kg">Kilogram</SelectItem>
                    <SelectItem value="liter">Liter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="productImage">Product Images</Label>
              <Input id="productImage" type="file" multiple accept="image/*" />
              <p className="text-sm text-muted-foreground">Upload up to 5 images. First image will be the primary image.</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="border-2 border-dashed rounded-lg h-32 flex items-center justify-center text-muted-foreground">
                <Upload className="w-8 h-8" />
              </div>
            </div>
          </TabsContent>

          {/* Variants Tab */}
          <TabsContent value="variants" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Product Variants</Label>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Variant
                </Button>
              </div>
              <div className="border rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="variantName">Variant Name</Label>
                    <Input id="variantName" placeholder="e.g., Color, Size" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="variantValue">Value</Label>
                    <Input id="variantValue" placeholder="e.g., Red, Large" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="variantSKU">Variant SKU</Label>
                    <Input id="variantSKU" placeholder="SKU-VAR-001" />
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Add variants like size, color, or material for this product</p>
            </div>
          </TabsContent>

          {/* Supplier Tab */}
          <TabsContent value="supplier" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supplier1">Tech Supplies Co.</SelectItem>
                  <SelectItem value="supplier2">Furniture Plus</SelectItem>
                  <SelectItem value="supplier3">Cable World</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplierSKU">Supplier SKU</Label>
                <Input id="supplierSKU" placeholder="Supplier's product code" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leadTime">Lead Time (Days)</Label>
                <Input id="leadTime" type="number" placeholder="0" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierNotes">Supplier Notes</Label>
              <Textarea id="supplierNotes" placeholder="Additional supplier information" rows={3} />
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>Add Product</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage inventory, pricing, and product catalog</p>
        </div>
        <Button onClick={() => setShowAddProductModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Products"
          value={totalProducts.toString()}
          description="Active products"
          icon={Package}
        />
        <StatsCard
          title="Inventory Value"
          value={`$${inventoryValue.toLocaleString()}`}
          description="Total stock value"
          icon={DollarSign}
        />
        <StatsCard
          title="Low Stock Items"
          value={lowStockItems.toString()}
          description="Below reorder level"
          icon={AlertTriangle}
        />
        <StatsCard
          title="Out of Stock"
          value={outOfStockItems.toString()}
          description="Needs restocking"
          icon={XCircle}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Product List</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        {/* TAB 1: PRODUCT LIST */}
        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Products</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-[300px]"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={stockFilter} onValueChange={setStockFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Stock Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stock</SelectItem>
                      <SelectItem value="in-stock">In Stock</SelectItem>
                      <SelectItem value="low-stock">Low Stock</SelectItem>
                      <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="icon"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="icon"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button onClick={() => setShowAddProductModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'list' ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="font-medium">{product.name}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold">{product.stock}</span>
                            <span className="text-xs text-muted-foreground">
                              Reorder: {product.reorderLevel}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${product.price.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(product.status)}>
                            {product.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedProduct(product);
                                setShowProductDetailsModal(true);
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedProduct(product);
                                setShowAddProductModal(true);
                              }}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Product
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedProduct(product);
                                setShowInventoryAdjustModal(true);
                              }}>
                                <Warehouse className="mr-2 h-4 w-4" />
                                Adjust Stock
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <Card 
                      key={product.id} 
                      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowProductDetailsModal(true);
                      }}
                    >
                      <div className="aspect-square bg-gray-100 flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                      <CardContent className="p-4 space-y-2">
                        <h3 className="font-semibold truncate">{product.name}</h3>
                        <p className="text-sm text-muted-foreground font-mono">{product.sku}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{product.category}</Badge>
                          <span className="font-semibold">${product.price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Stock: {product.stock}</span>
                          <Badge variant={getStatusBadgeVariant(product.status)} className="text-xs">
                            {product.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: INVENTORY */}
        <TabsContent value="inventory" className="space-y-6">
          {/* Inventory Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
                <Warehouse className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.reduce((sum, p) => sum + p.stock, 0)}</div>
                <p className="text-xs text-muted-foreground">Units across all products</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${totalValue.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Current inventory value</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{lowStockCount}</div>
                <p className="text-xs text-muted-foreground">Products below reorder level</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
                <p className="text-xs text-muted-foreground">Products unavailable</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Inventory Management</CardTitle>
                <Button onClick={() => setShowInventoryAdjustModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adjust Inventory
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Stock In</TableHead>
                    <TableHead>Stock Out</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Reorder Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.productName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          {record.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-green-600 font-medium">
                          <TrendingUp className="w-4 h-4 inline mr-1" />
                          {record.stockIn}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-red-600 font-medium">
                          <TrendingDown className="w-4 h-4 inline mr-1" />
                          {record.stockOut}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-lg">{record.available}</TableCell>
                      <TableCell className="text-orange-600 font-medium">{record.reorderLevel}</TableCell>
                      <TableCell>
                        {/* Editable status badge: click to change status */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div>
                              <Badge variant={getStatusBadgeVariant(record.status)} className="cursor-pointer">
                                {record.status}
                              </Badge>
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {(['In Stock', 'Low Stock', 'Out of Stock'] as InventoryRecord['status'][]).map((s) => (
                              <DropdownMenuItem key={s} onClick={() => updateInventoryStatus(record.id, s)}>
                                {s}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setShowInventoryAdjustModal(true)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Adjust
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: CATEGORIES */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Product Categories</CardTitle>
                <Button onClick={() => setShowAddCategoryModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <Card key={category.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6 text-center space-y-2">
                      <Tag className="w-8 h-8 mx-auto text-primary" />
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-2xl font-bold text-primary">{category.productCount}</p>
                      <p className="text-sm text-muted-foreground">Products</p>
                      <Badge variant={category.status === 'Active' ? 'default' : 'secondary'}>
                        {category.status}
                      </Badge>
                      {category.description && (
                        <p className="text-xs text-muted-foreground pt-2">{category.description}</p>
                      )}
                      <div className="flex gap-2 pt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => openEditCategory(category)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => openViewCategory(category)}>
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: PRICING */}
        <TabsContent value="pricing" className="space-y-6">
          {/* Pricing Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Margin</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">52.4%</div>
                <p className="text-xs text-muted-foreground">Across all products</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${products.reduce((sum, p) => sum + p.costPrice, 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Sum of cost prices</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${products.reduce((sum, p) => sum + p.price, 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Sum of selling prices</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Margin</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">159.8%</div>
                <p className="text-xs text-muted-foreground">USB-C Cable 2m</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pricing Overview</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Cost Price</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Margin %</TableHead>
                    <TableHead>Price Type</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricingRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.productName}</TableCell>
                      <TableCell>${record.costPrice.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold">
                        ${record.sellingPrice.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span className="text-green-600 font-semibold">
                          {record.marginPercent.toFixed(2)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        {/* Price Type is now read-only in the table; editable via Actions -> Edit */}
                        <Badge variant={record.priceType === 'Standard' ? 'default' : 'secondary'}>
                          {record.priceType}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.lastUpdated}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedPricingRecord(record);
                            setEditingPricing(record);
                            setShowPricingEditModal(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ProductFormModal open={showAddProductModal} onClose={() => setShowAddProductModal(false)} />
      {/* Edit Category Modal */}
      <Dialog open={showEditCategoryModal} onOpenChange={setShowEditCategoryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category details</DialogDescription>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4">
              <div>
                <Label>Category Name *</Label>
                <Input
                  value={selectedCategory.name}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={selectedCategory.description || ''}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Parent Category</Label>
                {/* Use a non-empty value for the 'None' option to avoid empty string values */}
                <Select value={selectedCategory.parentCategory ?? 'none'} onValueChange={(v) => setSelectedCategory({ ...selectedCategory, parentCategory: v === 'none' ? undefined : v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Top Level)</SelectItem>
                    {categories.filter(c => c.id !== selectedCategory.id).map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="catStatus"
                  type="checkbox"
                  checked={selectedCategory.status === 'Active'}
                  onChange={(e) => setSelectedCategory({ ...selectedCategory, status: e.target.checked ? 'Active' : 'Inactive' })}
                />
                <Label htmlFor="catStatus">Active</Label>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setShowEditCategoryModal(false); setSelectedCategory(null); }}>Cancel</Button>
                <Button onClick={() => saveCategory(selectedCategory)}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* View Category Modal (read-only) */}
      <Dialog open={showViewCategoryModal} onOpenChange={setShowViewCategoryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Category Details</DialogTitle>
            <DialogDescription>View category information</DialogDescription>
          </DialogHeader>
          {viewCategory && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{viewCategory.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Parent Category</p>
                <p className="font-medium">{viewCategory.parentCategory ? (categories.find(c => c.id === viewCategory.parentCategory)?.name ?? 'Unknown') : 'Top Level'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Products</p>
                <p className="font-medium">{viewCategory.productCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={viewCategory.status === 'Active' ? 'default' : 'secondary'}>{viewCategory.status}</Badge>
              </div>
              {viewCategory.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{viewCategory.description}</p>
                </div>
              )}
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => { setShowViewCategoryModal(false); setViewCategory(null); }}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Product Details Modal */}
      {selectedProduct && (
        <Dialog open={showProductDetailsModal} onOpenChange={setShowProductDetailsModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedProduct.name}</DialogTitle>
              <DialogDescription>SKU: {selectedProduct.sku}</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Product Overview */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Product Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{selectedProduct.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={getStatusBadgeVariant(selectedProduct.status)}>
                      {selectedProduct.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Supplier</p>
                    <p className="font-medium">{selectedProduct.supplier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{selectedProduct.location}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="font-medium">{selectedProduct.description}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Pricing Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Pricing Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Cost Price</p>
                    <p className="text-xl font-semibold">${selectedProduct.costPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Selling Price</p>
                    <p className="text-xl font-semibold text-green-600">${selectedProduct.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Margin</p>
                    <p className="text-xl font-semibold text-blue-600">
                      {(((selectedProduct.price - selectedProduct.costPrice) / selectedProduct.costPrice) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Inventory Snapshot */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Inventory Snapshot</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Stock</p>
                    <p className="text-2xl font-bold">{selectedProduct.stock}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reorder Level</p>
                    <p className="text-2xl font-bold text-orange-600">{selectedProduct.reorderLevel}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Stock Value</p>
                    <p className="text-xl font-semibold">${(selectedProduct.price * selectedProduct.stock).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Inventory Adjustment Modal */}
      <Dialog open={showInventoryAdjustModal} onOpenChange={setShowInventoryAdjustModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Inventory</DialogTitle>
            <DialogDescription>Make adjustments to product inventory</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Product</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Adjustment Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="increase">Increase Stock</SelectItem>
                  <SelectItem value="decrease">Decrease Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantity</Label>
              <Input type="number" placeholder="Enter quantity" />
            </div>
            <div>
              <Label>Reason</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase">New Purchase</SelectItem>
                  <SelectItem value="return">Customer Return</SelectItem>
                  <SelectItem value="damage">Damaged Goods</SelectItem>
                  <SelectItem value="correction">Stock Correction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Input placeholder="Additional notes (optional)" />
            </div>
            <Button className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Save Adjustment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Add Category Modal */}
      <Dialog open={showAddCategoryModal} onOpenChange={setShowAddCategoryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>Create a new product category</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category Name *</Label>
              <Input placeholder="e.g., Electronics" />
            </div>
            <div>
              <Label>Parent Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="None (Top Level)" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Input placeholder="Category description (optional)" />
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="status" defaultChecked />
              <Label htmlFor="status">Active</Label>
            </div>
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Create Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Pricing Edit Modal */}
      <Dialog open={showPricingEditModal} onOpenChange={(open) => { if (!open) { setShowPricingEditModal(false); setSelectedPricingRecord(null); setEditingPricing(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pricing</DialogTitle>
            <DialogDescription>Update product pricing information</DialogDescription>
          </DialogHeader>
          {editingPricing ? (
            <div className="space-y-4">
              <div>
                <Label>Cost Price *</Label>
                <Input type="number" value={editingPricing.costPrice} onChange={(e) => setEditingPricing({ ...editingPricing, costPrice: Number(e.target.value) })} step="0.01" />
              </div>
              <div>
                <Label>Selling Price *</Label>
                <Input type="number" value={editingPricing.sellingPrice} onChange={(e) => setEditingPricing({ ...editingPricing, sellingPrice: Number(e.target.value) })} step="0.01" />
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Profit Margin</p>
                <p className="text-2xl font-bold text-green-600">{editingPricing.marginPercent.toFixed(2)}%</p>
              </div>
              <div>
                <Label>Price Type</Label>
                <Select value={editingPricing.priceType} onValueChange={(v) => setEditingPricing({ ...editingPricing, priceType: v as PricingRecord['priceType'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Promotional">Promotional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Effective Date</Label>
                <Input type="date" value={editingPricing.lastUpdated} onChange={(e) => setEditingPricing({ ...editingPricing, lastUpdated: e.target.value })} />
              </div>
              <div>
                <Label>Notes</Label>
                <Input placeholder="Pricing notes (optional)" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setShowPricingEditModal(false); setSelectedPricingRecord(null); setEditingPricing(null); }}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => {
                  if (editingPricing) {
                    setPricingRecords(prev => prev.map(r => r.id === editingPricing.id ? editingPricing : r));
                    setShowPricingEditModal(false);
                    setSelectedPricingRecord(null);
                    setEditingPricing(null);
                  }
                }}>
                  <Save className="mr-2 h-4 w-4" />
                  Update Pricing
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No pricing selected</div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  );
}
