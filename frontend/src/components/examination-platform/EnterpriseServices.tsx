import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  GraduationCap,
  BookOpen,
  Users,
  FileText,
  Cpu,
  Award,
  Database
} from "lucide-react";

export default function EnterpriseServices() {
  const services = [
    {
      title: "Secure Online Examination",
      description: "State-of-the-art browser lockdown protocols, question paper encryption, and live anti-cheat proctoring logs.",
      icon: Shield,
    },
    {
      title: "Admission Assessments",
      description: "Automated entrance examinations for incoming students, incorporating cut-offs, merit lists, and rank generation.",
      icon: GraduationCap,
    },
    {
      title: "Academic Examinations",
      description: "Support for unit tests, quarterly, half-yearly, and final school examinations matching core institutional boards.",
      icon: BookOpen,
    },
    {
      title: "Teacher Recruitment",
      description: "Screening assessments, eligibility scoring, and interview scheduling workflows for hiring academic staff.",
      icon: Users,
    },
    {
      title: "Digital Hall Tickets",
      description: "Automated generation, seat numbers allocation, exam center routing, and QR-based candidate verification at entry.",
      icon: FileText,
    },
    {
      title: "Automated Evaluation",
      description: "Instant grading of multiple-choice sheets, AI-assisted grading indicators, and moderation workflows for subjective answers.",
      icon: Cpu,
    },
    {
      title: "Result Publishing",
      description: "Single-click mark sheets publishing, dynamic transcripts, statistical report generation, and student portal release.",
      icon: Award,
    },
    {
      title: "Security & Audit Logs",
      description: "Immutable compliance logs of student activity, IP addresses, browser switches, and examiner grading overrides.",
      icon: Database,
    },
  ];

  return (
    <section id="services" className="py-24 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Split Layout Header */}
        <div className="grid lg:grid-cols-12 gap-8 items-end mb-16">
          <div className="lg:col-span-8 space-y-4 text-left">
            <Badge className="bg-blue-50 text-blue-700 border-blue-100 px-3 py-1 font-semibold text-xs rounded-full">
              ENTERPRISE UTILITIES
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
              Enterprise Examination Services
            </h2>
            <p className="text-slate-600 text-base md:text-lg max-w-2xl">
              EduTrack supports key operational workflows required by administrative exam cells to securely construct, manage, and scale school evaluations.
            </p>
          </div>
          <div className="lg:col-span-4 text-left lg:text-right">
            <span className="text-sm font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5 cursor-pointer">
              Review portal policies below
            </span>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                key={index}
                className="group relative bg-slate-50/50 hover:bg-white rounded-3xl p-6 border border-slate-100 hover:border-blue-100 shadow-premium-sm hover:shadow-premium-xl transition-all duration-300 text-left"
              >
                <div className="space-y-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-premium-sm group-hover:bg-blue-600 group-hover:border-blue-600 flex items-center justify-center text-slate-700 group-hover:text-white transition-all duration-300">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="font-display font-bold text-slate-800 text-lg group-hover:text-blue-700 transition-colors">
                    {service.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">
                    {service.description}
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
