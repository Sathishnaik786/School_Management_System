import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  FileWarning,
  Scale,
  Activity,
  HardDrive,
  Laptop,
  CheckCircle,
  HelpCircle,
  Video,
  Mic,
  Network,
  Chrome
} from "lucide-react";

export default function PoliciesAndRequirements() {
  const policies = [
    {
      title: "Academic Integrity",
      description: "EduTrack maintains zero-tolerance cheating protocols. Screen switches, dual monitor detection, and window minimization trigger instant alerts to local invigilator dashboards.",
      icon: Scale,
    },
    {
      title: "Examination Rules",
      description: "Candidates must sit in a well-lit environment. No external study aids, mobile devices, headphones, or supplementary web tabs are permitted inside the examination session.",
      icon: FileWarning,
    },
    {
      title: "Online Guidelines",
      description: "Candidates are required to perform a dry-run system compatibility check 48 hours prior to live exams. Ensure all power supplies and battery backups are configured.",
      icon: Activity,
    },
    {
      title: "Candidate Responsibilities",
      description: "It is the student's responsibility to verify the accuracy of the downloaded Hall Ticket. Access issues must be reported to the Examination Cell prior to scheduling deadlines.",
      icon: HelpCircle,
    },
  ];

  const requirements = [
    {
      title: "Supported Browsers",
      detail: "Google Chrome, Mozilla Firefox, Microsoft Edge, and Apple Safari (latest stable builds). Ad-blockers and extensions must be deactivated.",
      icon: Chrome,
    },
    {
      title: "Internet Bandwidth",
      detail: "Active stable broadband connection. Minimum required speed is 2.0 Mbps upload/download. Mobile hot-spots are not recommended.",
      icon: Network,
    },
    {
      title: "Camera & Video Capture",
      detail: "Functional integrated or USB external webcam (Minimum 720p resolution) is mandatory for continuous identity checks.",
      icon: Video,
    },
    {
      title: "Microphone & Sound",
      detail: "Internal microphone is required to capture ambient noise audits. Headphones or bluetooth headsets are strictly prohibited.",
      icon: Mic,
    },
    {
      title: "Device Compatibility",
      detail: "Laptops and desktop workstations running Windows 10/11 or macOS 11+. Chromebooks are allowed. Mobile phones are incompatible.",
      icon: Laptop,
    },
  ];

  return (
    <section id="policies" className="py-24 bg-slate-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge className="bg-blue-50 text-blue-700 border-blue-100 px-3 py-1 font-semibold text-xs rounded-full">
            PORTAL STANDARDS
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            Examination Policies & System Requirements
          </h2>
          <p className="text-slate-600 text-base md:text-lg">
            Ensure clear compliance with rules and confirm that candidate workstations satisfy the technical requirements before starting examinations.
          </p>
        </div>

        {/* Dual Grid */}
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Policies */}
          <div className="lg:col-span-6 space-y-6">
            <h3 className="font-display text-xl font-bold text-slate-900 border-b border-slate-200/60 pb-3 flex items-center gap-2">
              <Scale className="w-5.5 h-5.5 text-blue-600" />
              Examination Policies
            </h3>
            
            <div className="space-y-6">
              {policies.map((policy, idx) => {
                const IconComponent = policy.icon;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    key={idx}
                    className="flex gap-4 text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-slate-800 text-base">
                        {policy.title}
                      </h4>
                      <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-medium">
                        {policy.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Technical Requirements */}
          <div className="lg:col-span-6 space-y-6">
            <h3 className="font-display text-xl font-bold text-slate-900 border-b border-slate-200/60 pb-3 flex items-center gap-2">
              <HardDrive className="w-5.5 h-5.5 text-blue-600" />
              Minimum System Requirements
            </h3>
            
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-premium-sm space-y-6">
              {requirements.map((req, index) => {
                const IconComponent = req.icon;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    key={index}
                    className="flex gap-4 text-left border-b border-slate-50 last:border-b-0 pb-4 last:pb-0"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <IconComponent className="w-4.5 h-4.5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-slate-850 text-sm md:text-base">
                        {req.title}
                      </h4>
                      <p className="text-slate-500 text-xs leading-relaxed font-medium">
                        {req.detail}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
