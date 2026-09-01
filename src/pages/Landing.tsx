import { useNavigate, Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  BookOpen,
  Timer,
  ScrollText,
  Users,
  Flame,
  Search,
  Star,
  Check,
  ChevronDown,
  Quote,
  Shield,
  Heart,
  Cross,
  Menu,
  X,
  Share2,
  Globe,
  Lock,
  Wifi,
  BookMarked,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import heroImage from "@/assets/hero-devotional.jpg";

const HERO_LINE_1 = "A quiet moment,";
const HERO_LINE_2 = "every single day.";

function useTypewriter(totalChars: number, { speed = 55, startDelay = 600 } = {}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setCount(totalChars);
      return;
    }
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setCount((c) => {
          if (c >= totalChars) {
            clearInterval(interval);
            return c;
          }
          return c + 1;
        });
      }, speed);
    }, startDelay);
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [totalChars, speed, startDelay]);

  return count;
}

function Caret() {
  return (
    <span
      aria-hidden="true"
      className="inline-block w-[3px] md:w-1 h-[0.82em] translate-y-[0.08em] bg-current rounded-full animate-caret-blink ml-[0.06em]"
    />
  );
}

function useFadeIn(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  return { ref, isInView };
}

function FadeIn({
  children,
  delay = 0,
  className = "",
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "left" | "right" | "none";
}) {
  const { ref, isInView } = useFadeIn();
  const offset = direction === "left" ? -24 : direction === "right" ? 24 : 24;
  const initial =
    direction === "none"
      ? { opacity: 0 }
      : { opacity: 0, [direction === "up" ? "y" : "x"]: offset };
  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const features = [
  {
    icon: BookOpen,
    title: "Daily Devotionals",
    desc: "Scripture, reflection, prayer and declaration — crafted with theological depth, not AI filler.",
    color: "bg-gradient-to-br from-[hsl(32,72%,46%)] to-[hsl(14,62%,58%)]",
  },
  {
    icon: ScrollText,
    title: "Sermons & Bible Study",
    desc: "Full outlines with exegesis, word studies, illustrations and cross-references.",
    color: "bg-gradient-to-br from-[hsl(28,60%,42%)] to-[hsl(36,75%,55%)]",
  },
  {
    icon: Search,
    title: "Scripture Search",
    desc: "Natural language search — ask a question, get verses with context and confidence.",
    color: "bg-gradient-to-br from-[hsl(150,26%,50%)] to-[hsl(160,30%,45%)]",
  },
  {
    icon: Timer,
    title: "Prayer Timer",
    desc: "Timed intervals with gentle alerts — track your prayer life with quiet intention.",
    color: "bg-gradient-to-br from-[hsl(200,50%,50%)] to-[hsl(220,45%,55%)]",
  },
  {
    icon: Flame,
    title: "Tracker & Streaks",
    desc: "See your consistency without gamified pressure — a calendar that celebrates faithfulness.",
    color: "bg-gradient-to-br from-[hsl(25,80%,55%)] to-[hsl(35,85%,60%)]",
  },
  {
    icon: Users,
    title: "Family Sharing",
    desc: "Share devotionals with your family through invite codes — private, by design.",
    color: "bg-gradient-to-br from-[hsl(14,62%,60%)] to-[hsl(32,72%,50%)]",
  },
];

const testimonials = [
  {
    name: "Sarah M.",
    role: "Mother of 3",
    text: "Devotly brought our family together every morning. The devotionals feel like they were written specifically for our season of life.",
    avatar: "S",
  },
  {
    name: "James O.",
    role: "Pastor",
    text: "I use the sermon builder weekly — the depth, clarity and beauty in one place. My congregation notices the difference.",
    avatar: "J",
  },
  {
    name: "Grace A.",
    role: "Student",
    text: "The Word of the Day is the first thing I see. It stays with me through lectures, exams and late-night study sessions.",
    avatar: "G",
  },
  {
    name: "David K.",
    role: "Entrepreneur",
    text: "Offline access means I never miss a morning — even on flights, in tunnels, or when WiFi is unreliable.",
    avatar: "D",
  },
  {
    name: "Ruth N.",
    role: "Retired Teacher",
    text: "The reading plan gave me structure I didn't know I needed. 365 days of scripture, beautifully paced.",
    avatar: "R",
  },
  {
    name: "Michael T.",
    role: "Worship Leader",
    text: "The prayer timer transformed my devotional time from scattered to intentional. I'm more present than ever.",
    avatar: "M",
  },
];

const faqs = [
  {
    q: "Is Devotly free?",
    a: "Yes — all core features are free forever. No credit card, no ads, no premium tiers. We believe spiritual growth shouldn't be behind a paywall.",
  },
  {
    q: "How does offline work?",
    a: "Add Devotly to your home screen (PWA) — your devotionals, notes, reading plan and tracker work fully offline. No app store needed.",
  },
  {
    q: "Will I get notifications?",
    a: "Opt-in for Word & Scripture of the Day at your chosen time — beautifully crafted push notifications, delivered to your device.",
  },
  {
    q: "Can I use it on multiple devices?",
    a: "Yes — sign in on any device and your devotionals, notes, highlights and streaks sync automatically via Supabase.",
  },
  {
    q: "Is my data private?",
    a: "Completely. Your devotionals, notes, highlights and prayer history are tied to your account only. We don't sell data, run ads or track you.",
  },
];

/* ─── Product UI Mock: Devotional Card ─── */
function DevotionalCardMock() {
  return (
    <div className="bg-[hsl(38,42%,99%)] rounded-2xl border border-[hsl(36,18%,86%)] shadow-[0_8px_40px_-12px_hsl(32,72%,46%,0.18)] overflow-hidden max-w-sm">
      <div className="bg-gradient-to-br from-[hsl(32,70%,44%)] via-[hsl(18,65%,52%)] to-[hsl(40,85%,64%)] p-5 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <p className="text-[10px] uppercase tracking-[0.2em] opacity-70 font-semibold">Today's Devotional</p>
        <p className="font-display text-lg font-bold mt-1">Peace in the Storm</p>
        <p className="text-xs opacity-75 mt-1">John 14:27 · Rest in His presence</p>
      </div>
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs text-[hsl(28,12%,42%)]">
          <BookOpen className="h-3.5 w-3.5 text-[hsl(32,72%,46%)]" />
          <span className="font-medium uppercase tracking-wider">Scripture</span>
        </div>
        <p className="text-sm italic text-[hsl(28,20%,15%,0.8)] leading-relaxed">
          "Peace I leave with you; my peace I give you. I do not give to you as the world gives."
        </p>
        <div className="h-px bg-[hsl(36,18%,86%)]" />
        <div className="flex items-center gap-2 text-xs text-[hsl(28,12%,42%)]">
          <Heart className="h-3.5 w-3.5 text-[hsl(14,62%,60%)]" />
          <span className="font-medium uppercase tracking-wider">Reflection</span>
        </div>
        <p className="text-sm text-[hsl(28,20%,15%,0.75)] leading-relaxed line-clamp-3">
          In the midst of chaos, Christ offers not the absence of trouble but the presence of peace — a wholeness that transcends understanding.
        </p>
        <div className="flex gap-2 pt-2">
          <div className="flex-1 bg-[hsl(38,38%,96%)] rounded-lg p-2.5 text-center">
            <Bookmark className="h-4 w-4 text-[hsl(32,72%,46%)] mx-auto" />
            <p className="text-[10px] font-medium text-[hsl(28,20%,15%,0.5)] mt-1">Save</p>
          </div>
          <div className="flex-1 bg-[hsl(32,72%,46%)] rounded-lg p-2.5 text-center">
            <Check className="h-4 w-4 text-white mx-auto" />
            <p className="text-[10px] font-medium text-white/80 mt-1">Complete</p>
          </div>
          <div className="flex-1 bg-[hsl(38,38%,96%)] rounded-lg p-2.5 text-center">
            <Share2 className="h-4 w-4 text-[hsl(28,20%,15%,0.5)] mx-auto" />
            <p className="text-[10px] font-medium text-[hsl(28,20%,15%,0.5)] mt-1">Share</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Product UI Mock: Scripture Search ─── */
function ScriptureSearchMock() {
  return (
    <div className="bg-[hsl(38,42%,99%)] rounded-2xl border border-[hsl(36,18%,86%)] shadow-[0_8px_40px_-12px_hsl(32,72%,46%,0.18)] overflow-hidden max-w-md">
      <div className="p-4 border-b border-[hsl(36,18%,86%)]">
        <div className="flex items-center gap-3 bg-[hsl(38,38%,96%)] rounded-xl px-4 py-3">
          <Search className="h-4 w-4 text-[hsl(28,12%,42%)]" />
          <span className="text-sm text-[hsl(28,20%,15%,0.5)]">What does the Bible say about anxiety?</span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {[
          { ref: "Philippians 4:6-7", text: "Do not be anxious about anything, but in every situation, by prayer and petition...", confidence: 98 },
          { ref: "1 Peter 5:7", text: "Cast all your anxiety on him because he cares for you.", confidence: 95 },
          { ref: "Matthew 6:25-34", text: "Therefore I tell you, do not worry about your life...", confidence: 92 },
        ].map((r, i) => (
          <div key={i} className="bg-[hsl(38,38%,96%)] rounded-xl p-3.5 hover:bg-[hsl(36,18%,86%,0.5)] transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-[hsl(32,72%,46%)]">{r.ref}</span>
              <span className="text-[10px] font-bold text-[hsl(150,26%,50%)] bg-[hsl(150,26%,50%,0.1)] px-2 py-0.5 rounded-full">{r.confidence}%</span>
            </div>
            <p className="text-xs text-[hsl(28,20%,15%,0.6)] leading-relaxed italic">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Product UI Mock: Prayer Timer ─── */
function PrayerTimerMock() {
  return (
    <div className="bg-[hsl(38,42%,99%)] rounded-2xl border border-[hsl(36,18%,86%)] shadow-[0_8px_40px_-12px_hsl(32,72%,46%,0.18)] overflow-hidden w-full max-w-[280px]">
      <div className="p-6 text-center">
        <div className="relative w-40 h-40 mx-auto mb-5">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(36,18%,86%)" strokeWidth="6" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              stroke="url(#prayer-gradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${52 * 2 * Math.PI * 0.65} ${52 * 2 * Math.PI * 0.35}`}
            />
            <defs>
              <linearGradient id="prayer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(32,72%,46%)" />
                <stop offset="100%" stopColor="hsl(14,62%,58%)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl font-bold text-[hsl(28,20%,15%)]">7:32</span>
            <span className="text-[10px] uppercase tracking-widest text-[hsl(28,12%,42%)] font-medium mt-0.5">remaining</span>
          </div>
        </div>
        <p className="font-display font-semibold text-sm text-[hsl(28,20%,15%)]">Evening Prayer</p>
        <p className="text-xs text-[hsl(28,12%,42%)] mt-1">Focused · Quiet reflection</p>
        <div className="flex gap-2 mt-4 justify-center">
          {["5 min", "10 min", "15 min"].map((t, i) => (
            <div key={i} className={`text-xs px-3 py-1.5 rounded-full font-medium ${i === 1 ? "bg-[hsl(32,72%,46%)] text-white" : "bg-[hsl(38,38%,96%)] text-[hsl(28,12%,42%)]"}`}>
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Product UI Mock: Tracker ─── */
function TrackerMock() {
  const days = Array.from({ length: 35 }, (_, i) => i + 1);
  const completed = [1,2,3,5,6,7,8,10,11,12,13,14,15,17,18,19,20,21,22,24,25,26,27];
  return (
    <div className="bg-[hsl(38,42%,99%)] rounded-2xl border border-[hsl(36,18%,86%)] shadow-[0_8px_40px_-12px_hsl(32,72%,46%,0.18)] overflow-hidden max-w-sm">
      <div className="bg-gradient-to-br from-[hsl(32,70%,44%)] via-[hsl(18,65%,52%)] to-[hsl(40,85%,64%)] p-5 text-white text-center">
        <Flame className="h-8 w-8 mx-auto mb-1.5 opacity-90" />
        <p className="font-display text-3xl font-bold">23</p>
        <p className="text-xs opacity-75 font-medium">Day Streak</p>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-[hsl(28,20%,15%)]">August 2026</p>
          <div className="flex gap-1">
            <div className="w-6 h-6 rounded-md bg-[hsl(38,38%,96%)] flex items-center justify-center">
              <ChevronDown className="h-3 w-3 -rotate-90 text-[hsl(28,12%,42%)]" />
            </div>
            <div className="w-6 h-6 rounded-md bg-[hsl(38,38%,96%)] flex items-center justify-center">
              <ChevronDown className="h-3 w-3 rotate-90 text-[hsl(28,12%,42%)]" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {["S","M","T","W","T","F","S"].map((d) => (
            <div key={d} className="text-center text-[10px] text-[hsl(28,12%,42%)] font-medium py-1">{d}</div>
          ))}
          {Array.from({ length: 2 }).map((_, i) => <div key={`e-${i}`} />)}
          {days.map((d) => (
            <div
              key={d}
              className={`aspect-square flex items-center justify-center rounded-md text-[11px] font-medium transition-colors ${
                completed.includes(d)
                  ? "bg-[hsl(32,72%,46%)] text-white"
                  : d === 28
                  ? "ring-2 ring-[hsl(32,72%,46%,0.4)] text-[hsl(28,20%,15%)]"
                  : "text-[hsl(28,20%,15%,0.4)]"
              }`}
            >
              {d}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-[hsl(28,12%,42%)]">
          <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-[hsl(32,72%,46%)]" /> Completed</span>
          <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded ring-2 ring-[hsl(32,72%,46%,0.4)]" /> Today</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Product UI Mock: Family ─── */
function FamilyMock() {
  return (
    <div className="bg-[hsl(38,42%,99%)] rounded-2xl border border-[hsl(36,18%,86%)] shadow-[0_8px_40px_-12px_hsl(32,72%,46%,0.18)] overflow-hidden max-w-sm">
      <div className="bg-gradient-to-br from-[hsl(32,70%,44%)] via-[hsl(18,65%,52%)] to-[hsl(40,85%,64%)] p-5 text-white">
        <p className="text-[10px] uppercase tracking-[0.2em] opacity-70 font-semibold">Invite Code</p>
        <p className="font-mono text-2xl font-bold tracking-[0.25em] mt-1">FAITH2026</p>
        <p className="text-xs opacity-65 mt-1">Share with family to join</p>
      </div>
      <div className="p-4 space-y-2.5">
        <p className="text-[10px] uppercase tracking-widest text-[hsl(28,12%,42%)] font-semibold">Members</p>
        {[
          { name: "Mom", role: "owner", emoji: "👩" },
          { name: "Dad", role: "member", emoji: "👨" },
          { name: "Sarah", role: "member", emoji: "👧" },
        ].map((m) => (
          <div key={m.name} className="flex items-center gap-3 bg-[hsl(38,38%,96%)] rounded-xl p-3">
            <div className="w-9 h-9 rounded-full bg-[hsl(14,62%,90%)] flex items-center justify-center text-base">
              {m.emoji}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[hsl(28,20%,15%)]">{m.name}</p>
              <p className="text-[10px] text-[hsl(28,12%,42%)] capitalize">{m.role}</p>
            </div>
            {m.role === "owner" && (
              <Crown className="h-3.5 w-3.5 text-[hsl(32,72%,46%)]" />
            )}
          </div>
        ))}
        <div className="bg-[hsl(38,38%,96%)] rounded-xl p-3 mt-2">
          <p className="text-xs font-semibold text-[hsl(28,20%,15%)]">Shared Devotional</p>
          <p className="text-[11px] text-[hsl(28,12%,42%)] mt-0.5">"Peace in the Storm" · John 14:27</p>
          <p className="text-[10px] text-[hsl(14,62%,60%)] italic mt-1">"This reminded me of our family devotional last week" — Mom</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Product UI Mock: Reading Plan ─── */
function ReadingPlanMock() {
  const progress = 68;
  return (
    <div className="bg-[hsl(38,42%,99%)] rounded-2xl border border-[hsl(36,18%,86%)] shadow-[0_8px_40px_-12px_hsl(32,72%,46%,0.18)] overflow-hidden max-w-sm">
      <div className="p-5 text-center">
        <div className="relative w-24 h-24 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(36,18%,86%)" strokeWidth="7" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke="url(#reading-gradient)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${42 * 2 * Math.PI * (progress / 100)} ${42 * 2 * Math.PI * (1 - progress / 100)}`}
            />
            <defs>
              <linearGradient id="reading-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(32,72%,46%)" />
                <stop offset="100%" stopColor="hsl(14,62%,58%)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-xl font-bold text-[hsl(28,20%,15%)]">{progress}%</span>
          </div>
        </div>
        <p className="font-display font-semibold text-sm text-[hsl(28,20%,15%)]">Bible in a Year</p>
        <p className="text-xs text-[hsl(28,12%,42%)] mt-1">Day 248 of 365</p>
      </div>
      <div className="px-4 pb-4 space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-[hsl(28,12%,42%)] font-semibold">Today's Readings</p>
        {["Isaiah 56-58", "Galatians 5", "Psalm 119:1-48"].map((r, i) => (
          <div key={i} className="flex items-center gap-3 bg-[hsl(38,38%,96%)] rounded-xl p-3">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${i < 2 ? "bg-[hsl(32,72%,46%)]" : "bg-[hsl(38,38%,96%)] border border-[hsl(36,18%,86%)]"}`}>
              {i < 2 ? <Check className="h-3.5 w-3.5 text-white" /> : <BookOpen className="h-3.5 w-3.5 text-[hsl(28,12%,42%)]" />}
            </div>
            <span className="text-sm text-[hsl(28,20%,15%)]">{r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Product UI Mock: Notes ─── */
function NotesMock() {
  return (
    <div className="bg-[hsl(38,42%,99%)] rounded-2xl border border-[hsl(36,18%,86%)] shadow-[0_8px_40px_-12px_hsl(32,72%,46%,0.18)] overflow-hidden max-w-sm">
      <div className="p-4 border-b border-[hsl(36,18%,86%)] flex items-center justify-between">
        <p className="font-display font-semibold text-sm text-[hsl(28,20%,15%)]">My Notes</p>
        <div className="flex items-center gap-2">
          <div className="bg-[hsl(38,38%,96%)] rounded-lg px-3 py-1.5 flex items-center gap-2">
            <Search className="h-3 w-3 text-[hsl(28,12%,42%)]" />
            <span className="text-[11px] text-[hsl(28,12%,42%)]">Search notes...</span>
          </div>
        </div>
      </div>
      <div className="p-3 space-y-2">
        {[
          { title: "Grace & Truth", preview: "John 1:14 — The Word became flesh and dwelt among us...", pinned: true },
          { title: "Armor of God", preview: "Ephesians 6:10-18 — Stand firm with the belt of truth...", pinned: false },
          { title: "Fruit of the Spirit", preview: "Galatians 5:22-23 — Love, joy, peace, patience...", pinned: false },
        ].map((n, i) => (
          <div key={i} className="bg-[hsl(38,38%,96%)] rounded-xl p-3.5 hover:bg-[hsl(36,18%,86%,0.3)] transition-colors">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[hsl(28,20%,15%)]">{n.title}</p>
              {n.pinned && <BookMarked className="h-3 w-3 text-[hsl(32,72%,46%)]" />}
            </div>
            <p className="text-[11px] text-[hsl(28,12%,42%)] mt-1 line-clamp-2">{n.preview}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  const heroTotal = HERO_LINE_1.length + HERO_LINE_2.length;
  const typedCount = useTypewriter(heroTotal);
  const typedDone = typedCount >= heroTotal;

  return (
    <div ref={ref} className="min-h-screen bg-[hsl(38,38%,96%)] overflow-clip">
      {/* Scroll progress */}
      <motion.div style={{ scaleX }} className="fixed top-0 inset-x-0 h-[2px] bg-gradient-to-r from-[hsl(32,72%,46%)] via-[hsl(14,62%,58%)] to-[hsl(40,85%,64%)] z-[60] origin-left" />

      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[hsl(38,38%,96%,0.7)] border-b border-[hsl(36,18%,86%,0.6)]">
        <div className="mx-auto max-w-6xl px-4 md:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[hsl(32,70%,44%)] via-[hsl(18,65%,52%)] to-[hsl(40,85%,64%)] flex items-center justify-center text-white shadow-[0_10px_40px_-12px_hsl(32,72%,46%,0.35)]">
              <Cross className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-[hsl(28,20%,15%)]">Devotly</span>
            <span className="hidden sm:inline-flex ml-2 px-2 py-0.5 rounded-full bg-[hsl(32,72%,46%,0.1)] text-[hsl(32,72%,46%)] text-[10px] font-bold tracking-widest uppercase">World-Class</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-[hsl(28,12%,42%)]">
            <a href="#features" className="hover:text-[hsl(28,20%,15%)] transition-colors">Features</a>
            <a href="#product" className="hover:text-[hsl(28,20%,15%)] transition-colors">Product</a>
            <a href="#why" className="hover:text-[hsl(28,20%,15%)] transition-colors">Why Devotly</a>
            <a href="#testimonials" className="hover:text-[hsl(28,20%,15%)] transition-colors">Stories</a>
            <a href="#faq" className="hover:text-[hsl(28,20%,15%)] transition-colors">FAQ</a>
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/auth")} className="rounded-full">Sign in</Button>
            <Button onClick={() => navigate("/auth")} className="rounded-full shadow-[0_10px_40px_-12px_hsl(32,72%,46%,0.35)]">Start free <ArrowRight className="h-4 w-4 ml-1" /></Button>
          </div>
          <button onClick={() => setMobileOpen((v) => !v)} className="md:hidden w-9 h-9 rounded-xl border border-[hsl(36,18%,86%)] flex items-center justify-center">
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="md:hidden border-t border-[hsl(36,18%,86%)] bg-[hsl(38,42%,99%)] px-4 py-4 space-y-2">
            <a href="#features" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-[hsl(28,20%,15%)]">Features</a>
            <a href="#product" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-[hsl(28,20%,15%)]">Product</a>
            <a href="#why" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-[hsl(28,20%,15%)]">Why Devotly</a>
            <Button onClick={() => navigate("/auth")} className="w-full rounded-full mt-2">Start free</Button>
          </motion.div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════════════════
          HERO — Asymmetric: emotional left + product right
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-[92%] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(38,38%,96%,0.6)] via-[hsl(38,38%,96%,0.75)] to-[hsl(38,38%,96%)]" />
        </motion.div>

        <div className="relative mx-auto max-w-6xl px-4 md:px-6 pt-12 md:pt-20 pb-16">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Left: Emotional storytelling */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[hsl(38,42%,99%)] border border-[hsl(36,18%,86%)] shadow-[0_4px_20px_-4px_hsl(32,72%,46%,0.15)] text-xs font-medium text-[hsl(28,20%,15%)]">
                <span className="w-2 h-2 rounded-full bg-[hsl(32,72%,46%)] animate-pulse" />
                Trusted by thousands walking daily with God
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative font-display text-4xl md:text-[3.5rem] font-bold tracking-tight mt-6 leading-[0.95] text-[hsl(28,20%,15%)]"
              >
                <span className="sr-only">{`${HERO_LINE_1} ${HERO_LINE_2}`}</span>
                <span className="invisible" aria-hidden="true">
                  {HERO_LINE_1}
                  <br />
                  {HERO_LINE_2}
                </span>
                <span className="absolute inset-0" aria-hidden="true">
                  {HERO_LINE_1.slice(0, Math.min(typedCount, HERO_LINE_1.length))}
                  {typedCount <= HERO_LINE_1.length && !typedDone && <Caret />}
                  <br />
                  <span className="text-gradient-cathedral">
                    {HERO_LINE_2.slice(0, Math.max(0, typedCount - HERO_LINE_1.length))}
                  </span>
                  {typedCount > HERO_LINE_1.length && !typedDone && <Caret />}
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                className="text-lg text-[hsl(28,12%,42%)] mt-5 max-w-lg leading-relaxed"
              >
                Beautifully crafted devotionals, sermons and scripture — designed with theological depth, not AI filler. Add to your home screen and experience it offline, instantly.
              </motion.p>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" onClick={() => navigate("/auth")} className="rounded-full h-12 px-8 shadow-[0_10px_40px_-12px_hsl(32,72%,46%,0.35)] text-base">
                    Start free — no card <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
                <Button size="lg" variant="outline" onClick={() => document.getElementById("product")?.scrollIntoView({ behavior: "smooth" })} className="rounded-full h-12 px-8 border-[hsl(36,18%,86%)]">
                  See the product
                </Button>
              </div>
              <div className="flex items-center gap-6 mt-6 text-xs text-[hsl(28,12%,42%)]">
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-[hsl(32,72%,46%)]" /> Free forever</span>
                <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-[hsl(32,72%,46%)]" /> Offline & private</span>
                <span className="flex items-center gap-1.5"><Heart className="h-4 w-4 text-[hsl(32,72%,46%)]" /> Made with care</span>
              </div>
            </motion.div>

            {/* Right: Live product visualization */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} className="relative mx-auto w-full max-w-[360px]">
              <div className="relative rounded-[2.5rem] border-[10px] border-[hsl(28,20%,15%,0.9)] bg-[hsl(28,20%,15%)] shadow-[0_32px_80px_rgba(0,0,0,0.35)] overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-6 bg-[hsl(28,20%,15%,0.9)] flex items-center justify-center z-10">
                  <div className="w-20 h-1.5 rounded-full bg-white/20" />
                </div>
                <div className="bg-[hsl(38,38%,96%)] pt-8">
                  <DevotionalCardMock />
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-[hsl(32,72%,46%,0.08)] blur-2xl" />
              <div className="absolute -left-6 -top-6 w-24 h-24 rounded-full bg-[hsl(14,62%,58%,0.06)] blur-xl" />
            </motion.div>
          </div>

          {/* Social proof */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-16 md:mt-20 flex flex-wrap items-center justify-center gap-6 text-xs text-[hsl(28,12%,42%)]">
            <span className="flex items-center gap-2">
              <span className="flex -space-x-2">{["S","J","G","D"].map((l) => (<span key={l} className="w-7 h-7 rounded-full bg-[hsl(38,42%,99%)] border-2 border-[hsl(38,38%,96%)] flex items-center justify-center text-[10px] font-bold text-[hsl(28,20%,15%)]">{l}</span>))}</span>
              4.9/5 · 2,000+ daily users
            </span>
            <span className="hidden md:inline h-4 w-px bg-[hsl(36,18%,86%)]" />
            <span>Offline PWA · No ads · Private by design</span>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURES — Icon-led with gradient backgrounds
          ═══════════════════════════════════════════════════════════════ */}
      <section id="features" className="mx-auto max-w-6xl px-4 md:px-6 py-16 md:py-24">
        <FadeIn className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-[hsl(32,72%,46%)]">Everything for a quiet walk</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mt-3 text-[hsl(28,20%,15%)]">
            Made to make you <span className="text-gradient-cathedral">want</span> to come back
          </h2>
          <p className="text-[hsl(28,12%,42%)] mt-4">Six beautifully crafted tools — each with motion, depth and care, not AI gloss.</p>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-4 mt-12">
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.06}>
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                className="rounded-2xl border border-[hsl(36,18%,86%)] bg-[hsl(38,42%,99%)] p-6 hover:shadow-[0_4px_20px_-4px_hsl(32,72%,46%,0.15)] transition-all group h-full"
              >
                <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center text-white shadow-[0_10px_40px_-12px_hsl(32,72%,46%,0.35)] group-hover:scale-105 transition-transform`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold mt-4 text-[hsl(28,20%,15%)]">{f.title}</h3>
                <p className="text-sm text-[hsl(28,12%,42%)] mt-1.5 leading-relaxed">{f.desc}</p>
                <div className="mt-4 h-1 w-12 rounded-full bg-[hsl(32,72%,46%,0.2)] group-hover:w-20 transition-all" />
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PRODUCT STORYTELLING — Show real UI, explain the why
          ═══════════════════════════════════════════════════════════════ */}
      <section id="product" className="border-y border-[hsl(36,18%,86%)] bg-[hsl(38,38%,96%,0.5)]">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-16 md:py-24 space-y-20 md:space-y-32">

          {/* Story 1: Daily Devotionals */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <FadeIn direction="left">
              <p className="text-xs font-bold tracking-[0.18em] uppercase text-[hsl(32,72%,46%)] mb-3">Daily Devotionals</p>
              <h3 className="font-display text-2xl md:text-4xl font-bold text-[hsl(28,20%,15%)] leading-tight">
                Scripture, reflection,<br />prayer and declaration
              </h3>
              <p className="text-[hsl(28,12%,42%)] mt-4 leading-relaxed">
                Each devotional is crafted with theological depth — multiple translations, Greek & Latin insights, highlighted text, word lookup and PDF export. Not generated, but <em className="text-[hsl(28,20%,15%)]">crafted</em> for real life's moments.
              </p>
              <ul className="mt-5 space-y-2.5">
                {["Multiple translations side by side", "Greek & Latin word studies", "Highlight, define & save passages", "Export as PDF or share with family"].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[hsl(28,12%,42%)]">
                    <Check className="h-4 w-4 text-[hsl(32,72%,46%)] mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </FadeIn>
            <FadeIn direction="right" className="flex justify-center">
              <DevotionalCardMock />
            </FadeIn>
          </div>

          {/* Story 2: Scripture Search */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <FadeIn direction="right" className="order-1 md:order-2">
              <p className="text-xs font-bold tracking-[0.18em] uppercase text-[hsl(32,72%,46%)] mb-3">Scripture Search</p>
              <h3 className="font-display text-2xl md:text-4xl font-bold text-[hsl(28,20%,15%)] leading-tight">
                Ask a question,<br />get the Word
              </h3>
              <p className="text-[hsl(28,12%,42%)] mt-4 leading-relaxed">
                Natural language search powered by AI — ask "What does the Bible say about anxiety?" and get relevant verses with cross-references and a confidence score. Search that informs, not overwhelms.
              </p>
              <ul className="mt-5 space-y-2.5">
                {["Natural language queries", "Confidence-scored results", "Cross-references included", "Copy verses or share instantly"].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[hsl(28,12%,42%)]">
                    <Check className="h-4 w-4 text-[hsl(32,72%,46%)] mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </FadeIn>
            <FadeIn direction="left" className="order-2 md:order-1 flex justify-center">
              <ScriptureSearchMock />
            </FadeIn>
          </div>

          {/* Story 3: Prayer Timer */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <FadeIn direction="left">
              <p className="text-xs font-bold tracking-[0.18em] uppercase text-[hsl(32,72%,46%)] mb-3">Prayer Timer</p>
              <h3 className="font-display text-2xl md:text-4xl font-bold text-[hsl(28,20%,15%)] leading-tight">
                Intentional prayer,<br />tracked with care
              </h3>
              <p className="text-[hsl(28,12%,42%)] mt-4 leading-relaxed">
                Set a timer, choose your focus and pray with intention. Gentle alerts mark the end — no jarring alarms, just a quiet completion. Your prayer history builds over time, showing your faithfulness.
              </p>
              <ul className="mt-5 space-y-2.5">
                {["Circular progress visualization", "Preset intervals (5, 10, 15 min)", "Gentle completion alerts", "Prayer history & patterns"].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[hsl(28,12%,42%)]">
                    <Check className="h-4 w-4 text-[hsl(32,72%,46%)] mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </FadeIn>
            <FadeIn direction="right" className="flex justify-center">
              <PrayerTimerMock />
            </FadeIn>
          </div>

          {/* Story 4: Tracker & Streaks */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <FadeIn direction="right" className="order-1 md:order-2">
              <p className="text-xs font-bold tracking-[0.18em] uppercase text-[hsl(32,72%,46%)] mb-3">Tracker & Streaks</p>
              <h3 className="font-display text-2xl md:text-4xl font-bold text-[hsl(28,20%,15%)] leading-tight">
                Consistency without<br />the pressure
              </h3>
              <p className="text-[hsl(28,12%,42%)] mt-4 leading-relaxed">
                A calendar heatmap shows your devotional consistency — celebrated, not gamified. Your streak builds quietly, a visual reminder of your commitment to daily spiritual practice.
              </p>
              <ul className="mt-5 space-y-2.5">
                {["Monthly calendar heatmap", "Current streak visualization", "Completion tracking", "Guilt-free — miss a day, the streak continues"].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[hsl(28,12%,42%)]">
                    <Check className="h-4 w-4 text-[hsl(32,72%,46%)] mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </FadeIn>
            <FadeIn direction="left" className="order-2 md:order-1 flex justify-center">
              <TrackerMock />
            </FadeIn>
          </div>

          {/* Story 5: Family Sharing */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <FadeIn direction="left">
              <p className="text-xs font-bold tracking-[0.18em] uppercase text-[hsl(32,72%,46%)] mb-3">Family Sharing</p>
              <h3 className="font-display text-2xl md:text-4xl font-bold text-[hsl(28,20%,15%)] leading-tight">
                Grow together,<br />privately
              </h3>
              <p className="text-[hsl(28,12%,42%)] mt-4 leading-relaxed">
                Create a family group, share an invite code and start sharing devotionals. See each other's progress, encourage one another and build spiritual rhythm as a family — all private, no social pressure.
              </p>
              <ul className="mt-5 space-y-2.5">
                {["Invite codes for easy joining", "Share devotionals with messages", "Track family streaks together", "No social features — just family"].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[hsl(28,12%,42%)]">
                    <Check className="h-4 w-4 text-[hsl(32,72%,46%)] mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </FadeIn>
            <FadeIn direction="right" className="flex justify-center">
              <FamilyMock />
            </FadeIn>
          </div>

          {/* Story 6: Reading Plan & Notes */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <FadeIn direction="right" className="order-1 md:order-2">
              <p className="text-xs font-bold tracking-[0.18em] uppercase text-[hsl(32,72%,46%)] mb-3">Reading Plan & Notes</p>
              <h3 className="font-display text-2xl md:text-4xl font-bold text-[hsl(28,20%,15%)] leading-tight">
                Structure for your<br />scripture journey
              </h3>
              <p className="text-[hsl(28,12%,42%)] mt-4 leading-relaxed">
                A 365-day Bible reading plan with progress visualization, daily readings and completion tracking. Pair it with the notes editor — save insights, search your journal and pin what matters most.
              </p>
              <ul className="mt-5 space-y-2.5">
                {["365-day Bible in a Year plan", "Progress ring & daily readings", "Rich notes with search & pin", "Autosave — never lose a thought"].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[hsl(28,12%,42%)]">
                    <Check className="h-4 w-4 text-[hsl(32,72%,46%)] mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </FadeIn>
            <FadeIn direction="left" className="order-2 md:order-1">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <ReadingPlanMock />
                <NotesMock />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          WHY DEVOTLY — Design principles, not a template grid
          ═══════════════════════════════════════════════════════════════ */}
      <section id="why" className="mx-auto max-w-6xl px-4 md:px-6 py-16 md:py-24">
        <FadeIn className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-[hsl(32,72%,46%)]">Why Devotly</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mt-3 text-[hsl(28,20%,15%)]">
            Built with the same care<br />we put into the Word
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Wifi, title: "Offline First", desc: "Add to home screen. Your devotionals, notes and plan work without internet — no app store needed." },
            { icon: Lock, title: "Private by Design", desc: "Your data is yours. No ads, no tracking, no third-party analytics. Faith is personal — so is Devotly." },
            { icon: Globe, title: "Free Forever", desc: "All core features, free. No premium tiers, no credit card, no catch. Spiritual growth shouldn't be behind a paywall." },
            { icon: Sparkles, title: "Crafted, Not Generated", desc: "Every devotional, sermon and search result is crafted with theological depth — AI assists, but doesn't replace." },
          ].map((p, i) => (
            <FadeIn key={p.title} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -3 }}
                className="rounded-2xl border border-[hsl(36,18%,86%)] bg-[hsl(38,42%,99%)] p-6 h-full"
              >
                <div className="w-10 h-10 rounded-xl bg-[hsl(32,72%,46%,0.1)] flex items-center justify-center mb-4">
                  <p.icon className="h-5 w-5 text-[hsl(32,72%,46%)]" />
                </div>
                <h3 className="font-display font-semibold text-[hsl(28,20%,15%)]">{p.title}</h3>
                <p className="text-sm text-[hsl(28,12%,42%)] mt-1.5 leading-relaxed">{p.desc}</p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TESTIMONIALS — Richer, human
          ═══════════════════════════════════════════════════════════════ */}
      <section id="testimonials" className="border-y border-[hsl(36,18%,86%)] bg-[hsl(38,38%,96%,0.5)]">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-16 md:py-24">
          <FadeIn className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] uppercase text-[hsl(32,72%,46%)]">Stories</p>
              <h2 className="font-display text-2xl md:text-4xl font-bold mt-3 text-[hsl(28,20%,15%)]">
                Loved by those who<br />use it daily
              </h2>
            </div>
            <div className="hidden md:flex items-center gap-1 text-[hsl(38,82%,66%)]">
              {[1,2,3,4,5].map((i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              <span className="text-sm font-medium text-[hsl(28,12%,42%)] ml-2">4.9</span>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.06}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="rounded-2xl border border-[hsl(36,18%,86%)] bg-[hsl(38,42%,99%)] p-6 h-full flex flex-col"
                >
                  <Quote className="h-5 w-5 text-[hsl(32,72%,46%,0.4)]" />
                  <p className="text-sm mt-3 leading-relaxed text-[hsl(28,20%,15%,0.85)] flex-1">"{t.text}"</p>
                  <div className="flex items-center gap-3 mt-5 pt-4 border-t border-[hsl(36,18%,86%)]">
                    <div className="w-9 h-9 rounded-full bg-[hsl(32,72%,46%,0.1)] flex items-center justify-center text-xs font-bold text-[hsl(32,72%,46%)]">{t.avatar}</div>
                    <div>
                      <p className="text-sm font-semibold text-[hsl(28,20%,15%)]">{t.name}</p>
                      <p className="text-xs text-[hsl(28,12%,42%)]">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CTA — Emotional closing
          ═══════════════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 py-16 md:py-24">
        <FadeIn>
          <div className="rounded-[2rem] bg-gradient-to-br from-[hsl(32,70%,44%)] via-[hsl(18,65%,52%)] to-[hsl(40,85%,64%)] p-1">
            <div className="rounded-[2rem] bg-[hsl(38,42%,99%)] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-[hsl(32,72%,46%,0.08)] blur-2xl" />
              <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-[hsl(14,62%,58%,0.06)] blur-xl" />
              <div className="text-center md:text-left relative">
                <h3 className="font-display text-2xl md:text-3xl font-bold text-[hsl(28,20%,15%)]">
                  Your quiet moment<br />is waiting
                </h3>
                <p className="text-[hsl(28,12%,42%)] mt-3 max-w-md">
                  Join thousands who've made Devotly part of their daily rhythm. Free, offline, private — start in seconds.
                </p>
              </div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="shrink-0">
                <Button size="lg" onClick={() => navigate("/auth")} className="rounded-full h-12 px-8 shadow-[0_10px_40px_-12px_hsl(32,72%,46%,0.35)] text-base">
                  Get started free <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FAQ — Clean, not accordion-heavy
          ═══════════════════════════════════════════════════════════════ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 md:px-6 pb-16">
        <FadeIn className="text-center mb-8">
          <h3 className="font-display text-xl md:text-2xl font-bold text-[hsl(28,20%,15%)]">Frequently Asked</h3>
        </FadeIn>
        <div className="divide-y divide-[hsl(36,18%,86%)] border border-[hsl(36,18%,86%)] rounded-2xl overflow-hidden bg-[hsl(38,42%,99%)]">
          {faqs.map((f, i) => (
            <FadeIn key={f.q} delay={i * 0.05}>
              <details className="group p-5 md:p-6">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="font-medium text-sm text-[hsl(28,20%,15%)]">{f.q}</span>
                  <ChevronDown className="h-4 w-4 text-[hsl(28,12%,42%)] group-open:rotate-180 transition-transform shrink-0 ml-4" />
                </summary>
                <p className="text-sm text-[hsl(28,12%,42%)] mt-3 leading-relaxed">{f.a}</p>
              </details>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-[hsl(36,18%,86%)] py-8">
        <div className="mx-auto max-w-6xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-[hsl(28,12%,42%)]">
          <span className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-[hsl(32,70%,44%)] to-[hsl(18,65%,52%)] flex items-center justify-center text-white">
              <Cross className="h-3 w-3" />
            </span>
            Devotly — for everyday faith
          </span>
          <span>© {new Date().getFullYear()} Devotly. Made with care.</span>
        </div>
      </footer>
    </div>
  );
}
