import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Clock, Landmark, Send, Check } from "lucide-react";

export default function ContactExamCell() {
  const [formState, setFormState] = useState({
    id: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormState({ id: "", email: "", subject: "", message: "" });
      setTimeout(() => setIsSuccess(false), 5000);
    }, 1500);
  };

  return (
    <section id="contact" className="py-24 bg-slate-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge className="bg-blue-50 text-blue-700 border-blue-100 px-3 py-1 font-semibold text-xs rounded-full">
            COMMUNICATION GATEWAY
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            Contact Examination Cell
          </h2>
          <p className="text-slate-600 text-base md:text-lg">
            Reach out to our administrative cell for technical concerns, hall ticket corrections, or verification inquiries.
          </p>
        </div>

        {/* Form and Details Grid */}
        <div className="grid lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Left Side: Contact Information */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="font-display text-xl font-bold text-slate-800 text-left">
                Examination Office
              </h3>
              
              <div className="space-y-4">
                {/* Telephone */}
                <div className="flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl text-left">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Helpline Contact</p>
                    <p className="text-sm font-semibold text-slate-850 mt-0.5">+1 (555) 392-6457</p>
                    <p className="text-[11px] text-slate-500">Toll-free student support helpline</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl text-left">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Inquiry</p>
                    <p className="text-sm font-semibold text-slate-850 mt-0.5">exam.cell@edutrack.edu</p>
                    <p className="text-[11px] text-slate-500">Response within 24 working hours</p>
                  </div>
                </div>

                {/* Office Hours */}
                <div className="flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl text-left">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Working Hours</p>
                    <p className="text-sm font-semibold text-slate-850 mt-0.5">Mon - Fri: 08:30 AM - 04:30 PM</p>
                    <p className="text-[11px] text-slate-500">Excluding national public holidays</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl text-left">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Office Location</p>
                    <p className="text-sm font-semibold text-slate-850 mt-0.5">Block C, Administrative Complex</p>
                    <p className="text-[11px] text-slate-500">EduTrack Campus, Academic Avenue 12</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Footer Text */}
            <p className="text-xs font-medium text-slate-500 leading-relaxed text-left border-t border-slate-200/60 pt-4">
              * Verification of Hall Tickets requires valid identity proof (Passport, Aadhaar Card, or Driver License) uploaded into the dashboard portal.
            </p>
          </div>

          {/* Right Side: Emergency Query Ticket Form */}
          <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-premium-lg flex flex-col justify-center">
            <h3 className="font-display text-xl font-bold text-slate-850 mb-6 text-left">
              Send Support Query
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              
              <div className="grid md:grid-cols-2 gap-4">
                {/* ID Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 uppercase tracking-wide">
                    Reference / Registration ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STU-2026-8943"
                    value={formState.id}
                    onChange={(e) => setFormState({ ...formState, id: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-600 focus:bg-white text-sm font-semibold transition-all"
                  />
                </div>

                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 uppercase tracking-wide">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="candidate@email.com"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-600 focus:bg-white text-sm font-semibold transition-all"
                  />
                </div>
              </div>

              {/* Subject Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 uppercase tracking-wide">
                  Query Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hall Ticket Correction / Login credentials error"
                  value={formState.subject}
                  onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-600 focus:bg-white text-sm font-semibold transition-all"
                />
              </div>

              {/* Message Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 uppercase tracking-wide">
                  Description Details
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Please describe your query or problem in detail..."
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-600 focus:bg-white text-sm font-semibold transition-all resize-none"
                />
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-premium-md flex items-center justify-center gap-2 transition-all"
              >
                {isSubmitting ? (
                  <span>Sending inquiry...</span>
                ) : isSuccess ? (
                  <span className="flex items-center gap-1.5">
                    <Check className="w-5 h-5 text-white" /> Query Transmitted Successfully
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Send className="w-4 h-4" /> Submit Query to Exam Cell
                  </span>
                )}
              </Button>
            </form>
          </div>

        </div>

      </div>
    </section>
  );
}
