import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, ChevronDown } from "lucide-react";

export default function FAQ() {
  const faqs = [
    {
      question: "How do I download my Hall Ticket or Admit Card?",
      answer: "Click on 'Verify Hall Ticket' or navigate to the 'Downloads' section. Input your Application Reference Number or Student Registration ID to generate your card. You can also print this card directly from your dashboard after logging in.",
    },
    {
      question: "What happens if my internet connection disconnects during a live exam?",
      answer: "EduTrack has a robust Auto Save system. The portal continues saving answers locally to your browser cache. Once your connection stabilizes, it syncs with the central server automatically. If your connection is down for more than 5 minutes, notify your invigilator or contact support immediately.",
    },
    {
      question: "Can I take the exam from a tablet or a mobile phone?",
      answer: "Mobile phones are not supported for academic term or recruitment exams due to restricted screen sizing and the secure browser isolation environment. Laptops and desktop computers with Windows or macOS operating systems and functional web cameras are mandatory.",
    },
    {
      question: "What actions are considered violations and will flag my exam session?",
      answer: "Prohibited actions include: switching tabs or windows, opening additional software panels, dual-monitor connections, copy-pasting shortcuts, leaving the camera focus boundary, or multiple people appearing in the frame. These trigger real-time warnings to your invigilator.",
    },
    {
      question: "Who should I contact if my login credentials do not load or work?",
      answer: "Verify that you have selected the correct portal role (e.g. Student, Applicant, Teacher, Candidate) in the login select list. If credentials continue to fail, contact the Examination Cell directly via the emergency helpline number or email listed below.",
    },
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-white border-b border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <Badge className="bg-blue-50 text-blue-700 border-blue-100 px-3 py-1 font-semibold text-xs rounded-full">
            INFORMATION ARCHIVE
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-base md:text-lg">
            Review detailed solutions for common candidate concerns regarding the examination ecosystem.
          </p>
        </div>

        {/* FAQ Accordion Grid */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;
            return (
              <div
                key={index}
                className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden hover:border-blue-200 transition-colors"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-500 transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                      <div className="px-6 pb-6 pt-1 text-slate-600 text-xs md:text-sm leading-relaxed border-t border-slate-100/50">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
