"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRole } from "@/context/RoleContext";
import { MessageSquare, X, Send, Bot, Sparkles, User, Calendar, FileText, ArrowRight } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

export const AIChatWidget: React.FC = () => {
  const { userName, userEmail, reservations, orders, chatbotGuidelines, chatbotFaqs } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with a welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          sender: "bot",
          text: `Hello ${userName}! 👋 Welcome to Delmar Piggery Farm support. I am your AI Assistant. How can I help you manage your livestock bookings, orders, or farm inquiries today?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [userName, messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Alert user of new support messages if widget is closed
  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      setHasNewMessage(true);
    }
  }, [messages.length, isOpen]);

  const handleOpenToggle = () => {
    setIsOpen(!isOpen);
    setHasNewMessage(false);
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI support thinking response
    setTimeout(() => {
      const responseText = generateBotResponse(text);
      const botMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: "bot",
        text: responseText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const generateBotResponse = (userText: string): string => {
    const text = userText.toLowerCase();

    // 1. Context-Aware: Check User Reservations
    if (text.includes("reservation") || text.includes("booking") || text.includes("res-")) {
      const customerReservations = reservations.filter(
        (r) => r.customerEmail.toLowerCase() === userEmail.toLowerCase()
      );

      if (customerReservations.length > 0) {
        let response = `I found **${customerReservations.length} reservation(s)** under your email (**${userEmail}**):\n\n`;
        customerReservations.forEach((r) => {
          response += `• **${r.id}** (${r.category}) — **${r.quantity} head(s)**\n`;
          response += `  Pickup: \`${r.pickupDate}\` | Status: **${r.status}**\n\n`;
        });
        response += `Is there anything specific you would like to adjust about these bookings?`;
        return response;
      } else {
        return `I checked our booking schedules but couldn't find any reservations under your email (**${userEmail}**). If you would like to book Duroc piglets, fattening pigs, or a crispy lechon catering package, simply click **"+ New Reservation"** at the top of your dashboard!`;
      }
    }

    // 2. Context-Aware: Check User Orders
    if (text.includes("order") || text.includes("purchase") || text.includes("ord-")) {
      const customerOrders = orders.filter(
        (o) => o.customerEmail.toLowerCase() === userEmail.toLowerCase()
      );

      if (customerOrders.length > 0) {
        let response = `Here are your recent orders linked to your profile:\n\n`;
        customerOrders.forEach((o) => {
          response += `• **${o.id}** — Total: ₱${o.totalAmount.toLocaleString()}\n`;
          response += `  Items: *${o.items}*\n`;
          response += `  Date: \`${o.orderDate}\` | Status: **${o.status}** | Payment: **${o.paymentStatus}**\n\n`;
        });
        return response;
      } else {
        return `I checked our dispatch history but found no recent pork meat orders under your account. To place a custom meat delivery order, please send a list of items to our hotline: **+63 912 345 6789**, or update your profile context.`;
      }
    }

    // 3. Knowledge Base: Match FAQs
    for (const faq of chatbotFaqs) {
      const questionKeywords = faq.q.toLowerCase().split(" ");
      // Check if user text contains significant keywords from the FAQ question
      const matchCount = questionKeywords.filter((kw) => kw.length > 3 && text.includes(kw)).length;
      if (matchCount >= 2 || text.includes(faq.q.toLowerCase())) {
        return faq.a;
      }
    }

    // 4. Default Assistant Fallback guided by Guidelines
    if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
      return `Hello! How can I help you with Delmar Piggery Farm products, orders, or reservation services today?`;
    }

    if (text.includes("price") || text.includes("cost") || text.includes("how much")) {
      return `Here is our current standard price catalog:\n\n• **Duroc Weanling Piglets**: ₱3,500/head\n• **Fattening Pigs**: ₱12,000/head\n• **Regular Crispy Lechon**: Starting at ₱8,500/set\n• **Catering Packages**: Starting at ₱12,000\n\nYou can book any of these directly via the booking form in your portal!`;
    }

    // Fallback using the customized guidelines context
    return `Thank you for your message! As the Delmar Farm Assistant, I want to make sure I answer correctly. \n\nCurrently, I am programmed to:\n*"${chatbotGuidelines}"*\n\nFeel free to ask me to check your orders, verify reservation statuses, or inquire about our premium livestock!`;
  };

  const quickPrompts = [
    { text: "Check my reservation status", icon: Calendar },
    { text: "Show my order dispatch details", icon: FileText },
    { text: "What are your delivery areas?", icon: Bot },
    { text: "What is your return policy?", icon: Sparkles },
  ];

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={handleOpenToggle}
        className={`fixed bottom-6 right-6 p-4 rounded-full text-white shadow-2xl transition-all duration-300 z-50 flex items-center justify-center cursor-pointer active:scale-95 group ${
          isOpen
            ? "bg-red-600 hover:bg-red-700 hover:rotate-90"
            : "bg-primary-600 hover:bg-primary-700"
        }`}
        aria-label="Toggle AI Support Assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6 animate-pulse" />
            {hasNewMessage && (
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-accent-light border-2 border-white rounded-full flex items-center justify-center animate-ping" />
            )}
            {!hasNewMessage && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white" />
            )}
          </div>
        )}
      </button>

      {/* Chat window panel */}
      <div
        className={`fixed bottom-24 right-6 w-[360px] sm:w-[380px] h-[520px] bg-white/98 backdrop-blur-md border border-slate-200/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 z-50 transform origin-bottom-right ${
          isOpen
            ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
            : "translate-y-8 opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-900 to-primary-750 text-white p-4.5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl relative">
              <Bot className="w-5 h-5 text-accent-light" />
              <span className="absolute bottom-1 right-1 w-2 h-2 bg-emerald-400 rounded-full border border-primary-900 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold font-heading tracking-wide">DELMAR SUPPORT AI</h3>
              <p className="text-[9px] font-bold text-accent-light uppercase tracking-wider">Online Support Assistant</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/15 rounded-lg transition-colors cursor-pointer text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message body */}
        <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isBot = msg.sender === "bot";
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${
                  isBot ? "self-start" : "ml-auto flex-row-reverse"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center border ${
                    isBot
                      ? "bg-primary-50 border-primary-100 text-primary-750"
                      : "bg-accent-light border-accent-light text-white"
                  }`}
                >
                  {isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>

                {/* Bubble */}
                <div className="space-y-1">
                  <div
                    className={`p-3 rounded-2xl text-[11.5px] leading-relaxed shadow-sm font-sans font-medium ${
                      isBot
                        ? "bg-white text-slate-800 rounded-tl-none border border-slate-100 whitespace-pre-line"
                        : "bg-primary-600 text-white rounded-tr-none font-semibold"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[8px] text-slate-400 font-bold block px-1 text-right">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-2.5 max-w-[85%] self-start">
              <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center bg-primary-50 border border-primary-100 text-primary-750">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="p-3 bg-white border border-slate-100 rounded-2xl rounded-tl-none flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-300" />
              </div>
            </div>
          )}

          {/* Suggested FAQ Prompt Chips */}
          {messages.length === 1 && !isTyping && (
            <div className="pt-2 space-y-2 max-w-[90%]">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block px-1">Suggested inquiries:</p>
              <div className="flex flex-col gap-2">
                {quickPrompts.map((prompt, idx) => {
                  const PromptIcon = prompt.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt.text)}
                      className="w-full text-left text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200/80 px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <PromptIcon className="w-3.5 h-3.5 text-primary-600" />
                        {prompt.text}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-350 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="p-3.5 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            placeholder="Type your question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isTyping}
            className="flex-grow text-xs px-3.5 py-2.5 rounded-xl border border-slate-250 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="p-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );
};
