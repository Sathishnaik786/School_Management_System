import Navbar from "../../components/examination-platform/Navbar";
import Hero from "../../components/examination-platform/Hero";
import Announcements from "../../components/examination-platform/Announcements";
import SupportedExams from "../../components/examination-platform/SupportedExams";
import Footer from "../../components/examination-platform/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800 scroll-smooth">
      {/* Sticky Navbar */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Announcements Section (notices & calendar) */}
      <div className="py-8 bg-white">
        <Announcements />
      </div>

      {/* Supported Examination Types */}
      <SupportedExams />

      {/* Institutional Footer */}
      <Footer />
    </div>
  );
}
