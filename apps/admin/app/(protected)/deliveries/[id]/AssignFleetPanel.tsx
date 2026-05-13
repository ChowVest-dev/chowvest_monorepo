"use client";

import { useState, useTransition } from "react";
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@chowvest/ui";
import { Truck, Check, Loader2 } from "lucide-react";
import { assignFleet } from "../actions";
import { toast } from "sonner";

interface AssignFleetProps {
  deliveryId: string;
  companies: { id: string; name: string; riders: { id: string; fullName: string }[] }[];
  currentCompanyId?: string | null;
  currentRiderId?: string | null;
}

export function AssignFleetPanel({ deliveryId, companies, currentCompanyId, currentRiderId }: AssignFleetProps) {
  const [selectedCompanyId, setSelectedCompanyId] = useState(currentCompanyId || "");
  const [selectedRiderId, setSelectedRiderId] = useState(currentRiderId || "");
  const [isPending, startTransition] = useTransition();

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  function handleAssign() {
    if (!selectedCompanyId) {
      toast.error("Please select a logistics company first.");
      return;
    }

    startTransition(async () => {
      try {
        await assignFleet(deliveryId, selectedCompanyId, selectedRiderId || undefined);
        toast.success("Fleet assigned successfully!");
      } catch (err: any) {
        toast.error(err.message || "Failed to assign fleet.");
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Company Select */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Logistics Company</label>
        <Select value={selectedCompanyId} onValueChange={(val) => { setSelectedCompanyId(val); setSelectedRiderId(""); }}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a company..." />
          </SelectTrigger>
          <SelectContent>
            {companies.map(company => (
              <SelectItem key={company.id} value={company.id}>
                <div className="flex items-center gap-2">
                  <Truck className="w-3 h-3 text-muted-foreground" />
                  {company.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rider Select — only shows if a company is selected and has riders */}
      {selectedCompany && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Assign Rider <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Select value={selectedRiderId} onValueChange={setSelectedRiderId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a rider..." />
            </SelectTrigger>
            <SelectContent>
              {selectedCompany.riders.length > 0 ? selectedCompany.riders.map(rider => (
                <SelectItem key={rider.id} value={rider.id}>
                  {rider.fullName}
                </SelectItem>
              )) : (
                <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                  No riders in this fleet yet.
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button 
        className="w-full gap-2" 
        onClick={handleAssign} 
        disabled={!selectedCompanyId || isPending}
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        {isPending ? "Assigning..." : "Confirm Assignment"}
      </Button>
    </div>
  );
}
