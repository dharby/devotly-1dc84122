export const DAILY_TOPICS: { topic: string; verse: string }[] = [
  { topic: "God's Faithfulness", verse: "Lamentations 3:22-23" },
  { topic: "Peace in Storms", verse: "John 14:27" },
  { topic: "Strength in Weakness", verse: "2 Corinthians 12:9" },
  { topic: "Walking in Love", verse: "1 John 4:7-8" },
  { topic: "Trusting God's Plan", verse: "Jeremiah 29:11" },
  { topic: "Joy of the Lord", verse: "Nehemiah 8:10" },
  { topic: "Forgiveness", verse: "Colossians 3:13" },
  { topic: "Hope in Christ", verse: "Romans 15:13" },
  { topic: "Patience & Endurance", verse: "James 1:2-4" },
  { topic: "God's Provision", verse: "Philippians 4:19" },
  { topic: "Identity in Christ", verse: "2 Corinthians 5:17" },
  { topic: "Gratitude", verse: "1 Thessalonians 5:18" },
  { topic: "Courage", verse: "Joshua 1:9" },
  { topic: "Grace", verse: "Ephesians 2:8-9" },
  { topic: "Renewed Mind", verse: "Romans 12:2" },
  { topic: "Humility", verse: "Philippians 2:3-4" },
  { topic: "Compassion", verse: "Colossians 3:12" },
  { topic: "Purpose", verse: "Ephesians 2:10" },
  { topic: "Obedience", verse: "John 14:15" },
  { topic: "Wisdom", verse: "James 1:5" },
  { topic: "Rest in God", verse: "Matthew 11:28-30" },
  { topic: "Overcoming Fear", verse: "2 Timothy 1:7" },
  { topic: "Generosity", verse: "2 Corinthians 9:7" },
  { topic: "The Holy Spirit", verse: "John 16:13" },
  { topic: "Contentment", verse: "Philippians 4:11-12" },
  { topic: "Worship", verse: "Psalm 95:1-2" },
  { topic: "Prayer Life", verse: "Philippians 4:6-7" },
  { topic: "God's Sovereignty", verse: "Isaiah 46:10" },
  { topic: "Healing", verse: "Psalm 147:3" },
  { topic: "Perseverance", verse: "Galatians 6:9" },
  { topic: "Spiritual Armor", verse: "Ephesians 6:11" },
];

export function getDailySuggestion(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0).getTime();
  const dayOfYear = Math.floor((date.getTime() - start) / 86400000);
  return DAILY_TOPICS[dayOfYear % DAILY_TOPICS.length];
}
