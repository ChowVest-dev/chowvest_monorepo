"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Button } from "@chowvest/ui";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@chowvest/ui";
import { Input } from "@chowvest/ui";
import { Label } from "@chowvest/ui";
import { Loader2, Pencil, Plus, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";
import {
  updateCommodityPrice, toggleCommodityStatus,
  createCommodity, updatePlatformConfig, updateCommodity,
} from "./actions";

// ── Edit Price ─────────────────────────────────────────────────
export function EditPriceButton({
  commodityId, currentPrice, name,
}: { commodityId: string; currentPrice: number; name: string }) {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(String(currentPrice));
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateCommodityPrice(commodityId, parseFloat(price));
        toast.success(`Price updated for ${name}`);
        setOpen(false);
      } catch (e: any) {
        toast.error(e.message || "Failed to update price");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Pencil className="w-3.5 h-3.5 mr-1" /> Edit Price
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Update Price</DialogTitle>
          <DialogDescription>Change the market price for <strong>{name}</strong>.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="price" className="mb-1.5 block">New Price (₦)</Label>
          <Input
            id="price"
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={isPending}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={isPending || !price} className="bg-green-600 hover:bg-green-700 text-white">
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Price
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Commodity (full details) ───────────────────────────────
export function EditCommodityButton({
  commodity,
}: {
  commodity: {
    id: string;
    name: string;
    sku: string;
    category: string;
    brand: string | null;
    price: number;
    unit: string;
    size: number;
    image: string | null;
    description: string | null;
    marketType: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: commodity.name,
    sku: commodity.sku,
    category: commodity.category,
    brand: commodity.brand ?? "",
    price: String(commodity.price),
    unit: commodity.unit,
    size: String(commodity.size),
    image: commodity.image ?? "",
    description: commodity.description ?? "",
    marketType: commodity.marketType,
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateCommodity(commodity.id, {
          name: form.name,
          sku: form.sku.toUpperCase(),
          category: form.category,
          brand: form.brand || null,
          price: parseFloat(form.price),
          unit: form.unit,
          size: parseFloat(form.size),
          image: form.image || null,
          description: form.description || null,
          marketType: form.marketType,
        });
        toast.success(`${form.name} updated successfully`);
        setOpen(false);
      } catch (e: any) {
        toast.error(e.message || "Failed to update commodity");
      }
    });
  };

  const fields: { key: string; label: string; placeholder: string; span?: number; type?: string }[] = [
    { key: "name",     label: "Name",        placeholder: "Ofada Rice",   span: 2 },
    { key: "sku",      label: "SKU",         placeholder: "OFARICE-5KG" },
    { key: "category", label: "Category",    placeholder: "Rice" },
    { key: "brand",    label: "Brand",       placeholder: "Optional" },
    { key: "price",    label: "Price (₦)",   placeholder: "12000", type: "number" },
    { key: "unit",     label: "Unit",        placeholder: "kg" },
    { key: "size",     label: "Size",        placeholder: "5",     type: "number" },
    { key: "image",    label: "Image URL",   placeholder: "https://...", span: 2 },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit Commodity</DialogTitle>
          <DialogDescription>
            Update details for <strong>{commodity.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        {/* Image preview */}
        {form.image && (
          <div className="flex justify-center py-2">
            <img
              src={form.image}
              alt={form.name}
              className="h-20 w-20 rounded-lg object-cover border"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 py-2">
          {fields.map(({ key, label, placeholder, span, type }) => (
            <div key={key} className={span === 2 ? "col-span-2" : ""}>
              <Label htmlFor={`edit-${key}`} className="mb-1.5 block text-sm">{label}</Label>
              <Input
                id={`edit-${key}`}
                type={type || "text"}
                placeholder={placeholder}
                value={(form as any)[key]}
                onChange={(e) => set(key, e.target.value)}
                disabled={isPending}
              />
            </div>
          ))}
          <div className="col-span-2">
            <Label htmlFor="edit-description" className="mb-1.5 block text-sm">Description (optional)</Label>
            <Input
              id="edit-description"
              placeholder="Short description..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="edit-marketType" className="mb-1.5 block text-sm">Listed In</Label>
            <select
              id="edit-marketType"
              value={form.marketType}
              onChange={(e) => set("marketType", e.target.value)}
              disabled={isPending}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              <option value="SAVINGS">Savings only</option>
              <option value="MARKETPLACE">Marketplace only</option>
              <option value="BOTH">Both</option>
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={isPending || !form.name || !form.sku || !form.price}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Toggle Status ───────────────────────────────────────────────
export function ToggleCommodityStatus({
  commodityId, isActive,
}: { commodityId: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await toggleCommodityStatus(commodityId, !isActive);
        toast.success(`Commodity ${!isActive ? "activated" : "deactivated"}`);
      } catch (e: any) {
        toast.error(e.message || "Failed to toggle status");
      }
    });
  };

  return (
    <Button
      variant={isActive ? "outline" : "secondary"}
      size="sm"
      className="h-8 px-2"
      onClick={handleToggle}
      disabled={isPending}
    >
      {isPending
        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : isActive
          ? <><PowerOff className="w-3.5 h-3.5 mr-1" />Disable</>
          : <><Power className="w-3.5 h-3.5 mr-1" />Enable</>}
    </Button>
  );
}

// ── Add Commodity ───────────────────────────────────────────────
export function AddCommodityButton() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: "", sku: "", category: "", brand: "",
    price: "", unit: "kg", size: "", image: "", description: "", marketType: "SAVINGS",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = () => {
    startTransition(async () => {
      try {
        await createCommodity({
          name: form.name,
          sku: form.sku,
          category: form.category,
          brand: form.brand,
          price: parseFloat(form.price),
          unit: form.unit,
          size: parseFloat(form.size),
          image: form.image,
          description: form.description,
          marketType: form.marketType,
        });
        toast.success(`${form.name} added to market`);
        setOpen(false);
        setForm({ name: "", sku: "", category: "", brand: "", price: "", unit: "kg", size: "", image: "", description: "", marketType: "SAVINGS" });
      } catch (e: any) {
        toast.error(e.message || "Failed to create commodity");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Commodity
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Add New Commodity</DialogTitle>
          <DialogDescription>Add a new product to the Chowvest market catalogue.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {[
            { key: "name",     label: "Name",      placeholder: "Ofada Rice",   span: 2 },
            { key: "sku",      label: "SKU",        placeholder: "OFARICE-5KG" },
            { key: "category", label: "Category",   placeholder: "Rice" },
            { key: "brand",    label: "Brand",      placeholder: "Optional" },
            { key: "price",    label: "Price (₦)",  placeholder: "12000", type: "number" },
            { key: "unit",     label: "Unit",       placeholder: "kg" },
            { key: "size",     label: "Size",       placeholder: "5",    type: "number" },
            { key: "image",    label: "Image URL",  placeholder: "https://...", span: 2 },
          ].map(({ key, label, placeholder, span, type }) => (
            <div key={key} className={span === 2 ? "col-span-2" : ""}>
              <Label htmlFor={key} className="mb-1.5 block text-sm">{label}</Label>
              <Input
                id={key}
                type={type || "text"}
                placeholder={placeholder}
                value={(form as any)[key]}
                onChange={(e) => set(key, e.target.value)}
                disabled={isPending}
              />
            </div>
          ))}
          <div className="col-span-2">
            <Label htmlFor="description" className="mb-1.5 block text-sm">Description (optional)</Label>
            <Input
              id="description"
              placeholder="Short description..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="col-span-2">
            <Label htmlFor="marketType" className="mb-1.5 block text-sm">Listed In</Label>
            <select
              id="marketType"
              value={form.marketType}
              onChange={(e) => set("marketType", e.target.value)}
              disabled={isPending}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              <option value="SAVINGS">Savings only</option>
              <option value="MARKETPLACE">Marketplace only</option>
              <option value="BOTH">Both</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreate} disabled={isPending || !form.name || !form.sku || !form.price} className="bg-green-600 hover:bg-green-700 text-white">
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Commodity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Platform Config ────────────────────────────────────────
export function EditConfigButton({
  configKey, currentValue, label,
}: { configKey: string; currentValue: string; label: string }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(currentValue);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updatePlatformConfig(configKey, value);
        toast.success(`${label} updated`);
        setOpen(false);
      } catch (e: any) {
        toast.error(e.message || "Failed to update config");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Edit — {label}</DialogTitle>
          <DialogDescription>Update the platform value for <strong>{label}</strong>.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="config-value" className="mb-1.5 block">New Value (₦)</Label>
          <Input
            id="config-value"
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isPending}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={isPending || !value}>
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
