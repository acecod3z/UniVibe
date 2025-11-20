"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Users, Lock } from "lucide-react";

const slides = [
  {
    id: 1,
    icon: Users,
    title: "Campus Life, Online",
    description: "Connect with students from your university. No outsiders, just us.",
    color: "text-teal-500",
  },
  {
    id: 2,
    icon: ShieldCheck,
    title: "Verified Students Only",
    description: "We verify every user to ensure a safe and authentic community.",
    color: "text-violet-500",
  },
  {
    id: 3,
    icon: Lock,
    title: "Private & Secure",
    description: "Your data stays on campus. Control who sees what.",
    color: "text-amber-500",
  },
];

const SlideIcon = ({ icon: Icon, color }: { icon: any, color: string }) => (
  <div className={`w-32 h-32 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 ${color}`}>
    <Icon className="w-16 h-16" />
  </div>
);

export default function WelcomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      <header className="p-6 flex justify-center">
        <Logo />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-10">
        <div className="w-full max-w-md relative h-80 mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col items-center text-center"
            >
              <SlideIcon icon={slides[currentSlide].icon} color={slides[currentSlide].color} />
              <h1 className="text-3xl font-heading font-bold mb-3 text-slate-900 dark:text-white">
                {slides[currentSlide].title}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex gap-2 mb-10">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? "w-8 bg-violet-500" : "w-2 bg-slate-200 dark:bg-slate-700"
                }`}
            />
          ))}
        </div>

        <div className="w-full max-w-md space-y-4">
          {currentSlide < slides.length - 1 ? (
            <Button onClick={nextSlide} size="lg" className="w-full rounded-xl">
              Next
            </Button>
          ) : (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Link href="/login" className="block">
                <Button size="lg" className="w-full rounded-xl">
                  Get Started
                </Button>
              </Link>
              <p className="text-center text-xs text-slate-400">
                By joining, you agree to our Student Terms & Privacy Policy.
              </p>
            </div>
          )}

          {currentSlide < slides.length - 1 && (
            <Button variant="ghost" onClick={() => setCurrentSlide(slides.length - 1)} className="w-full">
              Skip
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
