import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Plus, ThumbsUp, ThumbsDown, Bot, User, Edit, Trash2, BarChart3, Star, BrainCircuit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_KEY = "AIzaSyADUR6WT2Zr4Wj01cJh45XQ-T5tmF0KH4c";

const defaultPromptTemplate = `
Você é o Orakle Assist, um assistente de suporte virtual amigável e prestativo da empresa Orakle. Sua principal função é ajudar os colaboradores a tirar dúvidas sobre os processos internos da empresa. Seja sempre cordial, profissional e vá direto ao ponto.

Use exclusivamente a informação fornecida abaixo no campo 'Contexto' para formular sua resposta. Não adicione nenhuma informação que não esteja neste contexto.

Se a informação no 'Contexto' não for suficiente para responder à pergunta do usuário, ou se a pergunta não tiver relação com o contexto, responda de forma educada que você não encontrou a informação e sugira que o usuário procure o supervisor dele para mais detalhes. Nunca invente uma resposta.
`;

interface SupportPageProps {
  user: any;
}

const dotProduct = (vecA: number[], vecB: number[]) => {
  let product = 0;
  for (let i = 0; i < vecA.length; i++) {
    product += vecA[i] * vecB[i];
  }
  return product;
};

const SupportPage = ({ user }: SupportPageProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState<any[]>([]);
  const [isManaging, setIsManaging] = useState(false);
  const [newKnowledge, setNewKnowledge] = useState({ title: '', content: '' });
  const [promptTemplate, setPromptTemplate] = useState(defaultPromptTemplate);
  const { toast } = useToast();
  const [isIndexing, setIsIndexing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedMessages = JSON.parse(localStorage.getItem(`orakle_chat_${user.id}`) || '[]');
    const storedKnowledge = JSON.parse(localStorage.getItem('orakle_knowledge_base_v5') || '[]');
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

  const getEmbedding = async (text: string) => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: "models/text-embedding-004", content: { parts: [{ text }] } }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || "Falha ao gerar embedding.");
    }
    const data = await response.json();
    return data.embedding.values;
  };

  const findMostRelevantContext = async (question: string) => {
    if (knowledgeBase.length === 0) return "Base de conhecimento está vazia.";
  
    try {
      const questionEmbedding = await getEmbedding(question);
  
      const rankedDocs = knowledgeBase
        .filter(doc => doc.embedding) // Apenas documentos que foram indexados
        .map(doc => {
          const score = dotProduct(questionEmbedding, doc.embedding);
          return { ...doc, score };
        })
        .sort((a, b) => b.score - a.score);
  
      if (rankedDocs.length === 0 || rankedDocs[0].score < 0.7) {
        return "Não encontrei informações sobre sua pergunta na base de conhecimento.";
      }
      
      return rankedDocs[0].content;
      
    } catch (error: any) {
      toast({ title: "Erro na Busca Semântica", description: error.message, variant: "destructive" });
      return "Ocorreu um erro ao tentar encontrar a resposta. Tente novamente.";
    }
  };
  
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { id: Date.now().toString(), text: inputMessage, sender: 'user', timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    const question = inputMessage;
    setInputMessage('');

    const context = await findMostRelevantContext(question);

    const fullPrompt = `${promptTemplate}\n\n---Contexto: "${context}"\n\n---Pergunta do Usuário: "${question}"\n\n---Resposta:`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data?.error?.message || `API request failed with status ${response.status}`);
      
      const aiResponseText = data.candidates[0].content.parts[0].text;
      const aiMessage = { id: (Date.now() + 1).toString(), text: aiResponseText, sender: 'ai', timestamp: new Date().toISOString(), canRate: true };

      setMessages(prev => [...prev, aiMessage]);
      localStorage.setItem(`orakle_chat_${user.id}`, JSON.stringify([...messages, userMessage, aiMessage]));
    } catch (error: any) {
      console.error("Erro detalhado ao chamar a API do Gemini:", error);
      toast({ title: "Erro de Conexão com a IA", description: `Detalhe: ${error.message}`, variant: "destructive" });
      setInputMessage(question);
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    }
  };

  const addKnowledge = () => {
    if (!newKnowledge.title.trim() || !newKnowledge.content.trim()) return;
    const knowledge = { id: Date.now().toString(), ...newKnowledge, createdAt: new Date().toISOString(), createdBy: user.id, embedding: null };
    const updatedKnowledge = [...knowledgeBase, knowledge];
    setKnowledgeBase(updatedKnowledge);
    localStorage.setItem('orakle_knowledge_base_v5', JSON.stringify(updatedKnowledge));
    setNewKnowledge({ title: '', content: '' });
    toast({ title: "Conhecimento adicionado", description: "Lembre-se de re-indexar a base para que a IA aprenda sobre este novo item." });
  };
  
  const deleteKnowledge = (knowledgeId: string) => {
    const updatedKnowledge = knowledgeBase.filter(k => k.id !== knowledgeId);
    setKnowledgeBase(updatedKnowledge);
    localStorage.setItem('orakle_knowledge_base_v5', JSON.stringify(updatedKnowledge));
    toast({ title: "Conhecimento removido", description: "Lembre-se de re-indexar a base." });
  };
  
  const indexKnowledgeBase = async () => {
    setIsIndexing(true);
    toast({ title: "Iniciando indexação...", description: "A IA está aprendendo os conteúdos. Isso pode levar um momento." });
    
    try {
      const updatedKnowledgeBase = await Promise.all(
        knowledgeBase.map(async (doc) => {
          const textToEmbed = `${doc.title}\n${doc.content}`;
          const embedding = await getEmbedding(textToEmbed);
          return { ...doc, embedding };
        })
      );
      setKnowledgeBase(updatedKnowledgeBase);
      localStorage.setItem('orakle_knowledge_base_v5', JSON.stringify(updatedKnowledgeBase));
      toast({ title: "Indexação Concluída!", description: "A IA aprendeu os novos conteúdos com sucesso." });
    } catch (error: any) {
      toast({ title: "Erro de Indexação", description: error.message, variant: "destructive" });
    } finally {
      setIsIndexing(false);
    }
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
          <Button onClick={() => setIsManaging(false)} variant="outline" className="rounded-2xl">Voltar ao Chat</Button>
        </div>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl">
          <CardHeader>
            <CardTitle className="text-slate-800">Configuração do Prompt do Assistente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea placeholder="Defina o comportamento, regras e persona da IA aqui..." value={promptTemplate} onChange={(e) => setPromptTemplate(e.target.value)} className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] min-h-[200px]" />
            <Button onClick={savePromptTemplate} className="w-full rounded-2xl">Salvar Prompt</Button>
          </CardContent>
        </Card>
        
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl">
          <CardHeader>
            <CardTitle className="text-slate-800">Base de Conhecimento</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={indexKnowledgeBase} disabled={isIndexing} className="w-full rounded-2xl mb-4">
              <BrainCircuit className="h-4 w-4 mr-2" />
              {isIndexing ? 'Indexando...' : 'Indexar Base de Conhecimento'}
            </Button>
            <div className="space-y-4">
              <Input placeholder="Título do Conhecimento" value={newKnowledge.title} onChange={(e) => setNewKnowledge({...newKnowledge, title: e.target.value})} className="rounded-2xl" />
              <Textarea placeholder="Conteúdo (informação para a IA)" value={newKnowledge.content} onChange={(e) => setNewKnowledge({...newKnowledge, content: e.target.value})} className="rounded-2xl min-h-[100px]" />
              <Button onClick={addKnowledge} disabled={!newKnowledge.title.trim() || !newKnowledge.content.trim()} className="w-full rounded-2xl"><Plus className="h-4 w-4 mr-2" /> Adicionar</Button>
            </div>
            <div className="mt-6 space-y-2">
              {knowledgeBase.map(doc => (
                <div key={doc.id} className="p-3 rounded-xl border">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{doc.title}</span>
                    <Button size="sm" variant="ghost" onClick={() => deleteKnowledge(doc.id)}><Trash2 className="h-4 w-4"/></Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{doc.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">Suporte AI</h1>
        {canManageKnowledge && <Button onClick={() => setIsManaging(true)} variant="outline" className="rounded-2xl"><Edit className="h-4 w-4 mr-2" />Gerenciar IA</Button>}
      </div>
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] rounded-3xl">
        <CardHeader><CardTitle className="text-slate-800 flex items-center gap-2"><MessageCircle className="h-5 w-5 text-blue-500" />Chat de Suporte</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto p-2">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-slate-500"><Bot className="h-12 w-12 mx-auto mb-4 text-blue-400" /><p>Olá! Como posso ajudá-lo hoje?</p></div>
            ) : messages.map(message => (
              <div key={message.id} className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`p-4 rounded-2xl ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-800'}`}>
                  <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Input placeholder="Digite sua pergunta..." value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} className="rounded-2xl border-0 bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]" />
            <Button onClick={sendMessage} disabled={!inputMessage.trim()} className="rounded-2xl px-6">Enviar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportPage;
