"use client";

import React, { useState } from "react";
import { X, Check, CreditCard, Sparkles, Map, PhoneCall, ShieldAlert, Award } from "lucide-react";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"single" | "premium">("premium");
  const [paymentStep, setPaymentStep] = useState<"plans" | "processing" | "success">("plans");

  if (!isOpen) return null;

  const handlePayment = () => {
    setPaymentStep("processing");
    // Simulate Razorpay gateway checkout
    setTimeout(() => {
      setPaymentStep("success");
    }, 2500);
  };

  const handleReset = () => {
    setPaymentStep("plans");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      {/* Outer Card */}
      <div className="w-full max-w-2xl bg-slate-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header decoration */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-sky-500 via-amber-500 to-emerald-500" />
        
        {/* Close Button */}
        {paymentStep !== "processing" && (
          <button
            onClick={paymentStep === "success" ? handleReset : onClose}
            className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {paymentStep === "plans" && (
          <div className="overflow-y-auto flex-1 p-6 md:p-8">
            <div className="text-center max-w-lg mx-auto">
              <span className="text-[10px] uppercase tracking-widest text-amber-500 font-bold bg-amber-500/10 px-3 py-1 rounded-full">
                ✨ High Altitude Access
              </span>
              <h3 className="text-2xl md:text-3xl font-bold font-serif text-white mt-3">
                Unlock Verified Guide Contact
              </h3>
              <p className="text-white/60 text-xs mt-2">
                Get direct access to local coordinators, bypass expensive travel agencies, and plan your Himalayan trek with local safety experts.
              </p>
            </div>

            {/* Plan Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {/* Single Unlock */}
              <div
                onClick={() => setSelectedPlan("single")}
                className={`cursor-pointer p-5 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
                  selectedPlan === "single"
                    ? "bg-slate-900 border-amber-500/80 shadow-md shadow-amber-500/5"
                    : "bg-slate-900/40 border-white/5 hover:border-white/15"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-white/60 uppercase">Single Unlock</span>
                    {selectedPlan === "single" && (
                      <span className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-slate-950 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-white mt-1">Single Route & Guide</h4>
                  <p className="text-white/50 text-[11px] mt-1">Great for a single fixed holiday plan.</p>
                  
                  <ul className="mt-5 space-y-2.5 text-xs text-white/80">
                    <li className="flex items-start gap-2">
                      <PhoneCall className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>1 Verified Guide WhatsApp & Phone contact</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Map className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>Custom GPX file & itinerary download</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Award className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>Local permit contact & instructions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span className="text-amber-400/90 font-medium">48h response guarantee: no response = credit back</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5">
                  <div className="text-2xl font-serif font-bold text-white">
                    ₹499 <span className="text-[10px] font-sans font-normal text-white/45">/ route</span>
                  </div>
                </div>
              </div>

              {/* Premium DIY */}
              <div
                onClick={() => setSelectedPlan("premium")}
                className={`cursor-pointer p-5 rounded-xl border relative transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                  selectedPlan === "premium"
                    ? "bg-gradient-to-b from-slate-900 to-slate-950 border-amber-500 shadow-lg shadow-amber-500/10"
                    : "bg-slate-900/40 border-white/5 hover:border-white/15"
                }`}
              >
                {/* Popular Pill */}
                <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-bold text-[8px] uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                  Recommended
                </div>

                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-amber-500 uppercase flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 fill-amber-500" /> Premium DIY
                    </span>
                    {selectedPlan === "premium" && (
                      <span className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-slate-950 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-white mt-1">Unlimited Planning Account</h4>
                  <p className="text-white/50 text-[11px] mt-1">For regular trekkers and mountain explorers.</p>
                  
                  <ul className="mt-5 space-y-2.5 text-xs text-white/80">
                    <li className="flex items-start gap-2">
                      <PhoneCall className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span><strong>5 Local Guide</strong> contacts unlocked</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>Unlimited AI planning questions & chat</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Map className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>PDF, GPX downloads & custom route edits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Award className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>Direct altitude coaching & gear checklists</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span className="text-amber-400/90 font-medium">48h response guarantee: no response = credit back</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5">
                  <div className="text-2xl font-serif font-bold text-amber-500">
                    ₹1,499 <span className="text-[10px] font-sans font-normal text-white/45">/ full access</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 border-t border-white/10 pt-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <span className="text-[10px] text-white/40 max-w-sm text-center md:text-left flex items-start gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500/60 shrink-0 mt-0.5" />
                Payments are securely processed via Razorpay. Guides are WFR certified and verified by Blue Sheep Adventures.
              </span>
              <button
                onClick={handlePayment}
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-lg shadow-amber-500/10 shrink-0"
              >
                <CreditCard className="w-4 h-4" />
                Pay {selectedPlan === "premium" ? "₹1,499" : "₹499"} Now
              </button>
            </div>
          </div>
        )}

        {paymentStep === "processing" && (
          <div className="p-10 flex flex-col items-center justify-center text-center flex-1">
            <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-6" />
            <h4 className="text-lg font-bold text-white">Opening Razorpay Checkout</h4>
            <p className="text-white/50 text-xs mt-2 max-w-xs">
              Connecting securely to process payment of {selectedPlan === "premium" ? "₹1,499" : "₹499"}. Please do not reload.
            </p>
          </div>
        )}

        {paymentStep === "success" && (
          <div className="p-8 md:p-10 flex flex-col items-center justify-center text-center flex-1">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mb-6">
              <Check className="w-8 h-8 text-emerald-400 stroke-[2.5]" />
            </div>
            <h3 className="text-xl md:text-2xl font-serif font-bold text-white">
              Payment Successful!
            </h3>
            <p className="text-white/60 text-xs mt-2 max-w-md">
              Congratulations! Your DIY Trek planning access is now unlocked. You have full access to custom itineraries and guide details.
            </p>

            {/* Unlocked Details Info Card */}
            <div className="w-full max-w-md bg-white/5 border border-white/5 rounded-xl p-4 mt-6 text-left">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Unlocked Contact</span>
              <div className="flex justify-between items-center mt-2">
                <div>
                  <h5 className="text-white text-sm font-bold">Rigzin Dorje</h5>
                  <p className="text-white/40 text-[10px]">Certified Mountain Guide (Markha Valley)</p>
                </div>
                <a 
                  href="tel:+919876543210" 
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                >
                  Call Guide
                </a>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-[11px]">
                <span className="text-white/60">Phone: <strong>+91 98765 43210</strong></span>
                <span className="text-white/60">WhatsApp: <strong>Available</strong></span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="mt-8 px-6 py-2.5 bg-white text-slate-950 hover:bg-white/95 font-bold text-xs rounded-xl transition-all duration-200"
            >
              Return to Planner
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
