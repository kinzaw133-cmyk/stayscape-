"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Logo from "./Logo";

export default function Splash() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          role="status"
          aria-label="Loading StayScape"
          exit={{ opacity: 0, transition: { duration: 0.7, ease: "easeInOut" } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-forest text-ivory"
        >
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.9, ease: "easeOut" }}>
            <Logo className="h-20 w-20 text-gold" />
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }} className="font-display text-5xl">
            StayScape
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-sm tracking-wide text-gold">
            Stay • Explore • Discover
          </motion.p>
          <motion.div className="h-px w-40 origin-left bg-gold/60" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.2, ease: "easeInOut" }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
