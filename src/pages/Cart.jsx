import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Trash2 } from "lucide-react";

export default function Cart() {
  const { items, updateQty, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-400 mb-4">Your cart is empty.</p>
        <Link to="/shop" className="text-primary font-medium">Continue shopping →</Link>
      </div>
    );
  }

  return (
    <div className="p-4 pb-32">
      <h1 className="font-bold text-lg mb-4">Cart</h1>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.key} className="flex gap-3 bg-white border rounded-card p-3">
            <img src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover bg-slate-100" />
            <div className="flex-1">
              <p className="text-sm font-medium line-clamp-2">{item.name}</p>
              <p className="text-primary font-bold text-sm mt-1">৳{item.price}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center border rounded-full">
                  <button className="px-2" onClick={() => updateQty(item.key, item.qty - 1)}>-</button>
                  <span className="px-2 text-sm">{item.qty}</span>
                  <button className="px-2" onClick={() => updateQty(item.key, item.qty + 1)}>+</button>
                </div>
                <button onClick={() => removeItem(item.key)} className="text-red-400 ml-auto"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="flex justify-between text-sm mb-3">
          <span>Subtotal</span>
          <span className="font-bold">৳{subtotal}</span>
        </div>
        <Link to="/checkout" className="block bg-primary text-white text-center rounded-full py-3 font-medium">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}
