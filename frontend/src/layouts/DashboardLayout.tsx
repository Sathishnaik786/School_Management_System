import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    BookOpen,
    ClipboardList,
    Calendar,
    Coins,
    Bus,
    Bell,
    Settings,
    LogOut,
    Menu,
    X,
    UserCircle,
    FileText,
    Clock,
    Search,
    ChevronDown,
    ShieldCheck,
    Activity,
    AlertOctagon,
    BarChart3,
    Monitor,
    DollarSign,
    MapPin,
    User,
    Briefcase,
    Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DashboardLayout = () => {
    const { user, signOut, hasPermission, hasRole } = useAuth();
    console.log("[DashboardLayout] Rendering for user:", user?.email, "Roles:", user?.roles);
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const isAdmin = hasRole('ADMIN') || hasRole('HEAD_OF_INSTITUTE');
    const isFaculty = hasRole('FACULTY');
    const isStudent = hasRole('STUDENT');
    const isParent = hasRole('PARENT');
    const isTransportAdmin = hasRole('TRANSPORT_ADMIN');
    const isDriver = hasRole('BUS_DRIVER');

    // Menu Items based on roles and permissions
    const menuGroups = [
        // Common items for everyone (e.g. Dashboard) can be kept, but User requested specific structures.
        // We will strictly follow the structure requested for Student/Parent and keep Admin/Faculty as is.

        // ADMIN & HEAD_OF_INSTITUTE
        ...(isAdmin ? [
            {
                label: 'General',
                items: [
                    { label: 'Overview', icon: LayoutDashboard, path: '/app/dashboard' },
                ]
            },
            {
                label: 'Human Resources',
                items: [
                    { label: 'Faculty Management', icon: GraduationCap, path: '/app/academic/faculty', permission: 'FACULTY_PROFILE_MANAGE' },
                    { label: 'Staff Management', icon: Briefcase, path: '/app/admin/staff', permission: 'STAFF_PROFILE_MANAGE' },
                ]
            },
            {
                label: 'Administration',
                items: [
                    { label: 'Admissions', icon: ClipboardList, path: '/app/admissions/review', permission: 'admission.review' },
                    { label: 'Student Management', icon: Users, path: '/app/students', permission: 'STUDENT_VIEW' },
                    { label: 'Academic Setup', icon: GraduationCap, path: '/app/academic/classes', permission: 'CLASS_VIEW' },
                    { label: 'Departments', icon: Building, path: '/app/academic/departments', permission: 'DEPARTMENT_VIEW' },
                    { label: 'Subject Management', icon: BookOpen, path: '/app/exams/subjects', permission: 'SUBJECT_VIEW' },
                    { label: 'Exam Management', icon: FileText, path: '/app/exams/manage', permission: 'EXAM_VIEW' },
                    { label: 'System Settings', icon: Settings, path: '/app/settings' },
                ]
            },
            {
                label: 'Finances',
                items: [
                    { label: 'Fee Management', icon: Coins, path: '/app/fees/structures', permission: 'FEES_SETUP' },
                    { label: 'Transport', icon: Bus, path: '/app/transport/setup', permission: 'TRANSPORT_SETUP' },
                ]
            },
            {
                label: 'Tools & Utilities',
                items: [
                    { label: 'Import History', icon: ClipboardList, path: '/app/import/history' },
                ]
            }
        ] : []),

        // FACULTY
        ...(isFaculty ? [
            {
                label: 'General',
                items: [
                    { label: 'Overview', icon: LayoutDashboard, path: '/app/dashboard' },
                ]
            },
            {
                label: 'Academic',
                items: [
                    { label: 'Classes', icon: GraduationCap, path: '/app/academic/classes', permission: 'CLASS_VIEW' },
                    { label: 'My Students', icon: Users, path: '/app/academic/my-students', permission: 'SECTION_VIEW' },
                    { label: 'My Assignments', icon: BookOpen, path: '/app/academic/assignments', permission: 'SECTION_VIEW' },
                    { label: 'Exam Management', icon: FileText, path: '/app/exams/manage', permission: 'EXAM_VIEW' },
                    { label: 'Time Table', icon: Clock, path: '/app/timetable/manage', permission: 'TIMETABLE_CREATE' },
                    { label: 'Attendance', icon: Calendar, path: '/app/attendance/mark', permission: 'ATTENDANCE_MARK' },
                ]
            },
        ] : []),

        // STUDENT
        ...(isStudent ? [
            {
                label: 'Core',
                items: [
                    { label: 'Dashboard', icon: LayoutDashboard, path: '/app/dashboard' },
                    { label: 'My Profile', icon: UserCircle, path: '/app/profile' },
                ]
            },
            {
                label: 'Academics',
                items: [
                    // { label: 'My Subjects', icon: BookOpen, path: '/app/academic/subjects' }, // Route not confirmed
                    { label: 'Assignments', icon: ClipboardList, path: '/app/student/assignments', permission: 'STUDENT_VIEW_SELF' },
                    { label: 'My Timetable', icon: Clock, path: '/app/timetable/my', permission: 'TIMETABLE_VIEW_SELF' },
                ]
            },
            {
                label: 'Exams & Results',
                items: [
                    // { label: 'Exams', icon: FileText, path: '/app/exams/schedule' }, // Route not confirmed
                    { label: 'Results', icon: GraduationCap, path: '/app/exams/results', permission: 'MARKS_VIEW' },
                ]
            },
            {
                label: 'Attendance',
                items: [
                    { label: 'My Attendance', icon: Calendar, path: '/app/attendance/my', permission: 'ATTENDANCE_VIEW_SELF' },
                ]
            },
            {
                label: 'Fees',
                items: [
                    { label: 'My Fees', icon: Coins, path: '/app/fees/my', permission: 'PAYMENT_VIEW_SELF' },
                ]
            },
            {
                label: 'Transport',
                items: [
                    { label: 'My Transport', icon: Bus, path: '/app/transport/my', permission: 'TRANSPORT_VIEW_SELF' },
                ]
            },
            // {
            //     label: 'Communication',
            //     items: [
            //         { label: 'Notifications', icon: Bell, path: '/notifications' },
            //     ]
            // },
            {
                label: 'Account',
                items: [
                    { label: 'Settings', icon: Settings, path: '/app/settings' },
                ]
            },
        ] : []),

        // PARENT
        ...(isParent ? [
            {
                label: 'Core',
                items: [
                    { label: 'Dashboard', icon: LayoutDashboard, path: '/app/dashboard' },
                ]
            },
            {
                label: 'Children',
                items: [
                    { label: 'My Children', icon: Users, path: '/app/students/my-children', permission: 'STUDENT_VIEW_SELF' },
                ]
            },
            {
                label: 'Academics',
                items: [
                    { label: 'Attendance', icon: Calendar, path: '/app/attendance/my', permission: 'ATTENDANCE_VIEW_SELF' },
                    { label: 'Assignments', icon: BookOpen, path: '/app/student/assignments', permission: 'STUDENT_VIEW_SELF' },
                ]
            },
            {
                label: 'Exams & Results',
                items: [
                    { label: 'Results', icon: GraduationCap, path: '/app/exams/results', permission: 'MARKS_VIEW' },
                ]
            },
            {
                label: 'Fees',
                items: [
                    { label: 'Fees & Payments', icon: Coins, path: '/app/fees/my', permission: 'PAYMENT_VIEW_SELF' },
                ]
            },
            {
                label: 'Transport',
                items: [
                    { label: 'Transport Details', icon: Bus, path: '/app/transport/my', permission: 'TRANSPORT_VIEW_SELF' },
                ]
            },
            // {
            //     label: 'Communication',
            //     items: [
            //         { label: 'Notifications', icon: Bell, path: '/notifications' },
            //         { label: 'Contact School', icon: ShieldCheck, path: '/contact' },
            //     ]
            // },
            {
                label: 'Account',
                items: [
                    { label: 'Profile', icon: UserCircle, path: '/app/profile' },
                    { label: 'Settings', icon: Settings, path: '/app/settings' },
                ]
            },
        ] : []),

        // TRANSPORT ADMIN
        ...(user?.roles.includes('TRANSPORT_ADMIN') ? [
            {
                label: '1. Transport Setup',
                items: [
                    { label: 'Routes', icon: MapPin, path: '/app/transport/setup#routes' },
                    { label: 'Stops & Points', icon: Settings, path: '/app/transport/setup#stops' },
                    { label: 'Vehicle Fleet', icon: Bus, path: '/app/transport/setup#vehicles' },
                    { label: 'Driver Registry', icon: User, path: '/app/transport/setup#drivers' },
                    { label: 'Fees', icon: DollarSign, path: '/app/transport/setup#fees' },
                ]
            },
            {
                label: '2. Transport Operations',
                items: [
                    { label: 'Overview', icon: LayoutDashboard, path: '/app/transport/overview' },
                    { label: 'Live Trip Monitor', icon: Activity, path: '/app/transport/monitor' },
                    { label: 'Print Manifests', icon: FileText, path: '/app/transport/manifests' },
                    { label: 'Start Incident', icon: AlertOctagon, path: '/app/transport/incidents' },
                    { label: 'Analytics', icon: BarChart3, path: '/app/transport/analytics' },
                ]
            },
            {
                label: '3. Assignments',
                items: [
                    { label: 'Student Assignment', icon: Users, path: '/app/transport/assign' },
                    { label: 'Bulk Assignment', icon: ClipboardList, path: '/app/transport/bulk-assign' },
                ]
            },
            {
                label: '4. System Diagnostics',
                items: [
                    { label: 'Debug Info', icon: ShieldCheck, path: '/app/transport/debug' },
                ]
            }
        ] : []),

        // BUS DRIVER
        ...(isDriver ? [
            {
                label: 'Driver Console',
                items: [
                    { label: 'My Trips', icon: Bus, path: '/app/transport/driver' },
                    { label: 'My Profile', icon: UserCircle, path: '/app/profile' },
                ]
            }
        ] : []),
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const SidebarItem = ({ item }: { item: any }) => {
        if (item.permission && !hasPermission(item.permission)) return null;

        const pathBase = item.path.split('#')[0];
        const pathHash = item.path.split('#')[1] ? '#' + item.path.split('#')[1] : '';

        const isActive = location.pathname === pathBase && (pathHash ? location.hash === pathHash : !location.hash);

        return (
            <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                onClick={() => setIsMobileMenuOpen(false)}
            >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`} />
                <span className={`font-semibold tracking-wide ${!isSidebarOpen && 'hidden'}`}>{item.label}</span>
                {isActive && isSidebarOpen && (
                    <motion.div
                        layoutId="sidebarActive"
                        className="ml-auto w-1 h-4 bg-blue-300 rounded-full"
                    />
                )}
            </Link>
        );
    };

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 80 }}
                className="hidden lg:flex flex-col bg-white border-r border-gray-100 sticky top-0 h-screen z-30 transition-all duration-300 overflow-hidden"
            >
                <div className="p-6 flex items-center gap-3 h-20">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200 shrink-0">
                        E
                    </div>
                    {isSidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-black text-xl text-gray-900 tracking-tight"
                        >
                            EduFlow
                        </motion.div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-8 sidebar-scrollbar">
                    {menuGroups.map((group, idx) => (
                        <div key={idx} className="space-y-2">
                            {isSidebarOpen && (
                                <p className="px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                    {group.label}
                                </p>
                            )}
                            <div className="space-y-1">
                                {group.items.map((item, i) => (
                                    <SidebarItem key={i} item={item} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-50">
                    <button
                        onClick={toggleSidebar}
                        className="w-full flex items-center justify-center p-3 rounded-xl bg-gray-50 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </motion.aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            className="fixed left-0 top-0 bottom-0 w-[280px] bg-white z-50 lg:hidden flex flex-col p-6 shadow-2xl"
                        >
                            {/* Mobile Sidebar Content same as desktop but simpler */}
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">S</div>
                                    <span className="font-black text-xl text-gray-900">EduFlow</span>
                                </div>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-50 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-8">
                                {menuGroups.map((group, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{group.label}</p>
                                        <div className="space-y-1">
                                            {group.items.map((item, i) => (
                                                <SidebarItem key={i} item={item} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Navbar */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-20">
                    <div className="h-20 px-4 sm:px-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                            >
                                <Search className="w-6 h-6" />
                            </button>
                            <div className="bg-gray-50 rounded-2xl px-4 py-2 hidden md:flex items-center gap-3 w-64 ring-1 ring-gray-100">
                                <Search className="w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Quick Search..."
                                    className="bg-transparent border-none text-sm focus:ring-0 placeholder:text-gray-400 w-full"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-6">
                            <div className="relative hidden sm:block">
                                <button className="p-2.5 bg-gray-50 text-gray-500 rounded-2xl hover:bg-white hover:shadow-md hover:text-blue-600 transition-all border border-transparent hover:border-blue-50">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                </button>
                            </div>

                            <div className="h-8 w-[1px] bg-gray-100 hidden sm:block"></div>

                            {/* Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-3 p-1.5 pl-3 sm:pl-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-lg transition-all"
                                >
                                    <div className="hidden sm:block text-right">
                                        <p className="text-sm font-bold text-gray-900 leading-tight">{user?.full_name}</p>
                                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">{user?.roles?.[0]}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-gray-100">
                                        <UserCircle className="w-6 h-6" />
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 p-3 z-50 overflow-hidden"
                                            >
                                                <div className="px-4 py-4 mb-2 bg-gray-50 rounded-2xl">
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Signed in as</p>
                                                    <p className="font-bold text-gray-900 truncate">{user?.email}</p>
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {user?.roles.map(r => (
                                                            <span key={r} className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-[9px] font-black uppercase">{r}</span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <Link to="/app/profile" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors font-semibold">
                                                        <UserCircle className="w-4 h-4" />
                                                        My Profile
                                                    </Link>
                                                    <Link to="/app/settings" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors font-semibold">
                                                        <Settings className="w-4 h-4" />
                                                        Settings
                                                    </Link>
                                                    <div className="h-[1px] bg-gray-50 mx-2 my-2" />
                                                    <button
                                                        onClick={() => {
                                                            setIsProfileOpen(false);
                                                            signOut();
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        Sign Out
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </header>

                <AnimatePresence>
                    {isSearchOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white border-b border-gray-100 p-4 md:hidden sticky top-20 z-10"
                        >
                            <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3 ring-1 ring-gray-100">
                                <Search className="w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search anything..."
                                    className="bg-transparent border-none text-base focus:ring-0 placeholder:text-gray-400 w-full"
                                    autoFocus
                                />
                                <button onClick={() => setIsSearchOpen(false)}>
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Content View */}
                <main className="flex-1 p-4 sm:p-8 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
