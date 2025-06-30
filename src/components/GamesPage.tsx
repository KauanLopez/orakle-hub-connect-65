import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Gamepad2, Plus, Play, Star, Trophy, BarChart3, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GamesPageProps {
  user: any;
}

const GamesPage = ({ user }: GamesPageProps) => {
  const [games, setGames] = useState<any[]>([]);
  const [playingGame, setPlayingGame] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [currentAnswers, setCurrentAnswers] = useState<any[]>([]);
  const [gameResults, setGameResults] = useState<any>(null);
  const [quizRating, setQuizRating] = useState(0);
  const [quizComment, setQuizComment] = useState('');
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [newGame, setNewGame] = useState({
    name: '',
    duration: 7,
    pointsPerCorrect: 2,
    pointsPerParticipation: 1,
    questions: [{ question: '', options: ['', '', '', ''], correctOption: 0 }]
  });
  const { toast } = useToast();
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedGameForStats, setSelectedGameForStats] = useState<any>(null);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = () => {
    const storedGames = JSON.parse(localStorage.getItem('orakle_games') || '[]');
    setGames(storedGames);
  };

  const canManageGames = user.userType === 'supervisor' || user.userType === 'admin';

  const getAvailableGames = () => {
    const now = new Date();
    return games.filter(game => {
      const createdAt = new Date(game.createdAt);
      const expiresAt = new Date(createdAt.getTime() + (game.duration * 24 * 60 * 60 * 1000));
      return now <= expiresAt;
    });
  };

  const addQuestion = () => {
    setNewGame({
      ...newGame,
      questions: [...newGame.questions, { question: '', options: ['', '', '', ''], correctOption: 0 }]
    });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = newGame.questions.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    );
    setNewGame({ ...newGame, questions: updatedQuestions });
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = newGame.questions.map((q, i) => {
      if (i === questionIndex) {
        const updatedOptions = q.options.map((opt, j) => j === optionIndex ? value : opt);
        return { ...q, options: updatedOptions };
      }
      return q;
    });
    setNewGame({ ...newGame, questions: updatedQuestions });
  };

  const createGame = () => {
    if (!newGame.name.trim() || newGame.questions.some(q => !q.question.trim())) return;

    const game = {
      id: Date.now().toString(),
      ...newGame,
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      statistics: {
        totalPlayers: 0,
        averageScore: 0,
        ratings: [],
        comments: []
      }
    };

    const updatedGames = [...games, game];
    setGames(updatedGames);
    localStorage.setItem('orakle_games', JSON.stringify(updatedGames));
    
    setNewGame({
      name: '',
      duration: 7,
      pointsPerCorrect: 2,
      pointsPerParticipation: 1,
      questions: [{ question: '', options: ['', '', '', ''], correctOption: 0 }]
    });
    setIsCreatingGame(false);
    
    toast({
      title: "Quiz criado!",
      description: `Quiz "${game.name}" criado com sucesso!`
    });
  };

  const startGame = (game: any) => {
    setPlayingGame(game);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setGameResults(null);
    setCurrentAnswers([]);
  };

  const submitAnswer = () => {
    if (!selectedAnswer || !playingGame) return;

    const isCorrect = parseInt(selectedAnswer) === playingGame.questions[currentQuestionIndex].correctOption;
    
    const updatedAnswers = [...currentAnswers, { questionIndex: currentQuestionIndex, answer: selectedAnswer, isCorrect }];
    setCurrentAnswers(updatedAnswers);

    if (currentQuestionIndex < playingGame.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
    } else {
      finishGame(updatedAnswers);
    }
  };

  const finishGame = (finalAnswers: any[]) => {
    if (!playingGame || !finalAnswers) return;

    const correctAnswers = finalAnswers.filter((a: any) => a.isCorrect).length;
    const totalPoints = (correctAnswers * playingGame.pointsPerCorrect) + playingGame.pointsPerParticipation;
    
    const currentUserData = JSON.parse(localStorage.getItem('orakle_current_user') || '{}');
    const allUsers = JSON.parse(localStorage.getItem('orakle_users') || '[]');
    
    const updatedUser = { ...currentUserData, points: (currentUserData.points || 0) + totalPoints };
    const updatedUsers = allUsers.map((u: any) => 
      u.id === currentUserData.id ? updatedUser : u
    );
    
    localStorage.setItem('orakle_current_user', JSON.stringify(updatedUser));
    localStorage.setItem('orakle_users', JSON.stringify(updatedUsers));

    const gameHistory = JSON.parse(localStorage.getItem('orakle_game_history') || '[]');
    const result = {
      id: Date.now().toString(),
      userId: user.id,
      gameId: playingGame.id,
      gameName: playingGame.name,
      correctAnswers,
      totalQuestions: playingGame.questions.length,
      pointsEarned: totalPoints,
      completedAt: new Date().toISOString()
    };
    
    gameHistory.push(result);
    localStorage.setItem('orakle_game_history', JSON.stringify(gameHistory));

    const pointsHistory = JSON.parse(localStorage.getItem('orakle_points_history') || '[]');
    const pointsEntry = {
      id: Date.now(),
      type: 'gain',
      amount: totalPoints,
      description: `Quiz: ${playingGame.name}`,
      date: new Date().toISOString()
    };
    pointsHistory.push(pointsEntry);
    localStorage.setItem('orakle_points_history', JSON.stringify(pointsHistory));

    setGameResults({ 
      gameId: playingGame.id,
      answers: finalAnswers, 
      correctAnswers, 
      totalPoints 
    });
  };

  const submitRating = () => {
    if (!playingGame || quizRating === 0) return;

    const updatedGames = games.map(game => {
      if (game.id === playingGame.id) {
        return {
          ...game,
          statistics: {
            ...game.statistics,
            ratings: [...(game.statistics.ratings || []), { userId: user.id, rating: quizRating }],
            comments: quizComment ? [...(game.statistics.comments || []), { userId: user.id, comment: quizComment }] : game.statistics.comments || []
          }
        };
      }
      return game;
    });

    setGames(updatedGames);
    localStorage.setItem('orakle_games', JSON.stringify(updatedGames));
    
    setPlayingGame(null);
    setQuizRating(0);
    setQuizComment('');
    
    toast({
      title: "Obrigado pelo feedback!",
      description: "Sua avaliação foi registrada com sucesso."
    });
  };

  const deleteGame = (gameId: string) => {
    const updatedGames = games.filter((g) => g.id !== gameId);
    setGames(updatedGames);
    localStorage.setItem('orakle_games', JSON.stringify(updatedGames));
    toast({
      title: 'Jogo Removido',
      description: 'O jogo foi removido com sucesso.',
    });
  };

  const GameStatsModal = () => {
    if (!selectedGameForStats) return null;
  
    const { name, statistics } = selectedGameForStats;
    const { ratings = [], comments = [] } = statistics;
    const averageRating = ratings.length > 0
      ? (ratings.reduce((acc: any, r: any) => acc + r.rating, 0) / ratings.length).toFixed(1)
      : 'N/A';
  
    return (
      <Dialog open={showStatsModal} onOpenChange={setShowStatsModal}>
        <DialogContent className="rounded-3xl border-0 bg-white/95 backdrop-blur-sm max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Estatísticas - {name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Média de Avaliações: {averageRating} <Star className="inline-block h-4 w-4 text-amber-400" /></p>
                <p>Total de Avaliações: {ratings.length}</p>
                <p>Total de Comentários: {comments.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Feedbacks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {comments.length > 0 ? comments.map((comment: any, index: number) => {
                  const userRating = ratings.find((r: any) => r.userId === comment.userId);
                  return (
                    <div key={index} className="border-b pb-2">
                      <p className="text-sm font-semibold">Usuário: {comment.userId}</p>
                      {userRating && <p className="text-sm">Nota: {userRating.rating}/5</p>}
                      <p className="text-sm italic">"{comment.comment}"</p>
                    </div>
                  );
                }) : <p>Nenhum comentário ainda.</p>}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (playingGame && !gameResults) {
    const currentQuestion = playingGame.questions[currentQuestionIndex];
    
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl">
          <CardHeader>
            <CardTitle className="text-slate-800">
              {playingGame.name} - Pergunta {currentQuestionIndex + 1} de {playingGame.questions.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-lg font-medium text-slate-700">
              {currentQuestion.question}
            </div>
            
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
              {currentQuestion.options.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            <Button
              onClick={submitAnswer}
              disabled={!selectedAnswer}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600"
            >
              {currentQuestionIndex < playingGame.questions.length - 1 ? 'Próxima Pergunta' : 'Finalizar Quiz'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameResults) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl">
          <CardHeader>
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-amber-500" />
              Quiz Concluído!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="text-6xl font-bold text-green-600">
                {gameResults.correctAnswers}/{playingGame.questions.length}
              </div>
              <div className="text-lg text-slate-700">
                Você acertou {gameResults.correctAnswers} de {playingGame.questions.length} perguntas
              </div>
              <div className="text-2xl font-semibold text-blue-600">
                +{gameResults.totalPoints} pontos ganhos!
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="text-center text-slate-600">
                Como você avalia este quiz?
              </div>
              
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setQuizRating(rating)}
                    className={`p-2 rounded-xl transition-colors ${
                      quizRating >= rating ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'
                    }`}
                  >
                    <Star className="h-8 w-8 fill-current" />
                  </button>
                ))}
              </div>
              
              <Textarea
                placeholder="Deixe um comentário sobre o quiz (opcional)"
                value={quizComment}
                onChange={(e) => setQuizComment(e.target.value)}
                className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
              />
              
              <Button
                onClick={submitRating}
                disabled={quizRating === 0}
                className="w-full rounded-2xl"
              >
                Enviar Avaliação
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Jogos</h1>
        
        {canManageGames && (
          <Dialog open={isCreatingGame} onOpenChange={setIsCreatingGame}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-[0_4px_12px_rgba(168,85,247,0.4)]">
                <Plus className="h-4 w-4 mr-2" />
                Criar Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl border-0 bg-white/95 backdrop-blur-sm max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Quiz</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Nome do quiz"
                  value={newGame.name}
                  onChange={(e) => setNewGame({...newGame, name: e.target.value})}
                  className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                />
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Duração (dias)</Label>
                    <Input
                      type="number"
                      value={newGame.duration}
                      onChange={(e) => setNewGame({...newGame, duration: parseInt(e.target.value) || 7})}
                      className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                    />
                  </div>
                  <div>
                    <Label>Pts por acerto</Label>
                    <Input
                      type="number"
                      value={newGame.pointsPerCorrect}
                      onChange={(e) => setNewGame({...newGame, pointsPerCorrect: parseInt(e.target.value) || 2})}
                      className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                    />
                  </div>
                  <div>
                    <Label>Pts participação</Label>
                    <Input
                      type="number"
                      value={newGame.pointsPerParticipation}
                      onChange={(e) => setNewGame({...newGame, pointsPerParticipation: parseInt(e.target.value) || 1})}
                      className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label>Perguntas</Label>
                  {newGame.questions.map((question, qIndex) => (
                    <Card key={qIndex} className="p-4 bg-slate-50 rounded-2xl">
                      <div className="space-y-3">
                        <Input
                          placeholder={`Pergunta ${qIndex + 1}`}
                          value={question.question}
                          onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                          className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                        />
                        
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={question.correctOption === oIndex}
                              onChange={() => updateQuestion(qIndex, 'correctOption', oIndex)}
                              className="text-green-500"
                            />
                            <Input
                              placeholder={`Opção ${oIndex + 1}`}
                              value={option}
                              onChange={(e) => updateQuestionOption(qIndex, oIndex, e.target.value)}
                              className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                            />
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                  
                  <Button
                    type="button"
                    onClick={addQuestion}
                    variant="outline"
                    className="w-full rounded-2xl"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Pergunta
                  </Button>
                </div>
                
                <Button 
                  onClick={createGame} 
                  className="w-full rounded-2xl"
                  disabled={!newGame.name.trim() || newGame.questions.some(q => !q.question.trim())}
                >
                  Criar Quiz
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Lista de Jogos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getAvailableGames().map(game => {
          const expiresAt = new Date(new Date(game.createdAt).getTime() + (game.duration * 24 * 60 * 60 * 1000));
          const daysLeft = Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <Card key={game.id} className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl hover:shadow-[inset_0_4px_8px_rgba(0,0,0,0.08)] transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-slate-800 flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-purple-500" />
                  {game.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-slate-600">
                  <div>Tipo: Quiz</div>
                  <div>Perguntas: {game.questions.length}</div>
                  <div>Expira em: {daysLeft} dias</div>
                  <div className="text-blue-600 font-medium">
                    Pontos: {game.pointsPerCorrect}/acerto + {game.pointsPerParticipation} participação
                  </div>
                </div>
                
                {!canManageGames ? (
                  <Button
                    onClick={() => startGame(game)}
                    className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Jogar
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs text-slate-500">
                      Estatísticas: {game.statistics.ratings.length} avaliações
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => startGame(game)}
                        variant="outline"
                        className="flex-1 rounded-2xl"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Testar
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-2xl"
                        onClick={() => {
                          setSelectedGameForStats(game);
                          setShowStatsModal(true);
                        }}
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-2xl text-red-600 hover:bg-red-50"
                        onClick={() => deleteGame(game.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {getAvailableGames().length === 0 && (
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Gamepad2 className="h-16 w-16 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">Nenhum jogo disponível</h3>
            <p className="text-slate-500 text-center">
              {canManageGames 
                ? "Crie o primeiro quiz para começar!" 
                : "Aguarde novos jogos serem criados."}
            </p>
          </CardContent>
        </Card>
      )}

      <GameStatsModal />
    </div>
  );
};

export default GamesPage;