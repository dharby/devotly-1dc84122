import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, Play, Pause, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const presets = [
  { label: "5 min", seconds: 5 * 60 },
  { label: "15 min", seconds: 15 * 60 },
  { label: "30 min", seconds: 30 * 60 },
  { label: "1 hour", seconds: 60 * 60 },
  { label: "2 hours", seconds: 120 * 60 },
  { label: "3 hours", seconds: 180 * 60 },
];

const PrayerTimer = () => {
  const navigate = useNavigate();
  const [totalSeconds, setTotalSeconds] = useState(30 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(30 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const progress = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  const startTimer = useCallback(() => {
    setIsRunning(true);
    setHasStarted(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setHasStarted(false);
    setRemainingSeconds(totalSeconds);
  }, [totalSeconds]);

  const selectPreset = useCallback((seconds: number) => {
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
    setIsRunning(false);
    setHasStarted(false);
  }, []);

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, remainingSeconds]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const hours = Math.floor(minutes / 60);
  const displayMin = minutes % 60;

  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const isComplete = hasStarted && remainingSeconds === 0;

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-semibold">Prayer Timer</h1>
        </div>
      </div>

      <div className="px-6 pt-8 animate-fade-in">
        {/* Circular Timer */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <svg width="272" height="272" className="transform -rotate-90">
              <circle
                cx="136"
                cy="136"
                r="120"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
              />
              <circle
                cx="136"
                cy="136"
                r="120"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {isComplete ? (
                <div className="text-center">
                  <p className="text-3xl mb-1">🙏</p>
                  <p className="font-display text-lg font-semibold text-primary">Amen</p>
                  <p className="text-xs text-muted-foreground">Prayer complete</p>
                </div>
              ) : (
                <>
                  <p className="font-display text-4xl font-bold tabular-nums">
                    {hours > 0 && `${hours}:`}
                    {displayMin.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isRunning ? "Praying..." : hasStarted ? "Paused" : "Ready"}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          {!isComplete ? (
            <>
              <Button
                variant="golden"
                size="lg"
                className="rounded-full w-14 h-14 p-0"
                onClick={isRunning ? pauseTimer : startTimer}
              >
                {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
              </Button>
              {hasStarted && (
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full w-14 h-14 p-0"
                  onClick={resetTimer}
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              )}
            </>
          ) : (
            <Button variant="golden" className="rounded-xl px-8" onClick={resetTimer}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Start Again
            </Button>
          )}
        </div>

        {/* Presets */}
        <div>
          <h3 className="font-display text-sm font-semibold mb-3 text-center text-muted-foreground uppercase tracking-wider">
            Duration
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {presets.map((p) => (
              <button
                key={p.seconds}
                onClick={() => selectPreset(p.seconds)}
                className={cn(
                  "px-3 py-3 rounded-xl border text-sm font-medium transition-all",
                  totalSeconds === p.seconds && !hasStarted
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scripture Encouragement */}
        <div className="mt-8 bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-sm italic text-muted-foreground leading-relaxed">
            "Pray without ceasing."
          </p>
          <p className="text-xs text-muted-foreground mt-1">— 1 Thessalonians 5:17</p>
        </div>
      </div>
    </div>
  );
};

export default PrayerTimer;
