import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { placeOrder, submitManualPayment } from "../services/orderService";
import { calculateShipping } from "../services/shippingService";
import { ChevronLeft } from "lucide-react";

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = delivery info, 2 = payment
  const [address, setAddress] = useState({ fullName: "", phone: "", email: "", division: "", district: "", upazila: "", fullAddress: "", note: "" });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [transactionId, setTransactionId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [shippingCharge, setShippingCharge] = useState(null);

  useEffect(() => {
    getDoc(doc(db, "settings", "general")).then((snap) => {
      if (snap.exists()) setPaymentSettings(snap.data());
    });
  }, []);

  useEffect(() => {
    if (!address.district) {
      setShippingCharge(null);
      return;
    }
    calculateShipping(address, subtotal).then(setShippingCharge);
  }, [address.district, subtotal]);

  const availableMethods = ["COD"];
  if (paymentSettings?.bkashEnabled !== false) availableMethods.push("bKash");
  if (paymentSettings?.nagadEnabled !== false) availableMethods.push("Nagad");

  const total = subtotal + (shippingCharge ?? 0);

  function updateField(field, value) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  function handleContinueToPayment(e) {
    e.preventDefault();
    setError("");
    if (!address.fullName || !address.phone || !address.district || !address.fullAddress) {
      setError("Please fill in all required delivery fields.");
      return;
    }
    setStep(2);
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("Please log in to place an order.");
      return;
    }
    if (paymentMethod !== "COD" && !transactionId) {
      setError("Please enter your bKash/Nagad transaction ID.");
      return;
    }

    setSubmitting(true);
    try {
      const { orderId, total } = await placeOrder({
        userId: user.uid,
        cartItems: items,
        address,
        paymentMethod,
        couponCode: couponCode || null,
      });

      if (paymentMethod !== "COD") {
        await submitManualPayment({ orderId, userId: user.uid, method: paymentMethod, transactionId, amount: total });
      }

      clearCart();
      navigate(`/track-order?orderId=${orderId}`);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 pb-40">
      <div className="flex items-center gap-2 mb-4">
        {step === 2 && (
          <button onClick={() => setStep(1)} aria-label="Back"><ChevronLeft size={20} /></button>
        )}
        <h1 className="font-bold text-lg">Checkout — {step === 1 ? "Delivery Info" : "Payment"}</h1>
      </div>

      <div className="flex items-center gap-2 mb-5 text-xs">
        <span className={`px-2 py-1 rounded-full ${step >= 1 ? "bg-primary text-white" : "bg-slate-200"}`}>1. Delivery</span>
        <div className="flex-1 h-px bg-slate-300" />
        <span className={`px-2 py-1 rounded-full ${step >= 2 ? "bg-primary text-white" : "bg-slate-200"}`}>2. Payment</span>
      </div>

      {step === 1 && (
        <form onSubmit={handleContinueToPayment}>
          <div className="flex flex-col gap-3">
            <input required placeholder="Full name" className="border rounded p-2.5 text-sm" value={address.fullName} onChange={(e) => updateField("fullName", e.target.value)} />
            <input required placeholder="Phone" className="border rounded p-2.5 text-sm" value={address.phone} onChange={(e) => updateField("phone", e.target.value)} />
            <input placeholder="Email (optional)" className="border rounded p-2.5 text-sm" value={address.email} onChange={(e) => updateField("email", e.target.value)} />
            <input placeholder="Division" className="border rounded p-2.5 text-sm" value={address.division} onChange={(e) => updateField("division", e.target.value)} />
            <input required placeholder="District (যেমন: Dhaka)" className="border rounded p-2.5 text-sm" value={address.district} onChange={(e) => updateField("district", e.target.value)} />
            <input placeholder="Upazila" className="border rounded p-2.5 text-sm" value={address.upazila} onChange={(e) => updateField("upazila", e.target.value)} />
            <textarea required placeholder="Full address" className="border rounded p-2.5 text-sm" value={address.fullAddress} onChange={(e) => updateField("fullAddress", e.target.value)} />
            <textarea placeholder="Delivery note (optional)" className="border rounded p-2.5 text-sm" value={address.note} onChange={(e) => updateField("note", e.target.value)} />
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Coupon (optional)</p>
            <input placeholder="Coupon code" className="border rounded p-2.5 text-sm w-full" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
          </div>

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>৳{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span>Delivery Charge</span>
              <span>{shippingCharge === null ? "জেলা লিখুন" : `৳${shippingCharge}`}</span>
            </div>
            <div className="flex justify-between text-base font-bold mt-1 mb-3 pt-1 border-t">
              <span>Total</span>
              <span>৳{total}</span>
            </div>
            <button type="submit" className="w-full bg-primary text-white rounded-full py-3 font-medium">
              Continue to Payment
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handlePlaceOrder}>
          <div className="bg-white border rounded-card p-3 text-sm mb-4">
            <p className="font-medium">{address.fullName} — {address.phone}</p>
            <p className="text-slate-500 text-xs mt-1">{address.fullAddress}, {address.upazila}, {address.district}, {address.division}</p>
          </div>

          <p className="text-sm font-medium mb-2">Payment method</p>
          <div className="flex gap-2">
            {availableMethods.map((m) => (
              <button type="button" key={m} onClick={() => setPaymentMethod(m)}
                className={`px-4 py-2 rounded-full text-sm border ${paymentMethod === m ? "bg-primary text-white border-primary" : "border-slate-300"}`}>
                {m === "COD" ? "Cash on Delivery" : m}
              </button>
            ))}
          </div>

          {paymentMethod === "bKash" && paymentSettings?.bkashNumber && (
            <div className="bg-pink-50 border border-pink-200 rounded-card p-3 mt-3 text-sm">
              <p>এই bKash নাম্বারে <strong>Send Money</strong> করুন: <strong>{paymentSettings.bkashNumber}</strong></p>
              {paymentSettings.bkashInstructions && <p className="text-xs text-slate-600 mt-1">{paymentSettings.bkashInstructions}</p>}
            </div>
          )}
          {paymentMethod === "Nagad" && paymentSettings?.nagadNumber && (
            <div className="bg-orange-50 border border-orange-200 rounded-card p-3 mt-3 text-sm">
              <p>এই Nagad নাম্বারে <strong>Send Money</strong> করুন: <strong>{paymentSettings.nagadNumber}</strong></p>
              {paymentSettings.nagadInstructions && <p className="text-xs text-slate-600 mt-1">{paymentSettings.nagadInstructions}</p>}
            </div>
          )}

          {paymentMethod !== "COD" && (
            <input required placeholder="Transaction ID" className="border rounded p-2.5 text-sm w-full mt-3" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} />
          )}

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>৳{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span>Delivery Charge</span>
              <span>৳{shippingCharge ?? 0}</span>
            </div>
            <div className="flex justify-between text-base font-bold mt-1 mb-3 pt-1 border-t">
              <span>Total</span>
              <span>৳{total}</span>
            </div>
            <button type="submit" disabled={submitting} className="w-full bg-primary text-white rounded-full py-3 font-medium disabled:opacity-50">
              {submitting ? "Placing order..." : "Confirm & Place Order"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
