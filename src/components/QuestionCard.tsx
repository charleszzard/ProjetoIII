import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Clock, BookOpen, CheckCircle } from "lucide-react";
import { useState } from "react";

interface Alternative {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  subject: string;
  difficulty: "facil" | "medio" | "dificil";
  alternatives: Alternative[];
  explanation?: string;
}

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onNext: () => void;
  onPrevious: () => void;
  onToggleFavorite?: () => void;
  isFavorited?: boolean;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onNext,
  onPrevious,
  onToggleFavorite,
  isFavorited = false
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswerSelect = (alternativeId: string) => {
    if (showExplanation) return;
    setSelectedAnswer(alternativeId);
    setShowExplanation(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "facil": return "bg-success";
      case "medio": return "bg-warning";
      case "dificil": return "bg-destructive";
      default: return "bg-muted";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "facil": return "Fácil";
      case "medio": return "Médio";
      case "dificil": return "Difícil";
      default: return "Normal";
    }
  };

  const progress = (questionNumber / totalQuestions) * 100;
  const correctAnswer = question.alternatives.find(alt => alt.isCorrect);
  const isCorrect = selectedAnswer === correctAnswer?.id;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header with Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="font-medium">
              <BookOpen className="w-3 h-3 mr-1" />
              {question.subject}
            </Badge>
            <Badge 
              className={`text-white ${getDifficultyColor(question.difficulty)}`}
            >
              {getDifficultyText(question.difficulty)}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {questionNumber}/{totalQuestions}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question Card */}
      <Card className="p-6 shadow-medium">
        <div className="space-y-6">
          {/* Question Header */}
          <div className="flex justify-between items-start gap-4">
            <h2 className="text-lg font-semibold leading-relaxed text-foreground">
              {question.text}
            </h2>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFavorite}
              className="shrink-0"
            >
              <Heart 
                className={`w-4 h-4 ${isFavorited ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} 
              />
            </Button>
          </div>

          {/* Alternatives */}
          <div className="space-y-3">
            {question.alternatives.map((alternative, index) => {
              const letter = String.fromCharCode(65 + index); // A, B, C, D
              const isSelected = selectedAnswer === alternative.id;
              const isCorrectAnswer = alternative.isCorrect;
              
              let buttonVariant: "outline" | "destructive" | "default" = "outline";
              let className = "w-full justify-start text-left h-auto p-4 transition-all";
              
              if (showExplanation) {
                if (isCorrectAnswer) {
                  className += " bg-success/10 border-success text-success-foreground";
                } else if (isSelected && !isCorrectAnswer) {
                  className += " bg-destructive/10 border-destructive text-destructive-foreground";
                }
              } else if (isSelected) {
                className += " bg-primary/10 border-primary";
              }

              return (
                <Button
                  key={alternative.id}
                  variant={buttonVariant}
                  className={className}
                  onClick={() => handleAnswerSelect(alternative.id)}
                  disabled={showExplanation}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full border bg-background shrink-0">
                      {showExplanation && isCorrectAnswer && (
                        <CheckCircle className="w-4 h-4 text-success" />
                      )}
                      {!showExplanation && (
                        <span className="text-sm font-medium">{letter}</span>
                      )}
                    </div>
                    <span className="text-sm leading-relaxed">{alternative.text}</span>
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplanation && question.explanation && (
            <div className="p-4 bg-muted/50 rounded-lg border">
              <h3 className="font-medium text-foreground mb-2">
                {isCorrect ? "🎉 Correto!" : "❌ Resposta incorreta"}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {question.explanation}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between gap-4">
        <Button 
          variant="outline" 
          onClick={onPrevious}
          disabled={questionNumber === 1}
          className="min-w-24"
        >
          Anterior
        </Button>
        
        <Button 
          onClick={onNext}
          disabled={!showExplanation}
          className="min-w-24 gradient-oab text-white"
        >
          {questionNumber === totalQuestions ? "Finalizar" : "Próxima"}
        </Button>
      </div>
    </div>
  );
}