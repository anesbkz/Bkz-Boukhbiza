import React, { useState, useEffect } from 'react';
import {
  getAllProducts,
  getAllVariants,
  createProductAdmin,
  updateProductAdmin,
  createVariantAdmin,
} from '@/services/commerce/productService';
import {
  getAllInventory,
  updateInventoryAdmin,
} from '@/services/commerce/inventoryService';
import {
  Product,
  ProductVariant,
  InventoryRecord,
  ProductStatus,
} from '@/types/commerce';
import { formatDzdPrice } from '@/services/commerce/pricingService';
import { Button } from '@/components/design-system/Button';
import {
  Package,
  Plus,
  Edit2,
  RefreshCw,
  AlertTriangle,
  Boxes,
  DollarSign,
  Layers,
  X,
  CheckCircle2,
} from 'lucide-react';

export const CommerceCatalogTab: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [inventories, setInventories] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [targetProductForVariant, setTargetProductForVariant] = useState<Product | null>(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [targetVariantForInventory, setTargetVariantForInventory] = useState<ProductVariant | null>(null);

  // Form states
  const [productForm, setProductForm] = useState({
    sku: '',
    slug: '',
    name: '',
    description: '',
    brand: 'VIREXON BIOSCIENCES',
    category: 'CELLULAR_RECOVERY',
    status: 'ACTIVE' as ProductStatus,
  });

  const [variantForm, setVariantForm] = useState({
    sku: '',
    name: '',
    quantity: 1,
    unit: 'CONTAINER',
    price: 9800,
    initialStock: 100,
    lowStockThreshold: 10,
  });

  const [inventoryForm, setInventoryForm] = useState({
    availableQuantity: 100,
    lowStockThreshold: 10,
    reason: 'Restock adjustment',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadCommerceData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [pList, vList, iList] = await Promise.all([
        getAllProducts(),
        getAllVariants(),
        getAllInventory(),
      ]);
      setProducts(pList);
      setVariants(vList);
      setInventories(iList);
    } catch (err: any) {
      console.warn('Error loading commerce catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommerceData();
  }, []);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      if (editingProduct) {
        await updateProductAdmin(editingProduct.id, {
          brand: productForm.brand,
          status: productForm.status,
          name: { en: productForm.name, fr: productForm.name, ar: productForm.name },
          description: { en: productForm.description, fr: productForm.description, ar: productForm.description },
        });
      } else {
        await createProductAdmin({
          sku: productForm.sku.toUpperCase(),
          slug: productForm.slug.toLowerCase(),
          brand: productForm.brand,
          productType: 'PHYSICAL',
          status: productForm.status,
          shortDescription: { en: productForm.name, fr: productForm.name, ar: productForm.name },
          name: { en: productForm.name, fr: productForm.name, ar: productForm.name },
          description: { en: productForm.description, fr: productForm.description, ar: productForm.description },
        });
      }
      setShowProductModal(false);
      setEditingProduct(null);
      await loadCommerceData();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProductForVariant) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await createVariantAdmin({
        productId: targetProductForVariant.id,
        sku: variantForm.sku.toUpperCase(),
        name: { en: variantForm.name, fr: variantForm.name, ar: variantForm.name },
        quantity: Number(variantForm.quantity),
        unit: variantForm.unit,
        price: Number(variantForm.price),
        currency: 'DZD',
        initialStock: Number(variantForm.initialStock),
        lowStockThreshold: Number(variantForm.lowStockThreshold),
      });
      setShowVariantModal(false);
      setTargetProductForVariant(null);
      await loadCommerceData();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create variant');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetVariantForInventory) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const currentInv = inventories.find((i) => i.variantId === targetVariantForInventory.id);
      const currentAvailable = currentInv ? currentInv.availableQuantity : 0;
      const targetAvailable = Number(inventoryForm.availableQuantity);
      const adjustment = targetAvailable - currentAvailable;

      await updateInventoryAdmin({
        variantId: targetVariantForInventory.id,
        adjustment,
        reason: inventoryForm.reason || 'Manual inventory stock update',
      });
      setShowInventoryModal(false);
      setTargetVariantForInventory(null);
      await loadCommerceData();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to adjust inventory');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-500" />
            Commerce Product Catalog & Stock
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Authoritative product lines, SKU variants, DZD pricing, and warehouse inventory pools.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCommerceData}
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditingProduct(null);
              setProductForm({
                sku: '',
                slug: '',
                name: '',
                description: '',
                brand: 'VIREXON BIOSCIENCES',
                category: 'CELLULAR_RECOVERY',
                status: 'ACTIVE',
              });
              setShowProductModal(true);
            }}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            New Product
          </Button>
        </div>
      </div>

      {/* Catalog Listing */}
      {loading ? (
        <div className="py-20 text-center text-zinc-400">
          <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-zinc-500" />
          Loading products & inventory...
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center text-zinc-400 bg-zinc-900/30 rounded-2xl border border-zinc-800">
          <Package className="w-10 h-10 mx-auto mb-3 text-zinc-600" />
          <p className="text-base font-medium text-zinc-300">No products configured in catalog yet.</p>
          <p className="text-xs text-zinc-500 mt-1">Click "New Product" to seed your authoritative catalog.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((prod) => {
            const productVariants = variants.filter((v) => v.productId === prod.id);

            return (
              <div
                key={prod.id}
                className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-800/60"
              >
                {/* Product Header */}
                <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-zinc-900/80">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white text-base">
                        {prod.name.en || prod.name.fr || prod.sku}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-800 text-emerald-400">
                        SKU: {prod.sku}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                          prod.status === 'ACTIVE'
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        {prod.status}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-1">
                      Brand: {prod.brand} • Type: {prod.productType} • Slug: /{prod.slug}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingProduct(prod);
                        setProductForm({
                          sku: prod.sku,
                          slug: prod.slug,
                          name: prod.name.en || '',
                          description: prod.description?.en || '',
                          brand: prod.brand,
                          category: prod.category || 'CELLULAR_RECOVERY',
                          status: prod.status,
                        });
                        setShowProductModal(true);
                      }}
                      className="text-xs text-zinc-300"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      Edit Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setTargetProductForVariant(prod);
                        setVariantForm({
                          sku: `${prod.sku}-1M`,
                          name: '1-Month Container',
                          quantity: 1,
                          unit: 'CONTAINER',
                          price: 9800,
                          initialStock: 100,
                          lowStockThreshold: 10,
                        });
                        setShowVariantModal(true);
                      }}
                      className="text-xs text-emerald-400 border-emerald-800/40 hover:bg-emerald-950/30"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add Variant
                    </Button>
                  </div>
                </div>

                {/* Variants List */}
                <div className="p-4 space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-zinc-500" />
                    Product Variants & Warehouse Stock ({productVariants.length})
                  </div>

                  {productVariants.length === 0 ? (
                    <div className="text-xs text-zinc-500 italic py-2">
                      No variants registered. Customers cannot order until at least one active variant with inventory exists.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {productVariants.map((v) => {
                        const inv = inventories.find((i) => i.variantId === v.id);

                        return (
                          <div
                            key={v.id}
                            className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-3.5 space-y-2 flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-white text-sm">
                                  {v.name.en || v.sku}
                                </span>
                                <span className="text-xs font-bold text-emerald-400">
                                  {formatDzdPrice(v.price)}
                                </span>
                              </div>
                              <div className="text-xs font-mono text-zinc-500 mt-0.5">
                                SKU: {v.sku} ({v.quantity} {v.unit})
                              </div>
                            </div>

                            {/* Inventory indicators */}
                            <div className="pt-2 border-t border-zinc-800/80 text-xs flex items-center justify-between">
                              <div>
                                <span className="text-zinc-400">Stock: </span>
                                <span
                                  className={`font-semibold ${
                                    (inv?.availableQuantity || 0) <= 0
                                      ? 'text-red-400'
                                      : (inv?.availableQuantity || 0) <= (inv?.lowStockThreshold || 10)
                                      ? 'text-amber-400'
                                      : 'text-emerald-400'
                                  }`}
                                >
                                  {inv?.availableQuantity ?? 0} available
                                </span>
                                {inv && inv.reservedQuantity > 0 && (
                                  <span className="text-zinc-500 ml-1">
                                    ({inv.reservedQuantity} reserved)
                                  </span>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setTargetVariantForInventory(v);
                                  setInventoryForm({
                                    availableQuantity: inv?.availableQuantity ?? 100,
                                    lowStockThreshold: inv?.lowStockThreshold ?? 10,
                                    reason: 'Periodic inventory count update',
                                  });
                                  setShowInventoryModal(true);
                                }}
                                className="text-[11px] h-6 px-2 text-zinc-300 hover:text-white"
                              >
                                <Boxes className="w-3 h-3 mr-1" />
                                Adjust
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">
                {editingProduct ? 'Edit Catalog Product' : 'Create New Product'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-zinc-400 hover:text-white"
                aria-label="Close product modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Product SKU</label>
                <input
                  type="text"
                  required
                  disabled={!!editingProduct}
                  placeholder="e.g. ZIRON-PH01"
                  value={productForm.sku}
                  onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">URL Slug</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ziron-ph01"
                  value={productForm.slug}
                  onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Display Name (EN)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ZIRON Phase 01 Container"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Brand</label>
                <input
                  type="text"
                  required
                  value={productForm.brand}
                  onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Status</label>
                <select
                  value={productForm.status}
                  onChange={(e) =>
                    setProductForm({ ...productForm, status: e.target.value as ProductStatus })
                  }
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white"
                >
                  <option value="ACTIVE">ACTIVE (Visible in Store)</option>
                  <option value="DRAFT">DRAFT (Hidden)</option>
                  <option value="OUT_OF_STOCK">OUT OF STOCK</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowProductModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Variant Modal */}
      {showVariantModal && targetProductForVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">
                Add Variant for {targetProductForVariant.sku}
              </h3>
              <button
                onClick={() => setShowVariantModal(false)}
                className="text-zinc-400 hover:text-white"
                aria-label="Close variant modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveVariant} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Variant SKU</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ZIRON-PH01-1M"
                  value={variantForm.sku}
                  onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Variant Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard 1-Month Supply"
                  value={variantForm.name}
                  onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Pack Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={variantForm.quantity}
                    onChange={(e) =>
                      setVariantForm({ ...variantForm, quantity: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    required
                    value={variantForm.unit}
                    onChange={(e) => setVariantForm({ ...variantForm, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Price (DZD)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    required
                    value={variantForm.price}
                    onChange={(e) =>
                      setVariantForm({ ...variantForm, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Initial Stock Units</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={variantForm.initialStock}
                    onChange={(e) =>
                      setVariantForm({ ...variantForm, initialStock: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowVariantModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Variant'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inventory Adjustment Modal */}
      {showInventoryModal && targetVariantForInventory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">
                Adjust Inventory: {targetVariantForInventory.sku}
              </h3>
              <button
                onClick={() => setShowInventoryModal(false)}
                className="text-zinc-400 hover:text-white"
                aria-label="Close inventory modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveInventory} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Available Quantity</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={inventoryForm.availableQuantity}
                  onChange={(e) =>
                    setInventoryForm({
                      ...inventoryForm,
                      availableQuantity: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Low Stock Threshold</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={inventoryForm.lowStockThreshold}
                  onChange={(e) =>
                    setInventoryForm({
                      ...inventoryForm,
                      lowStockThreshold: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Reason for Adjustment</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Warehouse receipt / count reconciliation"
                  value={inventoryForm.reason}
                  onChange={(e) =>
                    setInventoryForm({ ...inventoryForm, reason: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowInventoryModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Update Stock'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
