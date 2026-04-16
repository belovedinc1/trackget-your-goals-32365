import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trophy, Target, Flame, Trash2, Star } from "lucide-react";
import { useChallenges, useCreateChallenge, useUpdateChallenge, useDeleteChallenge, Challenge } from "@/hooks/useChallenges";
import { useCurrency } from "@/hooks/useCurrency";
import { Skeleton } from "@/components/ui/skeleton";

const challengeTypes = [
  { value: "no_spend", label: "No-Spend Challenge", icon: "🚫", description: "Avoid spending in a category" },
  { value: "savings_target", label: "Savings Target", icon: "💰", description: "Save a specific amount" },
  { value: "category_limit", label: "Category Limit", icon: "📊", description: "Stay under budget for a category" },
  { value: "streak", label: "Daily Streak", icon: "🔥", description: "Track daily habits" },
];

const presetChallenges = [
  { title: "No-Spend Weekend", description: "Don't spend anything on weekends this month", challenge_type: "no_spend", target_value: 4, reward_points: 100 },
  { title: "Save ₹5000 This Month", description: "Put away ₹5000 into savings", challenge_type: "savings_target", target_value: 5000, reward_points: 200 },
  { title: "Dining Budget ₹3000", description: "Keep food & dining under ₹3000", challenge_type: "category_limit", target_value: 3000, reward_points: 150 },
  { title: "30-Day Expense Log", description: "Log expenses every single day for 30 days", challenge_type: "streak", target_value: 30, reward_points: 300 },
];

function AddChallengeDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", challenge_type: "savings_target", target_value: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    reward_points: "100",
  });
  const create = useCreateChallenge();

  const handlePreset = (preset: typeof presetChallenges[0]) => {
    setForm({
      ...form,
      title: preset.title,
      description: preset.description,
      challenge_type: preset.challenge_type,
      target_value: String(preset.target_value),
      reward_points: String(preset.reward_points),
    });
  };

  const handleSubmit = () => {
    if (!form.title || !form.target_value) return;
    create.mutate(
      { title: form.title, description: form.description || null, challenge_type: form.challenge_type, target_value: parseFloat(form.target_value), start_date: form.start_date, end_date: form.end_date, reward_points: parseInt(form.reward_points) || 100 },
      { onSuccess: () => { setOpen(false); setForm({ title: "", description: "", challenge_type: "savings_target", target_value: "", start_date: new Date().toISOString().split("T")[0], end_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0], reward_points: "100" }); } }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" /> New Challenge</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Create Challenge</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Quick Start</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {presetChallenges.map((p) => (
                <Button key={p.title} variant="outline" size="sm" className="h-auto py-2 text-left justify-start" onClick={() => handlePreset(p)}>
                  <span className="mr-2">{challengeTypes.find((c) => c.value === p.challenge_type)?.icon}</span>
                  <span className="text-xs">{p.title}</span>
                </Button>
              ))}
            </div>
          </div>
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><Label>Type</Label>
            <Select value={form.challenge_type} onValueChange={(v) => setForm({ ...form, challenge_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{challengeTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Target Value</Label><Input type="number" value={form.target_value} onChange={(e) => setForm({ ...form, target_value: e.target.value })} /></div>
            <div><Label>Reward Points</Label><Input type="number" value={form.reward_points} onChange={(e) => setForm({ ...form, reward_points: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Start</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
            <div><Label>End</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
          </div>
          <Button onClick={handleSubmit} disabled={create.isPending} className="w-full">{create.isPending ? "Creating..." : "Start Challenge 🎯"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const { formatAmount } = useCurrency();
  const update = useUpdateChallenge();
  const del = useDeleteChallenge();

  const progress = challenge.target_value > 0 ? Math.min(100, (challenge.current_value / challenge.target_value) * 100) : 0;
  const isCompleted = challenge.status === "completed";
  const daysLeft = Math.max(0, Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / 86400000));
  const typeInfo = challengeTypes.find((t) => t.value === challenge.challenge_type);

  const handleUpdateProgress = () => {
    const newValue = challenge.current_value + 1;
    const newStatus = newValue >= challenge.target_value ? "completed" : "active";
    update.mutate({ id: challenge.id, current_value: newValue, status: newStatus });
  };

  return (
    <Card className={isCompleted ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{typeInfo?.icon || "🎯"}</span>
            <div>
              <h3 className="font-semibold">{challenge.title}</h3>
              {challenge.description && <p className="text-xs text-muted-foreground">{challenge.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant={isCompleted ? "default" : "outline"} className={isCompleted ? "bg-green-600" : ""}>
              {isCompleted ? "✅ Complete" : `${daysLeft}d left`}
            </Badge>
            <Button size="icon" variant="ghost" onClick={() => del.mutate(challenge.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{challenge.current_value} / {challenge.target_value}</span>
            <span className="flex items-center gap-1 text-amber-600"><Star className="h-3 w-3" /> {challenge.reward_points} pts</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {!isCompleted && (
          <Button size="sm" variant="outline" className="mt-3 w-full" onClick={handleUpdateProgress}>
            <Flame className="h-4 w-4 mr-1" /> Log Progress (+1)
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function Challenges() {
  const { data: challenges = [], isLoading } = useChallenges();

  const active = challenges.filter((c) => c.status === "active");
  const completed = challenges.filter((c) => c.status === "completed");
  const totalPoints = completed.reduce((s, c) => s + c.reward_points, 0);

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Monthly Challenges</h1>
          <p className="text-muted-foreground">Gamify your finances with fun challenges</p>
        </div>
        <AddChallengeDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Active Challenges</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> {active.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Completed</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-500" /> {completed.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Points</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold flex items-center gap-2"><Star className="h-5 w-5 text-amber-500" /> {totalPoints}</div></CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-40 w-full" />)}</div>
      ) : challenges.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground"><Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No challenges yet. Start one to gamify your finances!</p></CardContent></Card>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">🔥 Active</h2>
              <div className="grid gap-4 md:grid-cols-2">{active.map((c) => <ChallengeCard key={c.id} challenge={c} />)}</div>
            </div>
          )}
          {completed.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">🏆 Completed</h2>
              <div className="grid gap-4 md:grid-cols-2">{completed.map((c) => <ChallengeCard key={c.id} challenge={c} />)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
