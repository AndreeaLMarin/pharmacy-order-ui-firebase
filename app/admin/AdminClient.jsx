// app/admin/AdminClient.jsx
"use client";

import { useState } from "react";
import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "@/components/Header";
import { db } from "@/lib/firebase";
import {
  doc, updateDoc, deleteDoc, addDoc,
  collection, setDoc
} from "firebase/firestore";

export default function AdminClient() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [editingItem, setEditingItem] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");
  const [newProduct, setNewProduct] = useState({
    pharmacyId: "", quantityAvailable: 0,
  });
  const [newProductDetails, setNewProductDetails] = useState({
    name: "", category: "", dosage: "", price: "",
    description: "", expiryDate: "", healthInfo: "",
    usageInstructions: "", sideEffects: "", requiresPrescription: false,
  });

 

useEffect(() => {
    if (!loading && (!user || profile?.role !== "admin")) {
      router.push("/");
      return;
    }
    if (user && profile?.role === "admin") {
      fetchAllData();
    }
  }, [user, profile, loading]);

  async function fetchAllData() {
    const { collection, getDocs } = await import("firebase/firestore");
    const [pharmSnap, prodSnap, invSnap, ordSnap] = await Promise.all([
      getDocs(collection(db, "pharmacies")),
      getDocs(collection(db, "products")),
      getDocs(collection(db, "inventory")),
      getDocs(collection(db, "orders")),
    ]);
    setPharmacies(pharmSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setProducts(prodSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setInventoryList(invSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setOrders(ordSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setFetching(false);
  }

  async function handleDeleteInventory(inventoryId) {
    if (!confirm("Remove this product from inventory?")) return;
    await deleteDoc(doc(db, "inventory", inventoryId));
    setInventoryList((prev) => prev.filter((i) => i.id !== inventoryId));
    setMessage("Product removed from inventory.");
  }

  async function handleUpdateQuantity(inventoryId, newQty) {
    await updateDoc(doc(db, "inventory", inventoryId), {
      quantityAvailable: parseInt(newQty),
    });
    setInventoryList((prev) =>
      prev.map((i) =>
        i.id === inventoryId ? { ...i, quantityAvailable: parseInt(newQty) } : i
      )
    );
    setEditingItem(null);
    setMessage("Quantity updated.");
  }

  async function handleAddProduct() {
    if (!newProduct.pharmacyId || !newProductDetails.name) {
      setMessage("Please fill in all required fields.");
      return;
    }

    try {
      // Create new product
      const productRef = await addDoc(collection(db, "products"), {
        ...newProductDetails,
        price: parseFloat(newProductDetails.price),
        requiresPrescription: newProductDetails.requiresPrescription,
      });

      // Add to inventory
      const invRef = await addDoc(collection(db, "inventory"), {
        pharmacyId: newProduct.pharmacyId,
        productId: productRef.id,
        quantityAvailable: parseInt(newProduct.quantityAvailable),
        isActive: true,
      });

      setInventoryList((prev) => [
        ...prev,
        {
          id: invRef.id,
          pharmacyId: newProduct.pharmacyId,
          productId: productRef.id,
          quantityAvailable: parseInt(newProduct.quantityAvailable),
          isActive: true,
        },
      ]);

      setShowAddProduct(false);
      setMessage("Product added successfully!");
      setNewProduct({ pharmacyId: "", productId: "", quantityAvailable: 0 });
      setNewProductDetails({
        name: "", category: "", dosage: "", price: "",
        description: "", expiryDate: "", healthInfo: "",
        usageInstructions: "", sideEffects: "", requiresPrescription: false,
      });
    } catch (error) {
      setMessage("Failed to add product: " + error.message);
    }
  }

  const tabs = ["overview", "inventory", "orders", "add product"];

  if (loading) return <div className="min-h-screen"><Header /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage pharmacies, products and orders</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {message && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
            {message}
            <button onClick={() => setMessage("")} className="ml-2 font-bold">×</button>
          </div>
        )}

        {/* Overview tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Pharmacies", value: pharmacies.length },
              { label: "Products", value: products.length },
              { label: "Inventory Items", value: inventoryList.length },
              { label: "Total Orders", value: orders.length },
            ].map((stat) => (
              <div key={stat.label} className="bg-card border rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}

            {/* Pharmacy stock levels */}
            <div className="col-span-2 md:col-span-4 bg-card border rounded-lg p-4 mt-2">
              <h2 className="font-semibold mb-3">Stock Levels by Pharmacy</h2>
              <div className="space-y-2">
                {pharmacies.map((pharmacy) => {
                  const items = inventoryList.filter(
                    (i) => i.pharmacyId === pharmacy.id
                  );
                  return (
                    <div key={pharmacy.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <span className="text-sm font-medium">{pharmacy.name}</span>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{items.length} products</span>
                        <span>
                          {items.reduce((sum, i) => sum + i.quantityAvailable, 0)} units total
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Inventory tab */}
        {activeTab === "inventory" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">All Inventory</h2>
              <button
                onClick={() => setActiveTab("add product")}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:opacity-90"
              >
                + Add Product
              </button>
            </div>
            <div className="space-y-2">
              {inventoryList.map((item) => (
                <div
                  key={item.id}
                  className="bg-card border rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-sm">{getProductName(item.productId)}</p>
                    <p className="text-xs text-muted-foreground">{getPharmacyName(item.pharmacyId)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {editingItem === item.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          defaultValue={item.quantityAvailable}
                          className="w-20 border rounded-md px-2 py-1 text-sm"
                          id={`qty-${item.id}`}
                        />
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.id,
                              document.getElementById(`qty-${item.id}`).value
                            )
                          }
                          className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="border px-2 py-1 rounded text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className={`text-sm font-medium ${
                          item.quantityAvailable < 5 ? "text-red-600" : "text-green-600"
                        }`}>
                          {item.quantityAvailable} in stock
                        </span>
                        <button
                          onClick={() => setEditingItem(item.id)}
                          className="border px-2 py-1 rounded text-xs hover:bg-secondary"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteInventory(item.id)}
                          className="border border-destructive text-destructive px-2 py-1 rounded text-xs hover:bg-destructive/10"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders tab */}
        {activeTab === "orders" && (
          <div>
            <h2 className="font-semibold mb-4">All Orders</h2>
            <div className="space-y-2">
              {orders.length === 0 ? (
                <p className="text-muted-foreground">No orders yet.</p>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-card border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getPharmacyName(order.pharmacyId)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        order.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : order.status === "processing"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {order.status}
                      </span>
                      <p className="text-sm font-semibold text-primary mt-1">
                        £{order.total}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Add product tab */}
        {activeTab === "add product" && (
          <div className="max-w-2xl">
            <h2 className="font-semibold mb-4">Add New Product to Inventory</h2>
            <div className="bg-card border rounded-lg p-6 space-y-4">

              <div>
                <label className="block text-sm font-medium mb-1">Pharmacy *</label>
                <select
                  value={newProduct.pharmacyId}
                  onChange={(e) => setNewProduct({ ...newProduct, pharmacyId: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                >
                  <option value="">Select pharmacy...</option>
                  {pharmacies.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Product Name *</label>
                <input
                  type="text"
                  value={newProductDetails.name}
                  onChange={(e) => setNewProductDetails({ ...newProductDetails, name: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  placeholder="e.g. Ibuprofen 400mg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select
                    value={newProductDetails.category}
                    onChange={(e) => setNewProductDetails({ ...newProductDetails, category: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  >
                    <option value="">Select...</option>
                    <option>Pain Relief</option>
                    <option>Prescription</option>
                    <option>Vitamins & Supplements</option>
                    <option>Medical Devices</option>
                    <option>First Aid</option>
                    <option>Over the Counter</option>
                    <option>Wellness</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dosage</label>
                  <input
                    type="text"
                    value={newProductDetails.dosage}
                    onChange={(e) => setNewProductDetails({ ...newProductDetails, dosage: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                    placeholder="e.g. 400mg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price (£) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProductDetails.price}
                    onChange={(e) => setNewProductDetails({ ...newProductDetails, price: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity in Stock *</label>
                  <input
                    type="number"
                    value={newProduct.quantityAvailable}
                    onChange={(e) => setNewProduct({ ...newProduct, quantityAvailable: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={newProductDetails.expiryDate}
                  onChange={(e) => setNewProductDetails({ ...newProductDetails, expiryDate: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newProductDetails.description}
                  onChange={(e) => setNewProductDetails({ ...newProductDetails, description: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  rows={2}
                  placeholder="Brief product description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Health Info</label>
                <input
                  type="text"
                  value={newProductDetails.healthInfo}
                  onChange={(e) => setNewProductDetails({ ...newProductDetails, healthInfo: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Usage Instructions</label>
                <input
                  type="text"
                  value={newProductDetails.usageInstructions}
                  onChange={(e) => setNewProductDetails({ ...newProductDetails, usageInstructions: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Side Effects</label>
                <input
                  type="text"
                  value={newProductDetails.sideEffects}
                  onChange={(e) => setNewProductDetails({ ...newProductDetails, sideEffects: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="prescription"
                  checked={newProductDetails.requiresPrescription}
                  onChange={(e) => setNewProductDetails({ ...newProductDetails, requiresPrescription: e.target.checked })}
                />
                <label htmlFor="prescription" className="text-sm">Requires Prescription</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddProduct}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-md text-sm hover:opacity-90"
                >
                  Add Product
                </button>
                <button
                  onClick={() => setActiveTab("inventory")}
                  className="border px-6 py-2 rounded-md text-sm hover:bg-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}