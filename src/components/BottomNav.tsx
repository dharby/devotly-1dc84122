import { Home, BookOpen, Search, NotebookPen, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: BookOpen, label: "Devotion", path: "/generate" },
  { icon: Search, label: "Scripture", path: "/scripture" },
  { icon: NotebookPen, label: "Notes", path: "/notes" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <motion.button key={path} whileTap={{ scale: 0.88 }} whileHover={{ y: -1 }} onClick={() => navigate(path)} className={cn("flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[56px] relative", isActive ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
              {isActive && <motion.span layoutId="bottom-indicator" className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary" />}
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium">{label}</span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
