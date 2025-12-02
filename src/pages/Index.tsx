import { useState, useEffect } from "react";
import Header from "@/components/Header";
import SubjectFilter from "@/components/SubjectFilter";
import StatsCard from "@/components/StatsCard";
import LoginModal from "@/components/LoginModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, BarChart3, CheckCircle2, XCircle, Trash2, Clock, FileText, Play, Gavel } from "lucide-react";

import questoesData from "@/questoes.json"; 

// --- TIPAGENS ---
type Subject = { id: string; name: string; questionCount: number; color: string; };
type Question = { id: string; text: string; subject: string; alternatives: { id: string; text: string }[]; correctLetter: string; };
type Stats = { totalQuestions: number; correctAnswers: number; averageTime: string; currentStreak: number; subjectStats: { subject: string; correct: number; total: number; accuracy: number; }[]; };
type QuestaoAPI = { id_questoes: string; texto: string; disciplina: string; alternativas: string; gabarito: string; };
type UserHistoryItem = { questionId: string; subject: string; correct: boolean; date: string; };
type ViewMode = "home" | "filter" | "practice" | "stats" | "simulados";

// --- CSS INJETADO PARA ANIMAÇÃO DO MARTELO ---
const hammerStyles = `
  @keyframes hammer-swing {
    0% { transform: rotate(0deg); }
    20% { transform: rotate(-30deg); }
    40% { transform: rotate(10deg); } /* Batida */
    60% { transform: rotate(-5deg); }
    100% { transform: rotate(0deg); }
  }
  
  @keyframes shockwave {
    0% { transform: scale(0.8); opacity: 0; }
    40% { opacity: 0.5; }
    100% { transform: scale(1.5); opacity: 0; }
  }

  .animate-hammer {
    transform-origin: bottom right;
    animation: hammer-swing 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }

  .animate-shockwave {
    animation: shockwave 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    animation-delay: 1s; /* Sincroniza com a batida (40% de 2.5s = 1s) */
  }
  
  .hammer-glow {
    filter: drop-shadow(0 0 15px rgba(220, 38, 38, 0.3));
  }
`;

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewMode>("home");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  
  // Estados do Simulado
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0); 

  // Estados de Estatísticas e Loading
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  // Autenticação
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const allQuestions = questoesData as QuestaoAPI[];

  // --- EFEITOS E HANDLERS ---
  useEffect(() => {
    const savedUser = localStorage.getItem("oab_current_user");
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem("oab_current_user", JSON.stringify(user));
  };

  const handleLogout = () => {
    if(confirm("Deseja realmente sair?")) {
        setCurrentUser(null);
        localStorage.removeItem("oab_current_user");
        setCurrentView("home");
    }
  };

  const handleNavigate = (view: ViewMode) => {
    if (currentView === 'practice' && view !== 'practice') {
        if (!confirm("Sair do simulado atual? Seu progresso nesta sessão será perdido.")) return;
        setScore(0);
        setCurrentQuestionIndex(0);
        setSelected(null);
        setShowResult(false);
    }
    setCurrentView(view);
  };

  useEffect(() => {
    const fetchSubjects = () => {
      setLoading(true);
      try {
        const subjectsList = allQuestions.reduce((acc: Subject[], q: QuestaoAPI) => {
          const subj = acc.find((s) => s.name === q.disciplina);
          if (subj) {
            subj.questionCount += 1;
          } else {
            acc.push({
              id: q.disciplina,
              name: q.disciplina,
              questionCount: 1,
              color: "primary",
            });
          }
          return acc;
        }, []);
        subjectsList.sort((a, b) => a.name.localeCompare(b.name));
        setSubjects(subjectsList);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (currentView !== "stats") return;
    const fetchStats = () => {
      setLoading(true);
      const historyKey = currentUser ? `oab_history_${currentUser.id}` : "oab_user_history";
      const historyJSON = localStorage.getItem(historyKey);
      const history: UserHistoryItem[] = historyJSON ? JSON.parse(historyJSON) : [];
      
      const totalQuestions = history.length;
      const correctAnswers = history.filter(h => h.correct).length;
      const statsBySubject: Record<string, { correct: number; total: number }> = {};

      history.forEach(item => {
        if (!statsBySubject[item.subject]) statsBySubject[item.subject] = { correct: 0, total: 0 };
        statsBySubject[item.subject].total += 1;
        if (item.correct) statsBySubject[item.subject].correct += 1;
      });

      const subjectStats = Object.keys(statsBySubject).map(subject => {
        const data = statsBySubject[subject];
        return {
          subject,
          correct: data.correct,
          total: data.total,
          accuracy: data.total > 0 ? (data.correct / data.total) * 100 : 0
        };
      }).sort((a, b) => b.total - a.total);

      setStats({
        totalQuestions,
        correctAnswers,
        averageTime: "N/A", 
        currentStreak: 0, 
        subjectStats
      });
      setLoading(false);
    };
    fetchStats();
  }, [currentView, currentUser]);

  const handleResetStats = () => {
    if (confirm("Apagar histórico?")) {
      const historyKey = currentUser ? `oab_history_${currentUser.id}` : "oab_user_history";
      localStorage.removeItem(historyKey);
      setStats({ totalQuestions: 0, correctAnswers: 0, averageTime: "0s", currentStreak: 0, subjectStats: [] });
    }
  };

  const processQuestions = (rawQuestions: QuestaoAPI[]) => {
    return rawQuestions.map((q) => {
        let alternatives: { id: string; text: string }[] = [];
        try {
          const alternativasObj = JSON.parse(q.alternativas) as Record<string, string>;
          alternatives = Object.entries(alternativasObj).map(([key, value]) => ({ id: key.toUpperCase(), text: value }));
        } catch {
          let text = q.alternativas.replace(/\\n/g, '\n');
          if (!text.includes('\n')) text = text.replace(/(\s|^)(\(?[a-dA-D]\)[ .-])/g, '\n$2');
          const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          alternatives = lines.map((line, index) => {
            const match = line.match(/^(\(?[a-dA-D]\)[ .-])(.*)/);
            if (match) {
              const id = match[1].replace(/[() .-]/g, '').toUpperCase();
              return { id, text: match[2].trim() };
            }
            return { id: String.fromCharCode(65 + index), text: line };
          });
        }
        alternatives.sort((a, b) => a.id.localeCompare(b.id));
        return {
          id: q.id_questoes,
          text: q.texto,
          subject: q.disciplina,
          alternatives,
          correctLetter: q.gabarito.trim().toUpperCase(),
        };
    });
  };

  const handleStartCustomPractice = () => {
    setLoading(true);
    const filteredQuestions = selectedSubjects.length > 0 
      ? allQuestions.filter(q => selectedSubjects.includes(q.disciplina))
      : allQuestions;
    const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random());
    if (shuffled.length === 0) { alert("Nenhuma questão encontrada."); setLoading(false); return; }
    setQuestions(processQuestions(shuffled));
    setCurrentQuestionIndex(0); setSelected(null); setShowResult(false); setScore(0);
    setCurrentView("practice"); setLoading(false);
  };

  const handleStartMockExam = (amount: number) => {
    setLoading(true);
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, amount);
    setQuestions(processQuestions(shuffled));
    setCurrentQuestionIndex(0); setSelected(null); setShowResult(false); setScore(0);
    setCurrentView("practice"); setLoading(false);
  };

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects((prev) => prev.includes(subjectId) ? prev.filter((id) => id !== subjectId) : [...prev, subjectId]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-xl font-bold text-primary">Carregando...</div>
      </div>
    );
  }

  // --- PRÁTICA ---
  if (currentView === "practice" && questions.length > 0) {
    const question = questions[currentQuestionIndex];
    const handleSelect = (altId: string) => {
      setSelected(altId);
      setShowResult(true);
      const isCorrect = altId === question.correctLetter;
      if (isCorrect) setScore((prev) => prev + 1);
      
      // Salva histórico específico do usuário se logado, senão usa genérico
      const historyKey = currentUser ? `oab_history_${currentUser.id}` : "oab_user_history";
      const newHistoryItem: UserHistoryItem = {
        questionId: question.id,
        subject: question.subject,
        correct: isCorrect,
        date: new Date().toISOString()
      };
      const existingHistory = JSON.parse(localStorage.getItem(historyKey) || "[]");
      localStorage.setItem(historyKey, JSON.stringify([...existingHistory, newHistoryItem]));
    };

    return (
      <div className="min-h-screen bg-slate-50">
        <Header onNavigate={handleNavigate} onLoginClick={() => setIsLoginModalOpen(true)} onLogoutClick={handleLogout} currentUser={currentUser} />
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="flex justify-between items-center mb-6 text-sm font-medium text-gray-500">
             <span>Questão {currentQuestionIndex + 1} de {questions.length}</span>
             <span>Acertos: {score}</span>
          </div>
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="mb-8">
               <span className="inline-block text-xs font-bold px-3 py-1 bg-blue-100 text-blue-700 rounded-full mb-4 uppercase tracking-wide">{question.subject}</span>
               <div className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed whitespace-pre-wrap">{question.text}</div>
            </div>
            <div className="space-y-3">
              {question.alternatives.map((alt) => {
                const isSelected = selected === alt.id;
                const isCorrect = alt.id === question.correctLetter;
                let styleClass = "border-gray-200 hover:border-blue-300 hover:bg-blue-50";
                if (showResult) {
                    if (isCorrect) styleClass = "bg-green-100 border-green-500 text-green-900 ring-1 ring-green-500";
                    else if (isSelected && !isCorrect) styleClass = "bg-red-100 border-red-500 text-red-900 ring-1 ring-red-500";
                    else styleClass = "opacity-50 border-gray-200"; 
                } else if (isSelected) styleClass = "border-blue-500 bg-blue-50 ring-1 ring-blue-500";
                return (
                  <button key={alt.id} className={`w-full text-left p-4 rounded-lg border transition-all duration-200 flex items-start gap-3 ${styleClass}`} disabled={showResult} onClick={() => handleSelect(alt.id)}>
                    <span className={`font-bold min-w-[24px] ${showResult && isCorrect ? 'text-green-800' : ''}`}>{alt.id})</span>
                    <span className="leading-relaxed">{alt.text}</span>
                  </button>
                );
              })}
            </div>
            {showResult && (
              <div className={`mt-6 p-4 rounded-lg border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${selected === question.correctLetter ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                {selected === question.correctLetter ? (<><CheckCircle2 className="h-6 w-6 text-green-600" /><div><p className="font-bold">Resposta Correta!</p></div></>) : (<><XCircle className="h-6 w-6 text-red-600" /><div><p className="font-bold">Incorreto.</p><p className="text-sm">Alternativa correta: <strong>{question.correctLetter}</strong>.</p></div></>)}
              </div>
            )}
          </div>
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => { if(confirm("Deseja sair?")) handleNavigate("home"); }}>Sair</Button>
            <Button className="gradient-oab text-white min-w-[140px]" onClick={() => { setShowResult(false); setSelected(null); if (currentQuestionIndex < questions.length - 1) { setCurrentQuestionIndex((i) => i + 1); } else { alert(`Finalizado! Acertos: ${score}/${questions.length}`); handleNavigate("stats"); } }} disabled={!showResult}>
              {currentQuestionIndex < questions.length - 1 ? "Próxima" : "Ver Resultados"}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // --- SIMULADOS ---
  if (currentView === "simulados") {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header onNavigate={handleNavigate} onLoginClick={() => setIsLoginModalOpen(true)} onLogoutClick={handleLogout} currentUser={currentUser} />
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="text-center mb-10 space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Área de Simulados</h1>
            <p className="text-muted-foreground">Escolha o tipo de prova</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 hover:shadow-lg transition-all border-l-4 border-l-primary cursor-pointer" onClick={() => handleStartMockExam(80)}>
              <div className="flex justify-between items-start mb-4"><div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center"><FileText className="w-6 h-6 text-primary" /></div><Badge>Recomendado</Badge></div>
              <h3 className="text-xl font-bold mb-2">Simulado Completo OAB</h3>
              <p className="text-muted-foreground text-sm mb-4">Experiência real com 80 questões.</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6"><span className="flex items-center gap-1"><Clock className="w-4 h-4"/> ~ 5h</span><span className="flex items-center gap-1"><Zap className="w-4 h-4"/> 80 Questões</span></div>
              <Button className="w-full gradient-oab text-white"><Play className="w-4 h-4 mr-2" /> Iniciar</Button>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-all border-l-4 border-l-yellow-500 cursor-pointer" onClick={() => handleStartMockExam(40)}>
              <div className="flex justify-between items-start mb-4"><div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center"><Zap className="w-6 h-6 text-yellow-600" /></div><Badge variant="secondary">Rápido</Badge></div>
              <h3 className="text-xl font-bold mb-2">Simulado Expresso</h3>
              <p className="text-muted-foreground text-sm mb-4">Revisão rápida com 40 questões.</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6"><span className="flex items-center gap-1"><Clock className="w-4 h-4"/> ~ 2.5h</span><span className="flex items-center gap-1"><Zap className="w-4 h-4"/> 40 Questões</span></div>
              <Button variant="outline" className="w-full border-yellow-500 text-yellow-600 hover:bg-yellow-50"><Play className="w-4 h-4 mr-2" /> Iniciar</Button>
            </Card>
          </div>
        </main>
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // --- ESTATÍSTICAS ---
  if (currentView === "stats" && stats) {
    return (
      <div className="min-h-screen bg-background">
        <Header onNavigate={handleNavigate} onLoginClick={() => setIsLoginModalOpen(true)} onLogoutClick={handleLogout} currentUser={currentUser} />
        <main className="container mx-auto px-4 py-8 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Suas Estatísticas</h1>
            <p className="text-muted-foreground">
                {currentUser ? `Progresso de ${currentUser.name}` : "Histórico local (Visitante)"}
            </p>
          </div>
          <StatsCard {...stats} />
          <div className="flex justify-center gap-4">
            <Button onClick={() => handleNavigate("home")} className="gradient-oab text-white">Voltar ao Início</Button>
            {stats.totalQuestions > 0 && (<Button variant="destructive" onClick={handleResetStats} className="gap-2"><Trash2 className="w-4 h-4" /> Resetar Histórico</Button>)}
          </div>
        </main>
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // --- FILTRO ---
  if (currentView === "filter") {
    return (
      <div className="min-h-screen bg-background">
        <Header onNavigate={handleNavigate} onLoginClick={() => setIsLoginModalOpen(true)} onLogoutClick={handleLogout} currentUser={currentUser} />
        <main className="container mx-auto px-4 py-8"><div className="max-w-4xl mx-auto space-y-8"><div className="text-center space-y-4"><h1 className="text-3xl font-bold">Questões por Matéria</h1><p className="text-muted-foreground">Selecione disciplinas específicas.</p></div>
            <SubjectFilter subjects={subjects} selectedSubjects={selectedSubjects} onSubjectToggle={handleSubjectToggle} onClearFilters={() => setSelectedSubjects([])} onStartPractice={handleStartCustomPractice} />
            <div className="text-center"><Button variant="outline" onClick={() => handleNavigate("home")}>Voltar</Button></div></div></main>
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // --- HOME ---
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <style>{hammerStyles}</style>
      <Header onNavigate={handleNavigate} onLoginClick={() => setIsLoginModalOpen(true)} onLogoutClick={handleLogout} currentUser={currentUser} />
      <section className="relative py-20 px-4 min-h-[calc(100vh-64px)] flex flex-col justify-center items-center">
        <div className="absolute inset-0 gradient-soft opacity-50 pointer-events-none"></div>
        <div className="container mx-auto text-center relative z-10 max-w-4xl space-y-8 animate-fade-in">
            <h1 className="text-4xl md:text-7xl font-bold text-foreground leading-tight">
              Prepare-se para a <span className="gradient-oab bg-clip-text text-transparent">OAB</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Pratique com <strong>{allQuestions.length}</strong> questões reais, 
              acompanhe seu progresso e conquiste sua aprovação.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gradient-oab text-white shadow-strong hover:shadow-medium transition-all text-lg px-8 h-14" onClick={() => handleNavigate("filter")}>
                <Zap className="w-5 h-5 mr-2" /> Começar a Praticar
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 h-14 bg-white/50 backdrop-blur-sm" onClick={() => handleNavigate("stats")}>
                <BarChart3 className="w-5 h-5 mr-2" /> Ver Estatísticas
              </Button>
            </div>

            {/* --- ANIMAÇÃO DO MARTELO (GAVEL) --- */}
            <div className="mt-20 pt-10 flex justify-center pb-10">
                <div className="relative w-64 h-64 flex items-center justify-center">
                    {/* Brilho de fundo e Onda de Choque */}
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-[80px] animate-pulse"></div>
                    <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-40 h-10 bg-primary/20 rounded-[100%] animate-shockwave"></div>
                    
                    {/* Base do Martelo (Mesa/Sound Block) */}
                    <div className="absolute bottom-10 w-40 h-8 bg-slate-800/80 rounded-full shadow-2xl blur-[1px] transform scale-x-150"></div>
                    <div className="absolute bottom-12 w-32 h-6 bg-gradient-to-r from-amber-900 to-amber-700 rounded-lg shadow-lg border-b-4 border-amber-950 transform rotate-x-12 z-0"></div>
                    
                    {/* Martelo Animado */}
                    <div className="relative z-10 animate-hammer origin-bottom-right">
                        <Gavel className="w-48 h-48 text-amber-800 hammer-glow fill-amber-900 stroke-amber-950" strokeWidth={1.5} />
                        {/* Brilho no metal/madeira */}
                        <div className="absolute top-4 right-4 w-4 h-20 bg-white/20 blur-sm rounded-full transform rotate-45"></div>
                    </div>
                </div>
            </div>
        </div>
      </section>
      
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLoginSuccess={handleLoginSuccess} />
    </div>
  );
};

export default Index;