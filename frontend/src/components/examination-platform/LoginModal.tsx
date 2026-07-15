import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  X,
  User,
  ShieldAlert,
  Loader2,
  Lock,
  Mail,
  UserCheck,
  Building,
  ClipboardCheck,
  Eye,
  EyeOff
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PortalRole =
  | "student"
  | "applicant"
  | "teacher"
  | "exam_cell"
  | "evaluator"
  | "invigilator"
  | "recruitment_candidate";

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const navigate = useNavigate();
  const [role, setRole] = useState<PortalRole>("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rolesList = [
    { id: "student" as PortalRole, label: "Student", icon: GraduationCap },
    { id: "applicant" as PortalRole, label: "Applicant", icon: UserCheck },
    { id: "teacher" as PortalRole, label: "Teacher", icon: User },
    { id: "exam_cell" as PortalRole, label: "Exam Cell", icon: Building },
    { id: "evaluator" as PortalRole, label: "Evaluator", icon: ClipboardCheck },
    { id: "invigilator" as PortalRole, label: "Invigilator", icon: ShieldAlert },
    { id: "recruitment_candidate" as PortalRole, label: "Recruitment Candidate", icon: User },
  ];

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Simulate/Support Supabase email sign in
      // If it looks like an email, we attempt real Supabase sign-in
      if (username.includes("@")) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: username,
          password: password,
        });

        if (authError) {
          throw new Error(authError.message);
        }
        
        // Map roles to redirect paths
        if (role === "student") {
          navigate("/app/student/dashboard");
        } else if (role === "exam_cell") {
          navigate("/app/exam-admin/dashboard");
        } else {
          navigate("/app/dashboard");
        }
        onClose();
      } else {
        // Fallback for simple demo usernames
        setTimeout(() => {
          setLoading(false);
          // Redirect demo access
          if (role === "student") {
            navigate("/app/student/dashboard");
          } else if (role === "exam_cell") {
            navigate("/app/exam-admin/dashboard");
          } else {
            navigate("/app/dashboard");
          }
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || "Invalid authentication credentials.");
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-white/95 backdrop-blur-lg border border-slate-100 rounded-3xl shadow-premium-xl w-full max-w-lg overflow-hidden z-10 flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-5 top-5 p-2 rounded-full hover:bg-slate-100 transition-colors z-20 text-slate-500 hover:text-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 sm:p-10 space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-premium-md">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-black text-slate-950">
                  EduTrack
                </h2>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Enterprise Examination Portal
                </p>
              </div>

              {/* Error Box */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold rounded-xl text-left">
                  {error}
                </div>
              )}

              {/* Select Portal */}
              <div className="space-y-2.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Select Portal
                </label>
                
                {/* Horizontal scrolling or grid list of portals */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {rolesList.map((item) => {
                    const RoleIcon = item.icon;
                    const isSelected = role === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setRole(item.id);
                          setError(null);
                        }}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                          isSelected
                            ? "bg-blue-600 border-blue-600 text-white shadow-premium-md"
                            : "bg-slate-50 border-slate-100 text-slate-650 hover:bg-slate-100/70"
                        }`}
                      >
                        <RoleIcon className={`w-4 h-4 mb-1.5 ${isSelected ? "text-white" : "text-slate-500"}`} />
                        <span className="text-[9px] font-bold tracking-tight leading-none truncate w-full">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Input fields */}
              <form onSubmit={handleSignIn} className="space-y-4 text-left">
                
                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Username / Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Enter username or official email"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-600 focus:bg-white text-slate-800 font-semibold transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Portal Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter access password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-600 focus:bg-white text-slate-800 font-semibold transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot options */}
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-200 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Remember Me</span>
                  </label>
                  <a href="#" className="text-blue-600 hover:underline">
                    Forgot Password?
                  </a>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-premium-md flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      <span>Verifying Portal Credentials...</span>
                    </>
                  ) : (
                    <span>Sign In to {rolesList.find((r) => r.id === role)?.label} Portal</span>
                  )}
                </Button>
              </form>

              {/* Support reference */}
              <div className="pt-4 border-t border-slate-100 text-center space-y-1">
                <p className="text-xs text-slate-500 font-semibold">
                  Need Help?
                </p>
                <a href="#contact" onClick={(e) => {
                  onClose();
                  const contactEl = document.querySelector("#contact");
                  if (contactEl) {
                    contactEl.scrollIntoView({ behavior: "smooth" });
                  }
                }} className="text-xs font-bold text-blue-600 hover:underline">
                  Contact Examination Cell
                </a>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
