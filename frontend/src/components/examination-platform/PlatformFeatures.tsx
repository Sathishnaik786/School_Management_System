import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  FileSignature,
  FileSpreadsheet,
  Users2,
  FolderLock,
  QrCode,
  CalendarDays,
  AppWindow,
  Shuffle,
  Save,
  Radio,
  Calculator,
  Zap
} from "lucide-react";

export default function PlatformFeatures() {
  const features = [
    {
      title: "Admission Entrance Tests",
      description: "Administer digital entrance evaluations for new registrants with automatic grade ranking.",
      icon: FileSignature,
    },
    {
      title: "Academic Examinations",
      description: "Manage end-to-end institutional term, monthly, and final exams with customized structures.",
      icon: FileSpreadsheet,
    },
    {
      title: "Teacher Recruitment",
      description: "Facilitate qualification tests, subject eligibility checks, and administrative hiring scores.",
      icon: Users2,
    },
    {
      title: "Question Bank",
      description: "Organize thousands of questions categorized by difficulty, subject, and learning outcomes.",
      icon: FolderLock,
    },
    {
      title: "Hall Ticket Generation",
      description: "Generate digital admit cards with unique seat allocations and exam center barcodes.",
      icon: QrCode,
    },
    {
      title: "Exam Scheduling",
      description: "Plan multi-campus exam calendars with room allocation and invigilator assignment workflows.",
      icon: CalendarDays,
    },
    {
      title: "Secure Browser Support",
      description: "Prevent candidates from switching tabs, copy-pasting, or using unauthorized browser shortcuts.",
      icon: AppWindow,
    },
    {
      title: "Question Randomization",
      description: "Generate unique question sequence permutations for each candidate to minimize integrity violations.",
      icon: Shuffle,
    },
    {
      title: "Auto Save",
      description: "Continuous synchronization of candidates' answers to local cache and cloud database servers.",
      icon: Save,
    },
    {
      title: "Live Monitoring",
      description: "Invigilators monitor candidate progress, browser status, and security alerts in real-time.",
      icon: Radio,
    },
    {
      title: "Automated Evaluation",
      description: "Grade objective questions instantly and facilitate subjective assessment marking workflows.",
      icon: Calculator,
    },
    {
      title: "Instant Results",
      description: "Publish grade sheets and ranking analytics reports immediately upon moderation clearance.",
      icon: Zap,
    },
  ];

  return (
    <section id="features" className="py-24 bg-slate-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge className="bg-blue-50 text-blue-700 border-blue-100 px-3 py-1 font-semibold text-xs rounded-full">
            PORTAL CAPABILITIES
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            Platform Features
          </h2>
          <p className="text-slate-600 text-base md:text-lg">
            Empower your academic board with advanced scheduling tools, high-fidelity security, and automatic evaluation frameworks.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                whileHover={{ y: -4 }}
                key={index}
                className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-blue-200 shadow-premium-sm hover:shadow-premium-md transition-all duration-200 text-left flex flex-col items-start gap-4"
              >
                {/* Icon wrapper */}
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-5.5 h-5.5" />
                </div>
                
                {/* Content */}
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-slate-800 text-base leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
