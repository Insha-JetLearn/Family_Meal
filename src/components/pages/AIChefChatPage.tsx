import React, { useEffect, useRef, useState } from 'react';
import {
  Send,
  Sparkles,
  RefreshCw,
  Trash2,
  ChefHat,
  ShieldCheck,
  AlertCircle,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const STARTER_QUESTIONS = [
  'What can I cook with the ingredients in my pantry?',
  'Suggest a European bistro dinner for my family.',
  'How can I replace dairy in creamy risotto?',
  'Create a quick 20-minute meal using items expiring soon.',
  'What French or Italian sauces are kid-friendly?',
];

export const AIChefChatPage: React.FC = () => {
  const {
    familyProfile,
    pantryItems,
    weeklyPlan,
    chatMessages,
    addChatMessage,
    clearChatHistory,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [lastFailedMsg, setLastFailedMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const message = (textToSend || inputMessage).trim();
    if (!message || isLoading) return;

    setInputMessage('');
    setChatError(null);
    setLastFailedMsg(null);

    // Add user message to state
    addChatMessage({
      sender: 'user',
      text: message,
    });

    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: chatMessages.slice(-6),
          familyProfile,
          pantryItems,
          currentMealPlanSummary: weeklyPlan.summary,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'The Chef is momentarily unavailable.');
      }

      addChatMessage({
        sender: 'assistant',
        text: data.reply,
        suggestedActions: [
          'What European wine or side dish pairs with this?',
          'How should leftovers be stored?',
          'Can we adapt this for a Dutch oven?',
        ],
      });
    } catch (err: any) {
      setChatError(err.message || 'Failed to send message. Please try again.');
      setLastFailedMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedMsg) {
      handleSendMessage(lastFailedMsg);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              Chef Remy AI Companion
            </h1>
            <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 text-xs font-bold px-2.5 py-0.5 rounded-full font-sans-clean">
              Pantry-Aware
            </span>
          </div>
          <p className="text-stone-400 text-xs sm:text-sm mt-1 font-serif">
            Your personal European culinary assistant with full awareness of your family members, pantry stock, and dietary restrictions.
          </p>
        </div>

        <button
          onClick={clearChatHistory}
          className="flex items-center space-x-1 px-3 py-1.5 text-stone-400 hover:text-white text-xs font-semibold hover:bg-white/5 rounded-lg transition-colors self-start sm:self-auto border border-white/5"
        >
          <Trash2 className="w-4 h-4" />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Context Badge: Active Protections */}
      <div className="bg-[#141724] border border-white/5 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-stone-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            <strong>Active Safety Filter:</strong>{' '}
            {familyProfile.allergies.length > 0
              ? `Strict exclusion of ${familyProfile.allergies.join(', ')}`
              : 'Zero allergen restrictions'}
          </span>
        </div>
        <div className="text-stone-400 font-serif">
          Tracking {pantryItems.length} ingredients • {familyProfile.servings} family servings
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-[#141724] rounded-3xl border border-white/5 shadow-xl flex flex-col h-[600px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {chatMessages.map(msg => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                    isUser
                      ? 'bg-[#252c40] text-white border border-white/10'
                      : 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-orange-500/20'
                  }`}
                >
                  {isUser ? <span className="font-bold text-xs">You</span> : <ChefHat className="w-5 h-5" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'gradient-bistro-tab text-white rounded-tr-none font-medium'
                      : 'bg-[#1b2030] text-stone-200 border border-white/5 rounded-tl-none space-y-2 font-serif'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <div
                    className={`text-[10px] mt-1 text-right font-sans-clean ${
                      isUser ? 'text-white/80' : 'text-stone-500'
                    }`}
                  >
                    {msg.timestamp}
                  </div>

                  {/* Suggested actions chips */}
                  {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="pt-2 border-t border-white/10 flex flex-wrap gap-1.5 font-sans-clean">
                      {msg.suggestedActions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(action)}
                          className="bg-[#141724] hover:bg-orange-500 hover:text-white border border-white/10 text-stone-300 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center space-x-1"
                        >
                          <span>{action}</span>
                          <ArrowRight className="w-3 h-3 text-stone-400" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shrink-0">
                <ChefHat className="w-5 h-5" />
              </div>
              <div className="bg-[#1b2030] border border-white/5 rounded-2xl rounded-tl-none p-4 flex items-center space-x-2 text-stone-400 text-xs font-serif">
                <RefreshCw className="w-4 h-4 text-orange-400 animate-spin" />
                <span>Chef Remy is pondering European recipes and pantry stock...</span>
              </div>
            </div>
          )}

          {/* Error & Retry Banner */}
          {chatError && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-2xl text-xs text-rose-300 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{chatError}</span>
              </div>
              <button
                onClick={handleRetry}
                className="px-2.5 py-1 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-500 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Starter Questions */}
        <div className="px-5 py-2.5 bg-[#10131d] border-t border-white/5 overflow-x-auto flex items-center space-x-2">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider shrink-0 flex items-center font-sans-clean">
            <Lightbulb className="w-3 h-3 mr-1 text-amber-400" />
            Try:
          </span>
          {STARTER_QUESTIONS.map(q => (
            <button
              key={q}
              onClick={() => handleSendMessage(q)}
              className="text-[11px] font-semibold text-stone-300 hover:text-white hover:bg-white/10 bg-[#1b2030] border border-white/5 px-2.5 py-1 rounded-lg shrink-0 transition-colors font-serif"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#141724] border-t border-white/5">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder="Ask Chef Remy about pantry recipes, technique, substitutions, or meal prep..."
              className="flex-1 px-4 py-3 rounded-2xl bg-[#1b2030] border border-white/10 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-3 gradient-bistro-btn disabled:opacity-40 text-white rounded-2xl transition-all shadow-md shadow-orange-500/20 cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
