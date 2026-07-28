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
          text: `Hello ${userName}! 👋 Welcome to Savorlicious Food Services. I am your SFS Assistant. How can I help you manage your livestock bookings, track order deliveries, or answer farm questions today?`,
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

  // Handle external window trigger to open chat widget
  useEffect(() => {
    const handleExternalOpen = () => {
      setIsOpen(true);
      setHasNewMessage(false);
    };
    window.addEventListener("open-chat", handleExternalOpen);
    return () => window.removeEventListener("open-chat", handleExternalOpen);
  }, []);

  // 45-second Inactivity Auto-Collapse Timer
  useEffect(() => {
    if (!isOpen) return;

    let inactivityTimer: NodeJS.Timeout;

    const resetInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        setIsOpen(false);
        setHasNewMessage(true); // show notification dot when auto-collapsed
      }, 45000); // 45 seconds
    };

    // Initial trigger
    resetInactivityTimer();

    // Listen to user interactions inside the window
    window.addEventListener("mousemove", resetInactivityTimer);
    window.addEventListener("keydown", resetInactivityTimer);
    window.addEventListener("scroll", resetInactivityTimer, true);
    window.addEventListener("click", resetInactivityTimer);

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      window.removeEventListener("mousemove", resetInactivityTimer);
      window.removeEventListener("keydown", resetInactivityTimer);
      window.removeEventListener("scroll", resetInactivityTimer, true);
      window.removeEventListener("click", resetInactivityTimer);
    };
  }, [isOpen]);

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
    }, 1000);
  };

  const generateBotResponse = (userText: string): string => {
    const text = userText.toLowerCase();

    // 1. Browse Piglets / Livestock inquiries
    if (text.includes("browse piglets") || text.includes("piglets") || text.includes("livestock")) {
      return `We raise top-tier Landrace, Duroc, and Large White crossbreeds under strict biosecurity.\n\n• **Regular Weanling Piglets**: ₱3,500/head\n• **Sowlets (Young Females)**: ₱6,500/head\n• **Boarlets (Young Males)**: ₱5,000/head\n• **Fattening Hogs (85-100kg Live Weight)**: ₱200/kilo\n\nYou can submit a booking reservation immediately using the dashboard form.`;
    }

    // 2. Delivery Information & Area inquiries
    if (text.includes("delivery information") || text.includes("delivery") || text.includes("shipping")) {
      return `Our farm manages deliveries via specialized bio-secured transit vehicles:\n\n• **Areas Covered**: Central Luzon (Nueva Ecija, Bulacan, Tarlac, and Pampanga).\n• **Meat Shipments**: Packaged in vacuum-sealed chilled coolers to guarantee absolute freshness.`;
    }

    // 3. Context-Aware: Check User Reservations
    if (text.includes("reservation") || text.includes("booking") || text.includes("res-") || text.includes("status")) {
      const customerReservations = reservations.filter(
        (r) => r.customerEmail.toLowerCase() === userEmail.toLowerCase()
      );

      if (customerReservations.length > 0) {
        let response = `I located **${customerReservations.length} reservation(s)** registered to **${userEmail}**:\n\n`;
        customerReservations.forEach((r) => {
          response += `• **${r.id}** (${r.category}) — **${r.quantity} head(s)**\n`;
          response += `  Pickup: \`${r.pickupDate}\` | Status: **${r.status}**\n\n`;
        });
        response += `Click on any card on your dashboard to see details and countdown timers.`;
        return response;
      } else {
        return `I checked our database but couldn't locate any active reservations under **${userEmail}**. Click **"New Reservation"** at the top of your dashboard to log a booking.`;
      }
    }

    // 4. Context-Aware: Check User Orders
    if (text.includes("order") || text.includes("purchase") || text.includes("ord-") || text.includes("track")) {
      const customerOrders = orders.filter(
        (o) => o.customerEmail.toLowerCase() === userEmail.toLowerCase()
      );

      if (customerOrders.length > 0) {
        let response = `Here are your orders linked to your profile:\n\n`;
        customerOrders.forEach((o) => {
          response += `• **${o.id}** — Total: ₱${o.totalAmount.toLocaleString()}\n`;
          response += `  Product: *${o.product}*\n`;
          response += `  Date: \`${o.dateCreated}\` | Status: **${o.status}** | Payment: **${o.paymentStatus}**\n\n`;
        });
        response += `You can track the active status of each order in the Order Dispatch timeline widget!`;
        return response;
      } else {
        return `I checked our dispatch schedules but couldn't find any recent orders linked to **${userEmail}**. Send items to our hotline to place an order: **09464544973**.`;
      }
    }

    // 5. Knowledge Base: Match FAQs
    for (const faq of chatbotFaqs) {
      const questionKeywords = faq.q.toLowerCase().split(" ");
      const matchCount = questionKeywords.filter((kw) => kw.length > 3 && text.includes(kw)).length;
      if (matchCount >= 2 || text.includes(faq.q.toLowerCase())) {
        return faq.a;
      }
    }

    // 6. Basic greetings
    if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
      return `Hello! How can I assist you with Savorlicious Food Services, orders, or bookings today?`;
    }

    if (text.includes("price") || text.includes("cost") || text.includes("how much")) {
      return `Our standard price guides:\n\n• **Weanling Piglets**:\n  - Regular: ₱3,500/head\n  - Sowlet: ₱6,500/head\n  - Boarlet: ₱5,000/head\n• **Fattening Hogs (85-100kg Live Weight)**: ₱200/kilo\n• **Crispy Lechon**: From ₱6,500 (15kg) to ₱14,500 (55kg)\n• **Catering Buffets**: Set A (₱250/pax), Set B (₱290/pax), Set C (₱340/pax)\n• **Sweets Packages**: Set A (₱3,650), Set B (₱5,500), Set C (₱7,500)\n\nYou can book any of these directly via the booking form in your portal!`;
    }

    // Fallback using the customized guidelines context
    return `Thank you! As the Delmar Farm Assistant, I am here to help you manage bookings, trace dispatches, and answer inquiries.\n\nCurrently, I am guided by:\n*"${chatbotGuidelines}"*\n\nLet me know if you would like me to lookup your reservations or active orders!`;
  };

  const quickPrompts = [
    { text: "Track My Order", icon: FileText },
    { text: "Browse Piglets", icon: Sparkles },
    { text: "Reservation Status", icon: Calendar },
    { text: "Delivery Information", icon: Bot },
  ];

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={handleOpenToggle}
        className={`fixed bottom-6 right-6 p-4 rounded-full text-white shadow-2xl transition-all duration-300 z-50 flex items-center justify-center cursor-pointer active:scale-95 group ${
          isOpen
            ? "bg-rose-600 hover:bg-rose-700 hover:rotate-90"
            : "bg-[#1B4332] hover:bg-[#2D6A4F] text-[#D4AF37] border border-emerald-700/20"
        }`}
        aria-label="Toggle AI Support Assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="w-6 h-6 animate-pulse text-[#D4AF37]" />
            {hasNewMessage && (
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-[#D4AF37] border border-white rounded-full flex items-center justify-center animate-ping" />
            )}
            {!hasNewMessage && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white" />
            )}
          </div>
        )}
      </button>

      {/* Premium Glassmorphic Chat Window */}
      <div
        className={`fixed bottom-24 right-6 w-[360px] sm:w-[385px] h-[540px] bg-[#0D2F22]/95 backdrop-blur-lg border border-emerald-800/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 z-50 transform origin-bottom-right ${
          isOpen
            ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
            : "translate-y-8 opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-[#0B3D2E]/80 border-b border-emerald-800/35 text-white p-4.5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-950/50 rounded-xl relative border border-emerald-800/30">
              <Bot className="w-5 h-5 text-[#D4AF37]" />
              <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-emerald-900 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold tracking-wider font-sans text-[#D4AF37] uppercase">Delmar Farm Assistant</h3>
              <p className="text-[8.5px] font-bold text-emerald-300/80 uppercase tracking-widest">Active bio-secure support</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message body */}
        <div className="flex-grow p-4.5 overflow-y-auto space-y-4 scrollbar-none bg-[#092017]/60">
          {messages.map((msg) => {
            const isBot = msg.sender === "bot";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  isBot ? "self-start" : "ml-auto flex-row-reverse"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7.5 h-7.5 rounded-xl shrink-0 flex items-center justify-center border ${
                    isBot
                      ? "bg-emerald-950/80 border-emerald-800/40 text-[#D4AF37]"
                      : "bg-[#D4AF37] border-[#D4AF37] text-emerald-950"
                  }`}
                >
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4 font-bold" />}
                </div>

                {/* Bubble */}
                <div className="space-y-1">
                  <div
                    className={`p-3.5 rounded-2xl text-[11px] leading-relaxed shadow-sm font-sans font-medium whitespace-pre-line ${
                      isBot
                        ? "bg-white/10 text-emerald-100 rounded-tl-none border border-emerald-850/40"
                        : "bg-[#2D6A4F] text-white rounded-tr-none border border-emerald-600/20"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[7.5px] text-emerald-450 font-bold block px-1 text-right">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-[85%] self-start">
              <div className="w-7.5 h-7.5 rounded-xl shrink-0 flex items-center justify-center bg-emerald-950/80 border border-emerald-800/40 text-[#D4AF37]">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 bg-white/10 border border-emerald-850/40 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-75" />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-150" />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-300" />
              </div>
            </div>
          )}

          {/* Suggested FAQ Prompt Chips */}
          {messages.length === 1 && !isTyping && (
            <div className="pt-2 space-y-2.5 max-w-[90%]">
              <p className="text-[9px] text-[#D4AF37] font-bold uppercase tracking-wider block px-1">How can I assist you?</p>
              <div className="flex flex-col gap-2">
                {quickPrompts.map((prompt, idx) => {
                  const PromptIcon = prompt.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt.text)}
                      className="w-full text-left text-[11px] font-bold text-emerald-100 bg-white/5 hover:bg-white/10 border border-emerald-800/30 px-3.5 py-3 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <PromptIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                        {prompt.text}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
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
          className="p-3.5 bg-[#0B3D2E]/80 border-t border-emerald-800/35 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            placeholder="Type your support request..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isTyping}
            className="flex-grow text-xs px-3.5 py-2.5 rounded-xl border border-emerald-850/40 bg-white/5 text-white placeholder-emerald-300/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 font-medium"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="p-2.5 bg-[#D4AF37] hover:bg-[#c29d2f] disabled:opacity-40 text-emerald-950 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-md"
          >
            <Send className="w-4 h-4 font-bold" />
          </button>
        </form>
      </div>
    </>
  );
};
