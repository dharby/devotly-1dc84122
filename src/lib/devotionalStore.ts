export interface Devotional {
  id: string;
  title: string;
  topic: string;
  tone: "personal" | "family" | "encouraging" | "deep";
  scripture: string;
  scriptureReference: string;
  greekLatinInsights?: string;
  reflection: string;
  prayer: string;
  declaration?: string;
  createdAt: string;
  completed: boolean;
  saved: boolean;
}

export interface TrackerDay {
  date: string;
  completed: boolean;
  devotionalId?: string;
}

const DEVOTIONALS_KEY = "devotionals";
const TRACKER_KEY = "tracker";
const STREAK_KEY = "streak";

export function getDevotionals(): Devotional[] {
  const data = localStorage.getItem(DEVOTIONALS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveDevotional(devotional: Devotional) {
  const devotionals = getDevotionals();
  const existing = devotionals.findIndex((d) => d.id === devotional.id);
  if (existing >= 0) {
    devotionals[existing] = devotional;
  } else {
    devotionals.unshift(devotional);
  }
  localStorage.setItem(DEVOTIONALS_KEY, JSON.stringify(devotionals));
}

export function getSavedDevotionals(): Devotional[] {
  return getDevotionals().filter((d) => d.saved);
}

export function getTrackerDays(): TrackerDay[] {
  const data = localStorage.getItem(TRACKER_KEY);
  return data ? JSON.parse(data) : [];
}

export function markDayComplete(date: string, devotionalId?: string) {
  const days = getTrackerDays();
  const existing = days.findIndex((d) => d.date === date);
  if (existing >= 0) {
    days[existing].completed = true;
    days[existing].devotionalId = devotionalId;
  } else {
    days.push({ date, completed: true, devotionalId });
  }
  localStorage.setItem(TRACKER_KEY, JSON.stringify(days));
}

export function getCurrentStreak(): number {
  const days = getTrackerDays().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  if (days.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split("T")[0];
    const found = days.find((d) => d.date === dateStr && d.completed);
    if (found) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Local sample devotional generator — offline fallback when service is unavailable
export function generateSampleDevotional(
  topic: string,
  tone: Devotional["tone"]
): Devotional {
  const devotionals: Record<string, Partial<Devotional>> = {
    faith: {
      title: "Walking by Faith, Not by Sight",
      scripture:
        '"For we walk by faith, not by sight." — 2 Corinthians 5:7 (ESV)',
      scriptureReference: "2 Corinthians 5:7",
      greekLatinInsights:
        'The Greek word for "faith" here is πίστις (pistis), meaning trust, confidence, and firm persuasion. The Latin Vulgate uses "fidem" from fides — the root of "fidelity." Walking (περιπατοῦμεν, peripatoumen) implies a continuous lifestyle, not a one-time act.',
      reflection:
        "Faith is not the absence of doubt — it is choosing to trust God in the midst of uncertainty. Every step we take without seeing the full picture is an act of worship. Like Abraham who left his homeland not knowing where he was going, we too are called to move forward with confidence in God's character rather than our circumstances.\n\nToday, consider the areas of your life where you're waiting for clarity before moving. What if God is asking you to take the next step before the fog lifts? Faith grows not in comfort, but in the stretching.",
      prayer:
        "Lord, strengthen my faith today. Help me to trust You even when I cannot see the path ahead. Let my steps be guided not by my understanding but by Your unfailing love. Give me the courage to walk forward, knowing You hold my future. Amen.",
      declaration:
        "I declare that I walk by faith and not by sight. My trust is in the Lord, and He directs my every step.",
    },
    love: {
      title: "The Unfailing Nature of God's Love",
      scripture:
        '"The Lord your God is in your midst, a mighty one who will save; he will rejoice over you with gladness; he will quiet you by his love." — Zephaniah 3:17 (ESV)',
      scriptureReference: "Zephaniah 3:17",
      greekLatinInsights:
        'The Hebrew word for "love" here is אַהֲבָה (ahavah), encompassing deep, unconditional affection. "Rejoice" (יָשִׂישׂ, yasis) describes exuberant joy — God literally spins with delight over His children. The Latin "in caritate sua" uses caritas — selfless love.',
      reflection:
        "In a world where love often comes with conditions, God's love stands apart. He doesn't love you because of what you do — He loves you because of who He is. Zephaniah paints a picture of a God who doesn't just tolerate us, but actually delights in us.\n\nWhen life feels overwhelming, remember: the Creator of the universe rejoices over you. He quiets your anxious heart with His love. Let that truth settle deep into your soul today.",
      prayer:
        "Father, help me to truly understand the depth of Your love. When I feel unworthy, remind me that Your love is not based on my performance. Quiet my restless heart today with Your presence. Amen.",
      declaration:
        "I am deeply loved by God. His love for me is unfailing, unconditional, and everlasting.",
    },
  };

  const base =
    devotionals[topic.toLowerCase()] || {
      title: `Finding God in ${topic.charAt(0).toUpperCase() + topic.slice(1)}`,
      scripture: `"Trust in the Lord with all your heart and lean not on your own understanding." — Proverbs 3:5 (ESV)`,
      scriptureReference: "Proverbs 3:5",
      greekLatinInsights: `The Hebrew for "trust" is בָּטַח (batach), meaning to lean upon, to feel safe and secure. "Heart" (לֵב, lev) refers to the entire inner person — mind, will, and emotions. The Latin Vulgate renders this as "habe fiduciam in Domino" — have confidence in the Lord.`,
      reflection: `When we think about ${topic}, we often approach it from our limited human perspective. But God invites us to see through His eyes. Every challenge, every joy, every season of life is an opportunity to deepen our trust in Him.\n\nToday, bring your thoughts about ${topic} before the Lord. Ask Him to transform your understanding and reveal His purpose in this area of your life.`,
      prayer: `Heavenly Father, I bring my thoughts about ${topic} before You today. Grant me wisdom and peace. Help me see this through Your eyes and trust Your plan. Fill me with Your Spirit as I meditate on Your Word. Amen.`,
      declaration: `I trust God completely in the area of ${topic}. His wisdom guides me, and His love sustains me.`,
    };

  const toneAdjustments: Record<string, string> = {
    family:
      "\n\n🏠 **For the Family:** Take a moment to discuss this topic together. Ask each family member what this scripture means to them personally.",
    encouraging:
      "\n\n💛 Remember: You are not alone in this journey. God is with you every step of the way.",
    deep: "\n\n📖 **Deeper Study:** Consider reading the full chapter for broader context. Journal your thoughts and return to this passage throughout the week.",
  };

  return {
    id: generateId(),
    title: base.title || "Daily Devotional",
    topic,
    tone,
    scripture: base.scripture || "",
    scriptureReference: base.scriptureReference || "",
    greekLatinInsights: base.greekLatinInsights,
    reflection:
      (base.reflection || "") + (toneAdjustments[tone] || ""),
    prayer: base.prayer || "",
    declaration: base.declaration,
    createdAt: new Date().toISOString(),
    completed: false,
    saved: false,
  };
}
