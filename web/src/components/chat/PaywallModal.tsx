"use client";

// Real Razorpay checkout (test/live by key). Flow:
//   create-order → Razorpay JS checkout → /api/payments/verify (signature)
//   → premium: subscription + 5 credits | single: paid order banked
//   → optional providerId: immediately consume credit/order via unlock → phone
// Identity = chat session (sessionId). No session → ask user to chat first.

import React, { useEffect, useState } from "react";
import { X, Check, CreditCard, Sparkles, Map, PhoneCall, ShieldAlert, Award, MessageSquareText } from "lucide-react";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

interface UnlockedProvider {
  id: string;
  name: string;
  phone: string;
}

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Chat session that owns the purchase (required to pay) */
  sessionId?: string | null;
  /** If set, the purchase immediately unlocks this provider */
  providerId?: string;
}

const PLANS = {
  single: {
    type: "single_unlock" as const,
    label: "₹499",
    perks: [
      { icon: PhoneCall, text: "1 verified guide phone + WhatsApp contact" },
      { icon: Map, text: "Itinerary PDF download" },
      { icon: Award, text: "Local permit contact & instructions" },
      { icon: ShieldAlert, text: "48h response guarantee: no response = credit back", highlight: true },
    ],
  },
  premium: {
    type: "premium" as const,
    label: "₹1,499",
    perks: [
      { icon: PhoneCall, text: "5 local guide contacts unlocked" },
      { icon: Sparkles, text: "Unlimited AI planning chat" },
      { icon: Map, text: "Itinerary editing, regeneration, PDF & GPX" },
      { icon: ShieldAlert, text: "48h response guarantee: no response = credit back", highlight: true },
    ],
  },
};

