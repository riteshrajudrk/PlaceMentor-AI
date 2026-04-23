import { motion as Motion } from "framer-motion";

export default function GlassCard({
  children,
  className = "",
  hover = true,
  ...props
}) {
  return (
    <Motion.div
      className={`glass-card rounded-2xl p-6 ${
        hover ? "hover:border-white/15 cursor-pointer" : ""
      } ${className}`}
      whileHover={hover ? { y: -5 } : {}}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </Motion.div>
  );
}
