import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Bell, Info, Award, Calendar, Users, Clock } from "lucide-react";

export default function Announcements() {
  const notices = [
    {
      title: "Admission Entrance Notice 2026-27",
      description: "Detailed syllabus and proctoring instructions for the upcoming admission entrance examinations are now published. Candidates must download the verification app.",
      category: "Admissions",
      date: "2 hours ago",
      icon: Info,
      color: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      title: "Quarterly Exam Schedule Released",
      description: "The official timetable for term examinations (Grades 1 to 12) is updated. Active candidates should download their digital hall tickets.",
      category: "Examinations",
      date: "1 day ago",
      icon: Calendar,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      title: "Teacher Eligibility Assessment Guidelines",
      description: "Hiring boards have updated guidelines for recruitment screening. Review technical requirements before launching the secure session.",
      category: "Recruitment",
      date: "2 days ago",
      icon: Users,
      color: "bg-rose-50 text-rose-600 border-rose-100",
    },
    {
      title: "Merit Scholarship Exam Announcement",
      description: "Applications for the National Merit Scholarship Exam (NMSE) are invited. Registered applicants will receive credentials via registered email.",
      category: "Scholarships",
      date: "3 days ago",
      icon: Award,
      color: "bg-purple-50 text-purple-600 border-purple-100",
    },
  ];

  return (
    <div id="announcements" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12 space-y-3">
          <Badge className="bg-blue-50 text-blue-700 border-blue-100 px-3 py-1 font-semibold text-xs rounded-full">
            NOTICES & ANNOUNCEMENTS
          </Badge>
          <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            Important Notices
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Stay updated with the latest alerts and official guidelines from the central examination board.
          </p>
        </div>

        {/* List of Notices (styled exactly like reference dashboard) */}
        <div className="space-y-4 max-w-3xl mx-auto">
          {notices.map((notice, index) => {
            const IconComponent = notice.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                key={index}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-premium-sm hover:shadow-premium-md hover:border-slate-300 transition-all duration-200 text-left flex gap-4"
              >
                {/* Icon with soft circular background */}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${notice.color}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                
                {/* Notice Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {notice.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {notice.date}
                    </span>
                  </div>
                  
                  <h3 className="font-display font-bold text-slate-800 text-base">
                    {notice.title}
                  </h3>
                  
                  <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                    {notice.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
