import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { Facebook, MessageCircle, Send, Headset, X } from "lucide-react";

export default function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState({ facebook: "", whatsapp: "", telegram: "" });

  useEffect(() => {
    getDoc(doc(db, "settings", "general")).then((snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setLinks({ facebook: d.facebook || "", whatsapp: d.whatsapp || "", telegram: d.telegram || "" });
      }
    });
  }, []);

  const hasAnyLink = links.facebook || links.whatsapp || links.telegram;
  if (!hasAnyLink) return null; // nothing configured in Admin Settings yet — don't show an empty button

  const waLink = links.whatsapp ? `https://wa.me/${links.whatsapp.replace(/[^0-9]/g, "")}` : null;
  const tgLink = links.telegram
    ? (links.telegram.startsWith("http") ? links.telegram : `https://t.me/${links.telegram.replace("@", "")}`)
    : null;
  const fbLink = links.facebook || null;

  const itemBase = "w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg transition-all duration-200";
  const itemState = open ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-75 pointer-events-none";

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-3">
      {fbLink && (
        <a href={fbLink} target="_blank" rel="noreferrer" className={`${itemBase} ${itemState} bg-[#1877F2]`}>
          <Facebook size={22} />
        </a>
      )}
      {waLink && (
        <a href={waLink} target="_blank" rel="noreferrer" className={`${itemBase} ${itemState} bg-[#25D366]`}>
          <MessageCircle size={22} />
        </a>
      )}
      {tgLink && (
        <a href={tgLink} target="_blank" rel="noreferrer" className={`${itemBase} ${itemState} bg-[#26A5E4]`}>
          <Send size={20} />
        </a>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Support"
        className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-xl active:scale-95 transition-transform"
      >
        {open ? <X size={24} /> : <Headset size={24} />}
      </button>
    </div>
  );
}
