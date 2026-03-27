export interface FastingPlan {
  id: string;
  name: string;
  description: string;
  durationDays: number;
  type: "daniel" | "water" | "intermittent" | "custom";
}

export interface ActiveFast {
  id: string;
  planId: string;
  planName: string;
  startDate: string;
  durationDays: number;
  checkins: string[]; // array of date strings
  completed: boolean;
}

const FASTING_KEY = "fasting_data";

export const FASTING_PLANS: FastingPlan[] = [
  { id: "daniel-3", name: "Daniel Fast", description: "3 days of fruits, vegetables, and water only", durationDays: 3, type: "daniel" },
  { id: "daniel-21", name: "21-Day Daniel Fast", description: "21 days of plant-based eating and prayer", durationDays: 21, type: "daniel" },
  { id: "3day", name: "3-Day Fast", description: "3 days of prayer and fasting", durationDays: 3, type: "water" },
  { id: "7day", name: "7-Day Fast", description: "A full week devoted to prayer and fasting", durationDays: 7, type: "water" },
  { id: "21day", name: "21-Day Fast", description: "21 days of deep spiritual breakthrough", durationDays: 21, type: "water" },
  { id: "40day", name: "40-Day Fast", description: "Following Jesus' 40 days in the wilderness", durationDays: 40, type: "water" },
];

export function getActiveFasts(): ActiveFast[] {
  const data = localStorage.getItem(FASTING_KEY);
  return data ? JSON.parse(data) : [];
}

function saveFasts(fasts: ActiveFast[]) {
  localStorage.setItem(FASTING_KEY, JSON.stringify(fasts));
}

export function startFast(plan: FastingPlan): ActiveFast {
  const fasts = getActiveFasts();
  const newFast: ActiveFast = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    planId: plan.id,
    planName: plan.name,
    startDate: new Date().toISOString().split("T")[0],
    durationDays: plan.durationDays,
    checkins: [],
    completed: false,
  };
  fasts.unshift(newFast);
  saveFasts(fasts);
  return newFast;
}

export function checkinFast(fastId: string) {
  const fasts = getActiveFasts();
  const fast = fasts.find((f) => f.id === fastId);
  if (!fast) return;
  const today = new Date().toISOString().split("T")[0];
  if (!fast.checkins.includes(today)) {
    fast.checkins.push(today);
  }
  if (fast.checkins.length >= fast.durationDays) {
    fast.completed = true;
  }
  saveFasts(fasts);
}

export function completeFast(fastId: string) {
  const fasts = getActiveFasts();
  const fast = fasts.find((f) => f.id === fastId);
  if (fast) {
    fast.completed = true;
    saveFasts(fasts);
  }
}
