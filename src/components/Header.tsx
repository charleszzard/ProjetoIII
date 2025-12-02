import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, User, Menu, X, LogOut, GraduationCap } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  onNavigate: (view: "home" | "filter" | "stats" | "practice" | "simulados") => void;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  currentUser: any;
}

export default function Header({ onNavigate, onLoginClick, onLogoutClick, currentUser }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => onNavigate("home")}
          >
            <div className="w-10 h-10 gradient-oab rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all group-hover:scale-105 duration-300">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-foreground tracking-tight">OAB Quest Hub</h1>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Sua Aprovação Começa Aqui</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-secondary/5 p-1 rounded-full border border-border/50">
            <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-primary hover:bg-white" onClick={() => onNavigate("filter")}>
              Questões
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-primary hover:bg-white" onClick={() => onNavigate("simulados")}>
              Simulados
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-primary hover:bg-white" onClick={() => onNavigate("stats")}>
              Estatísticas
            </Button>
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {currentUser ? (
               <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-border/50">
                 <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold leading-none">{currentUser.name}</span>
                    <span className="text-[10px] text-muted-foreground">Estudante</span>
                 </div>
                 <div className="w-9 h-9 rounded-full gradient-oab flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white">
                    {currentUser.avatar}
                 </div>
                 <Button variant="ghost" size="icon" onClick={onLogoutClick} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full">
                    <LogOut className="w-4 h-4" />
                 </Button>
               </div>
            ) : (
               <div className="hidden sm:flex items-center gap-3">
                 <Badge variant="secondary" className="px-3 py-1">
                   <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                   Visitante
                 </Badge>
                 <Button 
                   variant="default" 
                   size="sm"
                   className="gradient-oab text-white shadow-md hover:shadow-lg transition-all rounded-full px-6"
                   onClick={onLoginClick}
                 >
                   <User className="w-4 h-4 mr-2" />
                   Entrar
                 </Button>
               </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t animate-fade-in bg-background/95 backdrop-blur-md absolute left-0 right-0 px-4 shadow-xl">
            <div className="flex flex-col gap-2">
              {currentUser && (
                 <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 rounded-xl mb-2 border border-border/50">
                    <div className="w-10 h-10 rounded-full gradient-oab text-white flex items-center justify-center font-bold shadow-sm">
                        {currentUser.avatar}
                    </div>
                    <div>
                        <p className="font-bold text-foreground">{currentUser.name}</p>
                        <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                    </div>
                 </div>
              )}

              <Button variant="ghost" className="justify-start h-12" onClick={() => { onNavigate("filter"); setIsMenuOpen(false); }}>
                <BookOpen className="w-4 h-4 mr-3 text-primary" /> Questões
              </Button>
              <Button variant="ghost" className="justify-start h-12" onClick={() => { onNavigate("simulados"); setIsMenuOpen(false); }}>
                <GraduationCap className="w-4 h-4 mr-3 text-primary" /> Simulados
              </Button>
              
              <div className="my-2 border-t border-border/50"></div>

              {currentUser ? (
                  <Button variant="destructive" className="justify-start w-full" onClick={() => { onLogoutClick(); setIsMenuOpen(false); }}>
                    <LogOut className="w-4 h-4 mr-2" /> Sair da Conta
                  </Button>
              ) : (
                  <Button className="gradient-oab text-white w-full shadow-md" onClick={() => { onLoginClick(); setIsMenuOpen(false); }}>
                    <User className="w-4 h-4 mr-2" /> Fazer Login
                  </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}