import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  BookOpen,
  FileCheck,
  Trophy,
  Users
} from "lucide-react";

export default function SupportedExams() {
  const categories = [
    {
      title: "Admission Tests",
      description: "Entrance exams for new admissions",
      count: "3 Exams",
      icon: GraduationCap,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      title: "Unit Tests",
      description: "Subject-wise unit assessments",
      count: "5 Exams",
      icon: BookOpen,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: "Term Exams",
      description: "Periodic term examinations",
      count: "4 Exams",
      icon: FileCheck,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      title: "Scholarship Tests",
      description: "Merit based scholarship tests",
      count: "2 Exams",
      icon: Trophy,
      color: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      title: "Recruitment Tests",
      description: "Teacher & staff recruitment exams",
      count: "2 Exams",
      icon: Users,
      color: "text-rose-600 bg-rose-50 border-rose-100",
    },
  ];

  return (
    <section id="supported-exams" className="py-20 bg-slate-50 border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-left mb-12 space-y-2">
          <Badge className="bg-blue-50 text-blue-700 border-blue-100 px-3 py-1 font-semibold text-xs rounded-full">
            PORTAL CLASSIFICATION
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            Exam Categories
          </h2>
          <p className="text-slate-500 text-sm max-w-2xl">
            Select portal settings configured for specific educational evaluation types.
          </p>
        </div>

        {/* Categories Grid (matching the reference styling exactly) */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                key={index}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-premium-sm hover:shadow-premium-md hover:border-slate-300 transition-all duration-350 text-left flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Circular Icon Background */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${category.color} border`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  
                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-slate-800 text-base leading-tight">
                      {category.title}
                    </h3>
                    <p className="text-slate-450 text-xs font-semibold leading-normal">
                      {category.description}
                    </p>
                  </div>
                </div>

                {/* Exam Count Details */}
                <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-center sm:justify-start">
                  <span className="text-xs font-extrabold text-slate-500">
                    {category.count}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
