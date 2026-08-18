import { NavLink, useLocation } from "react-router-dom";
import { Home, BookOpen, ScrollText, Bookmark, Search, CalendarDays, NotebookPen, Timer, UtensilsCrossed, Flame, Users, Settings, Cross } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const sections = [
  {
    title: "Grow",
    items: [
      { icon: Home, label: "Home", path: "/" },
      { icon: BookOpen, label: "Devotion", path: "/generate" },
      { icon: ScrollText, label: "Sermons", path: "/sermon" },
      { icon: Bookmark, label: "Library", path: "/saved" },
    ],
  },
  {
    title: "Study",
    items: [
      { icon: Search, label: "Scripture", path: "/scripture" },
      { icon: CalendarDays, label: "Reading Plans", path: "/reading-plan" },
      { icon: NotebookPen, label: "Notes", path: "/notes" },
    ],
  },
  {
    title: "Practice",
    items: [
      { icon: Timer, label: "Prayer", path: "/prayer-timer" },
      { icon: UtensilsCrossed, label: "Fasting", path: "/fasting" },
      { icon: Flame, label: "Tracker", path: "/tracker" },
      { icon: Users, label: "Family", path: "/family" },
    ],
  },
  {
    title: "Account",
    items: [{ icon: Settings, label: "Settings", path: "/settings" }],
  },
];

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 border-r border-sidebar-border bg-sidebar z-40">
      <div className="h-16 px-5 flex items-center gap-2.5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl bg-gradient-cathedral flex items-center justify-center text-primary-foreground shadow-cathedral">
          <Cross className="h-5 w-5" />
        </div>
        <span className="font-display text-xl font-bold tracking-tight">Devotly</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="px-3 text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70 mb-2 font-semibold">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  item.path === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.path);
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <item.icon className="h-[18px] w-[18px]" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-sidebar-border">
        <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">Walking daily with God</p>
      </div>
    </aside>
  );
};

export default Sidebar;
