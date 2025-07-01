import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Plus, ThumbsUp, ThumbsDown, Bot, User, Edit, Trash2, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_KEY = "AIzaSyADUR6WT2Zr4Wj01cJh45XQ-T5tmF0KH4c";

const defaultPromptTemplate = `
Você é o Orakle Assist, um assistente de suporte virtual amigável e prestativo da empresa Orakle. Sua principal função é ajudar os colaboradores a tirar dúvidas sobre os processos internos da empresa. Seja sempre cordial, profissional и vá direto ao ponto.

Use exclusivamente a informação fornecida abaixo no campo 'Contexto' para formular sua resposta. Não adicione nenhuma informação que não esteja neste contexto.

Se a informação no 'Contexto' não for suficiente para responder à pergunta do usuário, ou se a pergunta não tiver relação com o contexto, responda de forma educada que você não encontrou a informação e sugira que o usuário procure o supervisor dele para mais detalhes. Nunca invente uma resposta.
`;

interface SupportPageProps {
  user: any;
}

const SupportPage = ({ user }: SupportPageProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState<any[]>([]);
  const [isManaging, setIsManaging] = useState(false);
  const [newKnowledge, setNewKnowledge] = useState({ keywords: '', answer: '' });
  const [editingKnowledge, setEditingKnowledge] = useState<any>(null);
  const [promptTemplate, setPromptTemplate] = useState(defaultPromptTemplate);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedMessages = JSON.parse(localStorage.getItem(`orakle_chat_${user.id}`) || '[]');
    const storedKnowledge = JSON.parse(localStorage.getItem('orakle_knowledge_base') || '[]');
    const storedPrompt = localStorage.getItem('orakle_ai_prompt_template');

    setMessages(storedMessages);
    setKnowledgeBase(storedKnowledge);
    
    if (storedPrompt) {
      setPromptTemplate(storedPrompt);
    } else {
      localStorage.setItem('orakle_ai_prompt_template', defaultPromptTemplate);
    }
  };

  const canManageKnowledge = user.userType === 'supervisor' || user.userType === 'admin';

  const findBestAnswer = (question: string) => {
    const lowerQuestion = question.toLowerCase();
    
    for (const knowledge of knowledgeBase) {
      const keywords = knowledge.keywords.toLowerCase().split(',').map((k: string) => k.trim());
      
      if (keywords.some(keyword => lowerQuestion.includes(keyword))) {
        return knowledge.answer;
      }
    }
    
    return "Desculpe, não encontrei informações sobre sua pergunta. Tente reformular ou entre em contato com seu supervisor para mais detalhes.";
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const question = inputMessage;
    setInputMessage('');

    const context = findBestAnswer(question);

    const fullPrompt = `
      ${promptTemplate}
      ---
      Contexto: "${context}"
      ---
      Pergunta do Usuário: "${question}"
      ---
      Resposta:
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }]
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const aiResponseText = data.candidates[0].content.parts[0].text;
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        canRate: true
      };

      const updatedMessages = [...messages, userMessage, aiMessage];
      setMessages(updatedMessages);
      localStorage.setItem(`orakle_chat_${user.id}`, JSON.stringify(updatedMessages));

    } catch (error) {
      console.error("Erro ao chamar a API do Gemini:", error);
      toast({
        title: "Erro de Conexão",
        description: "Não foi possível conectar ao assistente de IA no momento.",
        variant: "destructive"
      });
      setInputMessage(question);
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    }
  };

  const rateResponse = (messageId: string, helpful: boolean) => {
    const updatedMessages = messages.map(msg => {
      if (msg.id === messageId) {
        return { ...msg, rating: helpful ? 'helpful' : 'not_helpful', canRate: false };
      }
      return msg;
    });
    
    setMessages(updatedMessages);
    localStorage.setItem(`orakle_chat_${user.id}`, JSON.stringify(updatedMessages));
    
    const feedback = JSON.parse(localStorage.getItem('orakle_ai_feedback') || '[]');
    feedback.push({
      id: Date.now().toString(),
      messageId,
      userId: user.id,
      helpful,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('orakle_ai_feedback', JSON.stringify(feedback));
    
    toast({
      title: "Obrigado pelo feedback!",
      description: helpful ? "Marcado como útil" : "Marcado como não útil"
    });
  };

  const addKnowledge = () => {
    if (!newKnowledge.keywords.trim() || !newKnowledge.answer.trim()) return;

    const knowledge = {
      id: Date.now().toString(),
      ...newKnowledge,
      createdAt: new Date().toISOString(),
      createdBy: user.id
    };

    const updatedKnowledge = [...knowledgeBase, knowledge];
    setKnowledgeBase(updatedKnowledge);
    localStorage.setItem('orakle_knowledge_base', JSON.stringify(updatedKnowledge));
    
    setNewKnowledge({ keywords: '', answer: '' });
    
    toast({
      title: "Conhecimento adicionado",
      description: "Nova resposta adicionada à base de conhecimento!"
    });
  };

  const updateKnowledge = () => {
    if (!editingKnowledge) return;

    const updatedKnowledge = knowledgeBase.map(k => 
      k.id === editingKnowledge.id ? editingKnowledge : k
    );
    
    setKnowledgeBase(updatedKnowledge);
    localStorage.setItem('orakle_knowledge_base', JSON.stringify(updatedKnowledge));
    setEditingKnowledge(null);
    
    toast({
      title: "Conhecimento atualizado",
      description: "Resposta atualizada com sucesso!"
    });
  };

  const deleteKnowledge = (knowledgeId: string) => {
    const updatedKnowledge = knowledgeBase.filter(k => k.id !== knowledgeId);
    setKnowledgeBase(updatedKnowledge);
    localStorage.setItem('orakle_knowledge_base', JSON.stringify(updatedKnowledge));
    
    toast({
      title: "Conhecimento removido",
      description: "Resposta removida da base de conhecimento!"
    });
  };
  
  const savePromptTemplate = () => {
    localStorage.setItem('orakle_ai_prompt_template', promptTemplate);
    toast({
      title: "Prompt Salvo!",
      description: "O modelo de prompt da IA foi atualizado com sucesso.",
    });
  };

  if (canManageKnowledge && isManaging) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800">Gerenciar Base de Conhecimento</h1>
          <Button
            onClick={() => setIsManaging(false)}
            variant="outline"
            className="rounded-2xl"
          >
            Voltar ao Chat
          </Button>
        </div>

        {/* Gerenciador de Prompt */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl">
          <CardHeader>
            <CardTitle className="text-slate-800">Configuração do Prompt do Assistente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Defina o comportamento, regras e persona da IA aqui..."
              value={promptTemplate}
              onChange={(e) => setPromptTemplate(e.target.value)}
              className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] min-h-[200px]"
            />
            <Button
              onClick={savePromptTemplate}
              className="w-full rounded-2xl"
            >
              Salvar Prompt
            </Button>
          </CardContent>
        </Card>

        {/* Adicionar Novo Conhecimento */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl">
          <CardHeader>
            <CardTitle className="text-slate-800">Adicionar Nova Resposta (Base de Conhecimento)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-2 block">
                Palavras-chave (separadas por vírgula)
              </label>
              <Input
                placeholder="Ex: férias, solicitar férias, como pedir férias"
                value={newKnowledge.keywords}
                onChange={(e) => setNewKnowledge({...newKnowledge, keywords: e.target.value})}
                className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-2 block">
                Resposta (Contexto para a IA)
              </label>
              <Textarea
                placeholder="Digite a resposta que a IA deve dar quando essas palavras-chave forem mencionadas..."
                value={newKnowledge.answer}
                onChange={(e) => setNewKnowledge({...newKnowledge, answer: e.target.value})}
                className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] min-h-[100px]"
              />
            </div>
            <Button
              onClick={addKnowledge}
              disabled={!newKnowledge.keywords.trim() || !newKnowledge.answer.trim()}
              className="w-full rounded-2xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Resposta
            </Button>
          </CardContent>
        </Card>

        {/* Lista de Conhecimentos */}
        <div className="space-y-4">
          {knowledgeBase.map(knowledge => (
            <Card key={knowledge.id} className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-slate-600 mb-1">Palavras-chave:</div>
                    <div className="text-sm text-slate-800">{knowledge.keywords}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-600 mb-1">Resposta:</div>
                    <div className="text-sm text-slate-800">{knowledge.answer}</div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingKnowledge(knowledge)}
                          className="rounded-xl"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-3xl border-0 bg-white/95 backdrop-blur-sm">
                        <DialogHeader>
                          <DialogTitle>Editar Resposta</DialogTitle>
                        </DialogHeader>
                        {editingKnowledge && (
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-slate-600 mb-2 block">
                                Palavras-chave
                              </label>
                              <Input
                                value={editingKnowledge.keywords}
                                onChange={(e) => setEditingKnowledge({...editingKnowledge, keywords: e.target.value})}
                                className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-600 mb-2 block">
                                Resposta
                              </label>
                              <Textarea
                                value={editingKnowledge.answer}
                                onChange={(e) => setEditingKnowledge({...editingKnowledge, answer: e.target.value})}
                                className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] min-h-[100px]"
                              />
                            </div>
                            <Button onClick={updateKnowledge} className="w-full rounded-2xl">
                              Salvar Alterações
                            </Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteKnowledge(knowledge.id)}
                      className="rounded-xl text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remover
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Suporte AI</h1>
        
        {canManageKnowledge && (
          <div className="flex gap-3">
            <Button
              onClick={() => setIsManaging(true)}
              variant="outline"
              className="rounded-2xl"
            >
              <Edit className="h-4 w-4 mr-2" />
              Gerenciar IA
            </Button>
            <Button
              variant="outline"
              className="rounded-2xl"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Estatísticas
            </Button>
          </div>
        )}
      </div>

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl">
        <CardHeader>
          <CardTitle className="text-slate-800 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            Chat de Suporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Área de Mensagens */}
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {messages.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Bot className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                <p>Olá! Sou o assistente virtual da Orakle.</p>
                <p>Como posso ajudá-lo hoje?</p>
              </div>
            )}
            
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  
                  <div className={`p-4 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                    <div className="text-xs mt-2 opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    
                    {message.sender === 'ai' && message.canRate && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => rateResponse(message.id, true)}
                          className="flex items-center gap-1 text-xs hover:bg-green-100 hover:text-green-700 px-2 py-1 rounded-lg transition-colors"
                        >
                          <ThumbsUp className="h-3 w-3" />
                          Útil
                        </button>
                        <button
                          onClick={() => rateResponse(message.id, false)}
                          className="flex items-center gap-1 text-xs hover:bg-red-100 hover:text-red-700 px-2 py-1 rounded-lg transition-colors"
                        >
                          <ThumbsDown className="h-3 w-3" />
                          Não útil
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input de Mensagem */}
          <div className="flex gap-3">
            <Input
              placeholder="Digite sua pergunta..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
            />
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim()}
              className="rounded-2xl px-6"
            >
              Enviar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportPage;
