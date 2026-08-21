import { useNavigate, Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, BookOpen, Timer, ScrollText, Users, Flame, Search, NotebookPen, Star, Check, Play, ChevronDown, Quote, Shield, Zap, Heart, Cross, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import heroImage from "@/assets/hero-devotional.jpg";

const features = [
  { icon: BookOpen, title: "Daily Devotionals", desc: "Curated reflections written with depth — not generated, but crafted for real life's moments." },
  { icon: ScrollText, title: "Sermons & Bible Study", desc: "Full sermons with outlines, exegesis and illustrations — rich context without the noise." },
  { icon: Search, title: "Scripture Search", desc: "Find verses by theme, phrase or question with cross-references — search that informs, not overwhelms." },
  { icon: Timer, title: "Prayer Timer", desc: "Gentle intervals to help you stay focused in prayer, with a history you can revisit." },
  { icon: Flame, title: "Tracker & Streaks", desc: "A subtle way to build a habit — see your progress without the gamified pressure." },
  { icon: Users, title: "Family Sharing", desc: "Share devotionals with family, discuss together and grow — private, by design." },
];

const testimonials = [
  { name: "Sarah M.", role: "Mother of 3", text: "Devotly brought our family together every morning. The devotionals feel like they were written for us.", avatar: "S" },
  { name: "James O.", role: "Pastor", text: "I use the sermon builder weekly — depth, clarity and beauty in one place.", avatar: "J" },
  { name: "Grace A.", role: "Student", text: "The Word of the Day is the first thing I see. It stays with me all day.", avatar: "G" },
];

const faqs = [
  { q: "Is Devotly free?", a: "Yes — core features are free forever. No credit card, no ads." },
  { q: "Can I use it offline?", a: "Add to Home Screen — your devotionals, notes and reading plan work offline." },
  { q: "Will I get notifications?", a: "Opt-in for Word & Scripture of the Day at your chosen time — beautifully crafted, delivered to your device." },
];

export default function Landing() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  return (
    <div ref={ref} className="min-h-screen bg-background overflow-clip">
      {/* Scroll progress */}
      <motion.div style={{ scaleX }} className="fixed top-0 inset-x-0 h-[2px] bg-gradient-cathedral z-[60] origin-left" />

      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 md:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <motion.div whileHover={{ rotate: 8, scale: 1.06 }} className="w-9 h-9 rounded-xl bg-gradient-cathedral flex items-center justify-center text-white shadow-cathedral">
              <Cross className="h-5 w-5" />
            </motion.div>
            <span className="font-display text-xl font-bold tracking-tight">Devotly</span>
            <span className="hidden sm:inline-flex ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase">World-Class</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Stories</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/auth")} className="rounded-full">Sign in</Button>
            <Button onClick={() => navigate("/auth")} className="rounded-full shadow-cathedral">Start free <ArrowRight className="h-4 w-4 ml-1" /></Button>
          </div>
          <button onClick={() => setMobileOpen((v) => !v)} className="md:hidden w-9 h-9 rounded-xl border border-border flex items-center justify-center">
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="md:hidden border-t border-border bg-card px-4 py-4 space-y-2">
            <a href="#features" onClick={() => setMobileOpen(false)} className="block py-2 text-sm">Features</a>
            <a href="#how" onClick={() => setMobileOpen(false)} className="block py-2 text-sm">How it works</a>
            <Button onClick={() => navigate("/auth")} className="w-full rounded-full mt-2">Start free</Button>
          </motion.div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-[92%] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background" />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-warm/10" />
        </motion.div>
        {/* floating orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div animate={{ y: [0, -16, 0], x: [0, 10, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-10 -right-10 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
          <motion.div animate={{ y: [0, 18, 0], x: [0, -12, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 0.8 }} className="absolute top-[40%] -left-10 w-96 h-96 rounded-full bg-warm/15 blur-3xl" />
          <motion.div animate={{ y: [0, -12, 0], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 7, repeat: Infinity }} className="absolute bottom-10 left-1/2 w-72 h-72 rounded-full bg-golden/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 md:px-6 pt-12 md:pt-20 pb-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border shadow-warm text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-primary animate-glow-pulse" />
                Trusted by thousands walking daily with God
                <Sparkles className="h-3 w-3 text-primary" />
              </motion.div>
              <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mt-6 leading-[0.95]">
                A quiet moment,
                <br />
                <span className="text-gradient-cathedral">every single day.</span>
              </h1>
              <p className="text-lg text-muted-foreground mt-5 max-w-xl leading-relaxed">
                Devotly transforms your daily spiritual practice with beautifully crafted devotionals, sermons and scripture — thoughtfully designed with motion, depth and care. Add to your home screen and experience it offline, instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" onClick={() => navigate("/auth")} className="rounded-full h-12 px-8 shadow-cathedral text-base">
                    Start free — no card <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </motion.div>
                <Button size="lg" variant="outline" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="rounded-full h-12 px-8">
                  <Play className="h-4 w-4 mr-2" /> See how it feels
                </Button>
              </div>
              <div className="flex items-center gap-6 mt-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> Free forever</span>
                <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-primary" /> Offline & private</span>
                <span className="flex items-center gap-1.5"><Heart className="h-4 w-4 text-primary" /> Made with care</span>
              </div>
            </motion.div>

            {/* Phone mock */}
            <motion.div initial={{ opacity: 0, y: 24, rotate: 1 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }} className="relative mx-auto w-[300px] md:w-[360px]">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="relative rounded-[2.5rem] border-[10px] border-foreground/90 bg-foreground shadow-[0_32px_80px_rgba(0,0,0,0.35)] overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-6 bg-foreground flex items-center justify-center">
                  <div className="w-20 h-1.5 rounded-full bg-white/20" />
                </div>
                <div className="bg-background pt-8">
                  <div className="px-4 pt-2 pb-4">
                    <div className="h-28 rounded-2xl bg-gradient-cathedral p-4 text-white relative overflow-hidden">
                      <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }} />
                      <p className="text-xs uppercase tracking-widest opacity-80">Today’s Devotional</p>
                      <p className="font-display font-bold mt-1">Peace in Storms</p>
                      <p className="text-xs opacity-80 mt-1">John 14:27 · Rest in His presence</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {[BookOpen, Timer, Flame].map((Icon, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.08 }} className="rounded-xl border border-border bg-card p-3 text-center">
                          <Icon className="h-5 w-5 text-primary mx-auto" />
                          <p className="text-[10px] font-medium mt-1 uppercase tracking-wider text-muted-foreground">{["Devotion", "Prayer", "Streak"][i]}</p>
                        </motion.div>
                      ))}
                    </div>
                    <div className="mt-3 rounded-xl border border-border p-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Zap className="h-4 w-4 text-primary" /></div>
                      <div><p className="text-sm font-semibold">Word of the Day</p><p className="text-xs text-muted-foreground">Shalom — wholeness, peace</p></div>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full border border-primary/20 flex items-center justify-center bg-card/80 backdrop-blur">
                <Sparkles className="h-6 w-6 text-primary" />
              </motion.div>
            </motion.div>
          </div>

          {/* Social proof */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-16 md:mt-20 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-2"><span className="flex -space-x-2">{[1, 2, 3].map((i) => (<span key={i} className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center text-[10px] font-bold">{String.fromCharCode(64 + i)}</span>))}</span> 4.9/5 · 2,000+ daily users</span>
            <span className="hidden md:inline h-4 w-px bg-border" />
            <span>Offline PWA · No ads · Private by design</span>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-4 md:px-6 py-16 md:py-24">
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-primary">Everything for a quiet walk</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mt-3">Made to make you <span className="text-gradient-cathedral">want</span> to come back</h2>
          <p className="text-muted-foreground mt-4">Six beautifully crafted tools — each with motion, depth and care, not AI gloss.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-4 mt-10">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} whileHover={{ y: -4, scale: 1.01 }} className="rounded-2xl border border-border bg-card p-6 hover:shadow-warm transition-all group">
              <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center text-white shadow-cathedral group-hover:scale-105 transition-transform`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display font-semibold mt-4">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
              <div className="mt-4 h-1 w-12 rounded-full bg-primary/20 group-hover:w-20 transition-all" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="bg-muted/40 border-y border-border">
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-16 md:py-20">
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
{[
              { n: "1", t: "Download to home screen", d: "Add Devotly to your home screen — works offline, no store needed." },
              { n: "2", t: "Choose your rhythm", d: "Set Word & Scripture at your perfect time — delivered beautifully each day." },
              { n: "3", t: "Preview & keep", d: "Tap to preview instantly, saved to My Library for later." },
            ].map((s, i) => (
              <motion.div key={s.n} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center relative">
                <div className="mx-auto w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-cathedral">{s.n}</div>
                <h3 className="font-display font-semibold mt-4">{s.t}</h3>
                <p className="text-sm text-muted-foreground mt-1">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="mx-auto max-w-6xl px-4 md:px-6 py-16 md:py-24">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl md:text-3xl font-bold">Loved by those who use it daily</h2>
          <div className="hidden md:flex items-center gap-1 text-amber-500"><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /><Star className="h-4 w-4 fill-current" /></div>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="rounded-2xl border border-border bg-card p-6">
              <Quote className="h-5 w-5 text-primary/60" />
              <p className="text-sm mt-3 leading-relaxed">“{t.text}”</p>
              <div className="flex items-center gap-3 mt-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">{t.avatar}</div>
                <div><p className="text-sm font-semibold">{t.name}</p><p className="text-xs text-muted-foreground">{t.role}</p></div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-10">
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-[2rem] bg-gradient-cathedral p-[1px]">
          <div className="rounded-[2rem] bg-card p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-primary/10 blur-2xl" />
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-bold">A simpler way to engage with scripture daily</h3>
              <p className="text-muted-foreground mt-2">Join thousands who've added Devotly to their home screen. Free, offline, private — no store required.</p>
            </div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" onClick={() => navigate("/auth")} className="rounded-full h-12 px-8 shadow-cathedral">Get started free <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 md:px-6 py-10">
        <h3 className="font-display text-xl font-bold text-center">FAQ</h3>
        <div className="mt-6 divide-y divide-border border border-border rounded-2xl overflow-hidden">
          {faqs.map((f) => (
            <details key={f.q} className="group p-5 bg-card">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-medium text-sm">{f.q}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground group-open:rotate-180 transition-transform" />
              </summary>
              <p className="text-sm text-muted-foreground mt-3">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-2"><span className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center text-white"><Cross className="h-3 w-3" /></span> Devotly — for everyday faith</span>
          <span>© {new Date().getFullYear()} Devotly. Made with care.</span>
        </div>
      </footer>
    </div>
  );
}
