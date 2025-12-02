import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, Clock, Star } from "lucide-react";

interface StatsCardProps {
  totalQuestions: number;
  correctAnswers: number;
  averageTime: string;
  currentStreak: number;
  subjectStats: Array<{
    subject: string;
    correct: number;
    total: number;
    accuracy: number;
  }>;
}

export default function StatsCard({
  totalQuestions,
  correctAnswers,
  averageTime,
  currentStreak,
  subjectStats
}: StatsCardProps) {
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Overall Stats */}
      <Card className="p-6 space-y-4 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Precisão Geral</p>
            <p className="text-2xl font-bold text-primary">{Math.round(accuracy)}%</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Acertos</span>
            <span>{correctAnswers}/{totalQuestions}</span>
          </div>
          <Progress value={accuracy} className="h-2" />
        </div>
      </Card>

      {/* Time Stats */}
      <Card className="p-6 space-y-4 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tempo Médio</p>
            <p className="text-2xl font-bold text-secondary">{averageTime}</p>
          </div>
        </div>
        <Badge variant="secondary" className="w-fit">
          Por questão
        </Badge>
      </Card>

      {/* Streak */}
      <Card className="p-6 space-y-4 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
            <Star className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sequência Atual</p>
            <p className="text-2xl font-bold text-warning">{currentStreak}</p>
          </div>
        </div>
        <Badge variant="outline" className="w-fit border-warning text-warning">
          🔥 Acertos seguidos
        </Badge>
      </Card>

      {/* Progress */}
      <Card className="p-6 space-y-4 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Respondidas</p>
            <p className="text-2xl font-bold text-success">{totalQuestions}</p>
          </div>
        </div>
        <Badge variant="outline" className="w-fit border-success text-success">
          📈 Em crescimento
        </Badge>
      </Card>

      {/* Subject Breakdown */}
      <Card className="p-6 md:col-span-2 lg:col-span-4 shadow-soft">
        <h3 className="text-lg font-semibold mb-4">Desempenho por Área</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjectStats.map((stat) => (
            <div key={stat.subject} className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-foreground">{stat.subject}</span>
                <Badge variant="outline">
                  {stat.correct}/{stat.total}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Precisão</span>
                  <span className="font-medium">{Math.round(stat.accuracy)}%</span>
                </div>
                <Progress value={stat.accuracy} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}