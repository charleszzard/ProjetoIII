import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Filter, RefreshCw } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  questionCount: number;
  color: string;
}

interface SubjectFilterProps {
  subjects: Subject[];
  selectedSubjects: string[];
  onSubjectToggle: (subjectId: string) => void;
  onClearFilters: () => void;
  onStartPractice: () => void;
}

export default function SubjectFilter({
  subjects,
  selectedSubjects,
  onSubjectToggle,
  onClearFilters,
  onStartPractice
}: SubjectFilterProps) {
  const totalSelected = selectedSubjects.length;
  const totalQuestions = subjects
    .filter(s => selectedSubjects.includes(s.id))
    .reduce((acc, curr) => acc + curr.questionCount, 0);

  return (
    <Card className="p-6 shadow-medium">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Filter className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Escolha as Áreas</h2>
              <p className="text-sm text-muted-foreground">
                Selecione os temas para estudar
              </p>
            </div>
          </div>
          
          {totalSelected > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          )}
        </div>

        {/* Subject Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {subjects.map((subject) => {
            const isSelected = selectedSubjects.includes(subject.id);
            
            return (
              <Button
                key={subject.id}
                variant={isSelected ? "default" : "outline"}
                className={`h-auto p-4 justify-between transition-all ${
                  isSelected 
                    ? "gradient-oab text-white shadow-medium" 
                    : "hover:shadow-soft"
                }`}
                onClick={() => onSubjectToggle(subject.id)}
              >
                <div className="text-left">
                  <div className="font-medium">{subject.name}</div>
                  <div className={`text-xs ${
                    isSelected ? "text-white/80" : "text-muted-foreground"
                  }`}>
                    {subject.questionCount} questões
                  </div>
                </div>
                
                {isSelected && (
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </Button>
            );
          })}
        </div>

        {/* Summary */}
        {totalSelected > 0 && (
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {totalSelected} área{totalSelected !== 1 ? 's' : ''} selecionada{totalSelected !== 1 ? 's' : ''}
                </Badge>
                <Badge variant="outline">
                  {totalQuestions} questões disponíveis
                </Badge>
              </div>
            </div>
            
            <Button 
              className="w-full gradient-oab text-white shadow-medium hover:shadow-strong transition-all"
              onClick={onStartPractice}
              disabled={totalQuestions === 0}
            >
              Começar a Praticar
              <span className="ml-2">🚀</span>
            </Button>
          </div>
        )}

        {/* Empty State */}
        {totalSelected === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted/50 rounded-full flex items-center justify-center">
              <Filter className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-2">
              Nenhuma área selecionada
            </h3>
            <p className="text-sm text-muted-foreground">
              Escolha pelo menos uma área de direito para começar a praticar
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}