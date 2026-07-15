import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Megaphone,
  UserPlus,
  QrCode,
  LogIn,
  ScanFace,
  FileWarning,
  Play,
  Save,
  CheckSquare,
  ClipboardCheck,
  CheckCircle2
} from "lucide-react";

export default function Timeline() {
  const steps = [
    {
      title: "Exam Published",
      description: "Exam specifications, duration, and configurations are released by the Exam Cell.",
      icon: Megaphone,
    },
    {
      title: "Candidate Assigned",
      description: "Eligible students or candidates are registered and mapped to specific exam instances.",
      icon: UserPlus,
    },
    {
      title: "Hall Ticket Generated",
      description: "Admit cards with venue, seat details, and verification codes are published for candidate download.",
      icon: QrCode,
    },
    {
      title: "Candidate Login",
      description: "Candidates log in using their credentials inside the secure examination portal.",
      icon: LogIn,
    },
    {
      title: "Identity Verification",
      description: "Biometric or verification scans are performed to guarantee candidate authenticity.",
      icon: ScanFace,
    },
    {
      title: "Instructions",
      description: "Candidates read instructions and accept honor codes before launching the interface.",
      icon: FileWarning,
    },
    {
      title: "Start Examination",
      description: "The secure timer starts and the exam panel renders questions for candidate response.",
      icon: Play,
    },
    {
      title: "Auto Save",
      description: "Answers are saved every few seconds to prevent data loss in case of hardware or network failures.",
      icon: Save,
    },
    {
      title: "Submission",
      description: "Candidate submits the test or the timer runs out, initiating automatic final capture.",
      icon: CheckSquare,
    },
    {
      title: "Evaluation",
      description: "Objective grading is completed immediately, while subjective questions route to assigned evaluators.",
      icon: ClipboardCheck,
    },
    {
      title: "Results Published",
      description: "Verified results, marks, and statistics are pushed to student and institute archives.",
      icon: CheckCircle2,
    },
  ];

  return (
    <section id="workflow" className="py-24 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge className="bg-blue-50 text-blue-700 border-blue-100 px-3 py-1 font-semibold text-xs rounded-full">
            WORKFLOW ROUTE
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            Examination Process Timeline
          </h2>
          <p className="text-slate-600 text-base md:text-lg">
            A secure, automated lifecycle that ensures structural consistency and operational safety throughout all school assessments.
          </p>
        </div>

        {/* Timeline Path Container */}
        {/* Desktop: Horizontal layout with wrap, Mobile: Vertical stack */}
        <div className="relative">
          {/* Main Connector Line (Desktop only, hidden on mobile) */}
          <div className="hidden lg:block absolute top-[44px] left-[5%] right-[5%] h-0.5 bg-slate-100 -z-10" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-y-12 gap-x-8 items-start">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  key={index}
                  className="flex flex-col items-center lg:items-start text-center lg:text-left relative group"
                >
                  {/* Step bubble */}
                  <div className="w-22 h-22 rounded-full bg-white border-2 border-slate-200 group-hover:border-blue-600 shadow-premium-sm flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-all duration-300 relative z-10 mb-4 bg-slate-50">
                    {/* Index Badge */}
                    <span className="absolute top-0 right-0 w-6 h-6 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 flex items-center justify-center border border-slate-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                      {index + 1}
                    </span>
                    <IconComponent className="w-7 h-7" />
                  </div>

                  {/* Step Text Info */}
                  <div className="space-y-1.5 px-2">
                    <h3 className="font-display font-bold text-slate-800 text-sm md:text-base leading-tight group-hover:text-blue-700 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed font-medium">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