export default function PaywallModal({ isOpen, onClose, sessionId, providerId }: PaywallModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"single" | "premium">("premium");
  const [step, setStep] = useState<"plans" | "processing" | "success">("plans");
  const [error, setError] = useState("");
  const [unlocked, setUnlocked] = useState<UnlockedProvider | null>(null);
  const [paidType, setPaidType] = useState<"single_unlock" | "premium" | null>(null);

  // Load the Razorpay checkout script once
  useEffect(() => {
    if (!isOpen || window.Razorpay) return;
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    document.body.appendChild(s);
  }, [isOpen]);

  if (!isOpen) return null;

  const reset = () => {
    setStep("plans");
    setError("");
    setUnlocked(null);
    setPaidType(null);
    onClose();
  };

  const handlePayment = async () => {
    setError("");
    if (!sessionId) {
      setError("Start a chat first (name → phone → email) so we can attach your purchase to your account.");
      return;
    }
    if (!window.Razorpay) {
      setError("Payment gateway is still loading — try again in a second.");
      return;
    }
    setStep("processing");

    try {
      const plan = PLANS[selectedPlan];
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: plan.type, sessionId }),
      });
      if (!orderRes.ok) throw new Error((await orderRes.json()).error ?? "Order creation failed");
      const order = await orderRes.json();

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Blue Sheep Adventures",
        description: selectedPlan === "premium" ? "Premium DIY access" : "Single guide unlock",
        order_id: order.orderId,
        prefill: order.prefill,
        theme: { color: "#c8923a" },
        modal: { ondismiss: () => setStep("plans") },
        handler: async (resp: any) => {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionId,
                razorpayOrderId: resp.razorpay_order_id,
                razorpayPaymentId: resp.razorpay_payment_id,
                razorpaySignature: resp.razorpay_signature,
              }),
            });
            if (!verifyRes.ok) throw new Error("Payment verification failed");
            const verified = await verifyRes.json();
            setPaidType(verified.type);

            if (providerId) {
              const unlockRes = await fetch("/api/providers/unlock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ providerId, sessionId }),
              });
              if (unlockRes.ok) {
                const data = await unlockRes.json();
                setUnlocked(data.provider);
              }
            }
            setStep("success");
          } catch (e) {
            console.error(e);
            setError("Payment captured but verification failed — contact support, your money is safe.");
            setStep("plans");
          }
        },
      });
      rzp.open();
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? "Could not start checkout");
      setStep("plans");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl bg-ink-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-sky-500 via-gold-500 to-emerald-500" />

        {step !== "processing" && (
          <button
            onClick={step === "success" ? reset : onClose}
            className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors z-10 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {step === "plans" && (
          <div className="overflow-y-auto flex-1 p-6 md:p-8">
            <div className="text-center max-w-lg mx-auto">
              <span className="text-[10px] uppercase tracking-widest text-gold-500 font-bold bg-gold-500/10 px-3 py-1 rounded-full">
                Unlock the people behind your trek
              </span>
              <h3 className="text-2xl md:text-3xl font-bold font-serif text-white mt-3">
                Verified local contacts, zero commission
              </h3>
              <p className="text-white/60 text-xs mt-2">
                Talk directly to the guides and drivers who run your route. You negotiate,
                you pay them — we never take a cut.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {(["single", "premium"] as const).map((planKey) => {
                const plan = PLANS[planKey];
                const active = selectedPlan === planKey;
                return (
                  <div
                    key={planKey}
                    onClick={() => setSelectedPlan(planKey)}
                    className={`cursor-pointer p-5 rounded-xl border relative transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                      active
                        ? "bg-ink-900 border-gold-500/80 shadow-md shadow-gold-500/5"
                        : "bg-ink-900/40 border-white/5 hover:border-white/15"
                    }`}
                  >
                    {planKey === "premium" && (
                      <div className="absolute top-0 right-0 bg-gold-500 text-ink-950 font-bold text-[8px] uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                        Recommended
                      </div>
                    )}
                    <div>
                      <div className="flex justify-between items-start">
                        <span className={`text-xs font-bold uppercase ${planKey === "premium" ? "text-gold-500" : "text-white/60"}`}>
                          {planKey === "premium" ? "Premium DIY" : "Single Unlock"}
                        </span>
                        {active && (
                          <span className="w-4 h-4 rounded-full bg-gold-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-ink-950 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-white mt-1">
                        {planKey === "premium" ? "Unlimited Planning Account" : "One Route & Guide"}
                      </h4>
                      <ul className="mt-5 space-y-2.5 text-xs text-white/80">
                        {plan.perks.map((perk) => (
                          <li key={perk.text} className="flex items-start gap-2">
                            <perk.icon className={`w-4 h-4 shrink-0 mt-0.5 ${perk.highlight ? "text-gold-300" : "text-gold-500"}`} />
                            <span className={perk.highlight ? "text-gold-300/90 font-medium" : ""}>{perk.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/5">
                      <div className={`text-2xl font-serif font-bold ${planKey === "premium" ? "text-gold-400" : "text-white"}`}>
                        {plan.label}
                        <span className="text-[10px] font-sans font-normal text-white/45">
                          {planKey === "premium" ? " / year" : " / contact"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {error && (
              <div className="mt-5 text-[12px] text-rose-300 font-medium bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 flex items-start gap-2">
                <MessageSquareText className="w-4 h-4 shrink-0 mt-0.5" /> {error}
              </div>
            )}

            <div className="mt-6 border-t border-white/10 pt-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <span className="text-[10px] text-white/40 max-w-sm text-center md:text-left flex items-start gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-gold-500/60 shrink-0 mt-0.5" />
                Payments securely processed by Razorpay (UPI, cards, netbanking).
                Every listed provider is identity-verified with signed consent.
              </span>
              <button
                onClick={handlePayment}
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-ink-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-gold-500/10 shrink-0"
              >
                <CreditCard className="w-4 h-4" />
                Pay {PLANS[selectedPlan].label} now
              </button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="p-10 flex flex-col items-center justify-center text-center flex-1">
            <div className="w-16 h-16 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin mb-6" />
            <h4 className="text-lg font-bold text-white">Opening Razorpay checkout…</h4>
            <p className="text-white/50 text-xs mt-2 max-w-xs">
              Complete the payment in the Razorpay window. Don't reload this page.
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="p-8 md:p-10 flex flex-col items-center justify-center text-center flex-1">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mb-6">
              <Check className="w-8 h-8 text-emerald-400 stroke-[2.5]" />
            </div>
            <h3 className="text-xl md:text-2xl font-serif font-bold text-white">Payment successful!</h3>
            <p className="text-white/60 text-xs mt-2 max-w-md">
              {paidType === "premium"
                ? "Premium is active: unlimited AI chat, itinerary editing, and 5 guide unlock credits on your account."
                : "Your unlock is ready — it will be applied to the guide you choose."}
            </p>

            {unlocked && (
              <div className="w-full max-w-md bg-white/5 border border-white/5 rounded-xl p-4 mt-6 text-left">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                  Unlocked contact
                </span>
                <div className="flex justify-between items-center mt-2 gap-3">
                  <div className="min-w-0">
                    <h5 className="text-white text-sm font-bold truncate">{unlocked.name}</h5>
                    <p className="text-white/60 text-xs mt-0.5 font-mono">{unlocked.phone}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <a
                      href={`tel:${unlocked.phone.replace(/\s/g, "")}`}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-ink-950 font-bold text-xs rounded-lg transition-colors"
                    >
                      Call
                    </a>
                    <a
                      href={`https://wa.me/${unlocked.phone.replace(/[^\d]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-lg transition-colors"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={reset}
              className="mt-8 px-6 py-2.5 bg-white text-ink-950 hover:bg-white/95 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Back to planning
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
