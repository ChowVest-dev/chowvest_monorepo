"use client";

import { useState } from "react";
import { Star, Check, ArrowRight } from "lucide-react";
import { Button } from "@chowvest/ui";
import axios from "axios";

interface DeliveryCompleteProps {
  delivery: any;
  onFinish: () => void;
}

export function DeliveryComplete({ delivery, onFinish }: DeliveryCompleteProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [ratingSaved, setRatingSaved] = useState(false);

  const handleRating = async (star: number) => {
    setRating(star);
    if (!delivery?.id) return;
    try {
      await axios.post(`/api/delivery/${delivery.id}/rate`, { rating: star });
      setRatingSaved(true);
    } catch {
      // rating save failure is non-critical
    }
  };

  return (
    <div className="space-y-4">
      {/* Delivery Done Card */}
      <div className="bg-primary rounded-2xl p-7 text-center relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-black/10" />
        
        <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 mx-auto mb-3 flex items-center justify-center text-[30px] shadow-sm animate-[celebrationPop_0.8s_cubic-bezier(0.34,1.56,0.64,1)]">
          <Check className="w-8 h-8 text-primary-foreground" />
        </div>
        
        <h2 className="text-primary-foreground text-lg font-extrabold mb-1 relative">Delivery Complete!</h2>
        <p className="text-primary-foreground/80 text-[13px] relative">Your savings goals have arrived safe and sound.</p>
        
        <div className="inline-block bg-white/10 text-primary-foreground/90 text-xs font-semibold px-4 py-1.5 rounded-full mt-4 border border-white/20 relative z-10">
          Delivered at {delivery?.deliveredAt ? new Date(delivery.deliveredAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
        
        <style jsx>{`
          @keyframes celebrationPop { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        `}</style>
      </div>

      {/* Rating Card */}
      <div className="bg-background border border-border rounded-2xl p-5 text-center shadow-sm">
        <h3 className="text-[14px] font-bold text-foreground mb-1">How was your delivery?</h3>
        <p className="text-xs text-muted-foreground mb-3">Rate your interaction with {delivery?.riderName || "your courier"}</p>
        
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => handleRating(star)}
              className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all ${
                (hoveredRating >= star || rating >= star)
                  ? "border-[#F5A623] bg-[#FFF4E0]"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
               <Star className={`w-6 h-6 transition-colors ${
                 (hoveredRating >= star || rating >= star) ? "fill-[#F5A623] text-[#F5A623]" : "text-muted-foreground/30"
               }`} />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <p className="text-xs font-bold text-[#F5A623] animate-in fade-in zoom-in duration-200">
            {rating === 5 ? "Awesome 😊" : rating === 4 ? "Great 🙂" : rating === 3 ? "Okay 😐" : rating === 2 ? "Could be better 😕" : "Poor 🙁"}
            {ratingSaved && <span className="ml-2 text-muted-foreground font-normal">· Saved</span>}
          </p>
        )}
      </div>

      <Button
        onClick={onFinish}
        className="w-full bg-foreground hover:bg-foreground/90 text-background rounded-xl h-14 text-[15px] font-bold mt-2 shadow-md transition-all"
      >
        View Past Orders <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}
