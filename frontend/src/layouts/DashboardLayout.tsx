import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/theme/useTheme';
import { useSettingsStore } from '../store/settings.store';
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
    Building,
    AlertCircle,
    History,
    Command,
    ChevronLeft,
    ChevronRight,
    Star,
    SlidersHorizontal,
    MessageSquare,
    CheckSquare,
    Sparkles,
    Palette,
    Moon,
    Sun,
    HelpCircle,
    Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CommandPalette } from '../components/search/CommandPalette';
import { useCommandPalette } from '../hooks/layout/useCommandPalette';
import { NotificationCenter } from '../features/notifications/NotificationCenter';
import { useNotificationStore } from '../store/notification.store';
import { Breadcrumb } from '../components/navigation/Breadcrumb';
import { useNavigationStore } from '../store/navigation.store';
import { ROUTE_LABEL_MAP } from '../lib/breadcrumb';
import { useWorkspaceOptional } from '../modules/common/workspace/WorkspaceContext';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '../components/ui/dropdown-menu';
import { Button } from '../components/ui/button';

export const DashboardLayout = () => {
    const { user, signOut, hasPermission, hasRole, systemMode } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Core states
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [sidebarSearch, setSidebarSearch] = useState('');
    const [favorites, setFavorites] = useState<string[]>(() => {
        try {
            return JSON.parse(localStorage.getItem('erp-favorites') || '[]');
        } catch {
            return [];
        }
    });
    
    // Preference states from global store
    const { theme, setTheme, colorPreset, setColorPreset, density, setDensity, reducedMotion, toggleReducedMotion } = useTheme();

    // Command palette, notification store, navigation visits
    const { isOpen: isPaletteOpen, open: openPalette, close: closePalette } = useCommandPalette();
    const workspace = useWorkspaceOptional();
    const { unreadCount, togglePanel: toggleNotifications } = useNotificationStore();
    const { trackVisit, recentlyVisited } = useNavigationStore();

    // Sync favorites to local storage
    useEffect(() => {
        localStorage.setItem('erp-favorites', JSON.stringify(favorites));
    }, [favorites]);

    // Track visit
    useEffect(() => {
        const segments = location.pathname.split('/').filter(Boolean);
        const lastSeg = segments[segments.length - 1];
        const label = ROUTE_LABEL_MAP[lastSeg] || lastSeg?.charAt(0).toUpperCase() + lastSeg?.slice(1) || 'Page';
        trackVisit(location.pathname, label);
    }, [location.pathname, trackVisit]);

    // Roles check
    const isAdmin = hasRole('ADMIN') || hasRole('HEAD_OF_INSTITUTE');
    const isFaculty = hasRole('FACULTY');
    const isStudent = hasRole('STUDENT');
    const isParent = hasRole('PARENT');
    const isTransportAdmin = hasRole('TRANSPORT_ADMIN');
    const isDriver = hasRole('BUS_DRIVER');
    const isExamAdmin = hasRole('EXAM_CELL_ADMIN');

    // Consolidated Admission Roles
    const isReceptionist = hasRole('RECEPTIONIST') || hasRole('FRONT_DESK');
    const isCounselor = hasRole('COUNSELOR') || hasRole('COUNSELLOR');
    const isAdmissionOfficer = hasRole('ADMISSION_OFFICER') || hasRole('ADMIN');
    const isExamCell = hasRole('EXAM_CELL') || hasRole('EXAM_CELL_ADMIN');
    const isPrincipal = hasRole('PRINCIPAL') || hasRole('HOI') || hasRole('HEAD_OF_INSTITUTE');
    const isFinance = hasRole('FINANCE_OFFICER') || hasRole('ACCOUNTANT');

    // Menu list
    const menuGroups = [
        // EXAM CELL ADMIN MENU
        ...(isExamAdmin ? [{
            label: 'Examination Cell',
            items: [
                { label: 'Overview', icon: LayoutDashboard, path: '/app/exam-admin/dashboard', permission: 'EXAM_VIEW' },
                { label: 'Timetable', icon: Calendar, path: '/app/admin/exams/timetable', permission: 'EXAM_VIEW' },
                { label: 'Seating', icon: Users, path: '/app/admin/exams/seating', permission: 'EXAM_VIEW' },
                { label: 'Question Papers', icon: ClipboardList, path: '/app/admin/exams/question-papers', permission: 'EXAM_VIEW' },
                { label: 'Results', icon: GraduationCap, path: '/app/admin/exams/results', permission: 'MARKS_VIEW' },
                { label: 'Analytics', icon: BarChart3, path: '/app/admin/exams/analytics', permission: 'EXAM_VIEW' },
                { label: 'Subject Management', icon: BookOpen, path: '/app/exams/subjects', permission: 'SUBJECT_VIEW' },
                { label: 'Exam Management', icon: FileText, path: '/app/exams/manage', permission: 'EXAM_VIEW' },
            ]
        }] : []),

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
                    { label: 'Attendance Dashboard', icon: BarChart3, path: '/app/attendance/admin/dashboard', permission: 'DASHBOARD_VIEW_ADMIN' },
                    { label: 'System Settings', icon: Settings, path: '/app/settings' },
                ]
            },
            {
                label: 'Finances',
                items: [
                    { label: 'Fee Management', icon: Coins, path: '/app/fees/structures', permission: 'FEES_SETUP' },
                    { label: 'Fee Ledger', icon: FileText, path: '/app/fees/ledger', permission: 'FEES_VIEW' },
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
                    { label: 'Assignments', icon: ClipboardList, path: '/app/student/assignments', permission: 'STUDENT_VIEW_SELF' },
                    { label: 'Academic History', icon: History, path: '/app/student/academic-history', permission: 'STUDENT_VIEW_SELF' },
                    { label: 'My Timetable', icon: Clock, path: '/app/timetable/my', permission: 'TIMETABLE_VIEW_SELF' },
                ]
            },
            {
                label: 'Exams & Results',
                items: [
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
                    { label: 'Academic History', icon: History, path: '/app/student/academic-history', permission: 'STUDENT_VIEW_SELF' },
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

        // RECEPTIONIST MENU
        ...(isReceptionist ? [
            {
                label: 'Reception Desk',
                items: [
                    { label: 'Walk-ins Log', icon: Users, path: '/app/admissions/inquiries' },
                    { label: 'New Inquiry', icon: FileText, path: '/app/admissions/inquiries#new' }
                ]
            }
        ] : []),

        // COUNSELOR MENU
        ...(isCounselor ? [
            {
                label: 'Counseling Desk',
                items: [
                    { label: 'Assigned Leads', icon: ClipboardList, path: '/app/admissions/inquiries' },
                    { label: 'Follow-up Scheduler', icon: Calendar, path: '/app/admissions/inquiries#calls' }
                ]
            }
        ] : []),

        // ADMISSION OFFICER MENU
        ...(isAdmissionOfficer ? [
            {
                label: 'Admissions Desk',
                items: [
                    { label: 'Overview', icon: LayoutDashboard, path: '/app/admissions/dashboard' },
                    { label: 'Applications Pipeline', icon: FileText, path: '/app/admissions/review' },
                    { label: 'Document Checklist', icon: ShieldCheck, path: '/app/admissions/verification' },
                    { label: 'Enrollment Handoff', icon: GraduationCap, path: '/app/admissions/enrollment' }
                ]
            }
        ] : []),

        // EXAM CELL DESK (ADMISSIONS ADDITIONS)
        ...(isExamCell ? [
            {
                label: 'Exam Cell Desk',
                items: [
                    { label: 'Entrance Exams', icon: Calendar, path: '/app/admissions/exams' },
                    { label: 'Interviews Panel', icon: Users, path: '/app/admissions/interviews' },
                    { label: 'Merit List Desk', icon: FileText, path: '/app/admissions/merit' },
                    { label: 'Offer Dispatch Desk', icon: GraduationCap, path: '/app/admissions/offers' }
                ]
            }
        ] : []),

        // PRINCIPAL / HOI MENU
        ...(isPrincipal ? [
            {
                label: 'Principal Desk',
                items: [
                    { label: 'Merit Approvals', icon: ShieldCheck, path: '/app/admissions/merit' },
                    { label: 'Offer Dispatch approvals', icon: FileText, path: '/app/admissions/offers' },
                    { label: 'Admissions Funnel', icon: BarChart3, path: '/app/admissions/analytics' }
                ]
            }
        ] : []),

        // FINANCE OFFICER MENU
        ...(isFinance ? [
            {
                label: 'Finance Desk',
                items: [
                    { label: 'Fee Collection', icon: Coins, path: '/app/admissions/fees' }
                ]
            }
        ] : []),
    ];

    // Filter menu items by sidebarSearch
    const filteredMenuGroups = menuGroups.map(group => {
        const matchingItems = group.items.filter(item => 
            item.label.toLowerCase().includes(sidebarSearch.toLowerCase())
        );
        return {
            ...group,
            items: matchingItems
        };
    }).filter(group => group.items.length > 0);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const toggleFavorite = (path: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setFavorites(prev => {
            if (prev.includes(path)) {
                return prev.filter(p => p !== path);
            }
            return [...prev, path];
        });
    };

    // Mobile Dynamic bottom nav generation
    const getMobileBottomNav = () => {
        if (isAdmin) {
            return [
                { label: 'Dashboard', icon: LayoutDashboard, path: '/app/dashboard' },
                { label: 'Admissions', icon: ClipboardList, path: '/app/admissions/review', permission: 'admission.review' },
                { label: 'Students', icon: Users, path: '/app/students', permission: 'STUDENT_VIEW' },
                { label: 'Attendance', icon: BarChart3, path: '/app/attendance/admin/dashboard', permission: 'DASHBOARD_VIEW_ADMIN' },
                { label: 'Settings', icon: Settings, path: '/app/settings' },
            ];
        }
        if (isParent) {
            return [
                { label: 'Home', icon: LayoutDashboard, path: '/app/dashboard' },
                { label: 'Children', icon: Users, path: '/app/students/my-children', permission: 'STUDENT_VIEW_SELF' },
                { label: 'Attendance', icon: Calendar, path: '/app/attendance/my', permission: 'ATTENDANCE_VIEW_SELF' },
                { label: 'Fees', icon: Coins, path: '/app/fees/my', permission: 'PAYMENT_VIEW_SELF' },
                { label: 'Profile', icon: UserCircle, path: '/app/profile' },
            ];
        }
        if (isFaculty) {
            return [
                { label: 'Dashboard', icon: LayoutDashboard, path: '/app/dashboard' },
                { label: 'Classes', icon: GraduationCap, path: '/app/academic/classes', permission: 'CLASS_VIEW' },
                { label: 'Attendance', icon: Calendar, path: '/app/attendance/mark', permission: 'ATTENDANCE_MARK' },
                { label: 'Exams', icon: FileText, path: '/app/exams/manage', permission: 'EXAM_VIEW' },
                { label: 'Profile', icon: UserCircle, path: '/app/profile' },
            ];
        }
        if (isStudent) {
            return [
                { label: 'Dashboard', icon: LayoutDashboard, path: '/app/dashboard' },
                { label: 'Timetable', icon: Clock, path: '/app/timetable/my', permission: 'TIMETABLE_VIEW_SELF' },
                { label: 'Exams', icon: GraduationCap, path: '/app/exams/results', permission: 'MARKS_VIEW' },
                { label: 'Attendance', icon: Calendar, path: '/app/attendance/my', permission: 'ATTENDANCE_VIEW_SELF' },
                { label: 'Profile', icon: UserCircle, path: '/app/profile' },
            ];
        }
        return [
            { label: 'Dashboard', icon: LayoutDashboard, path: '/app/dashboard' },
            { label: 'Profile', icon: UserCircle, path: '/app/profile' },
        ];
    };

    const mobileBottomNavItems = getMobileBottomNav().filter(item => 
        !item.permission || hasPermission(item.permission)
    );

    const SidebarItem = ({ item }: { item: any }) => {
        if (item.permission && !hasPermission(item.permission)) return null;

        const pathBase = item.path.split('#')[0];
        const pathHash = item.path.split('#')[1] ? '#' + item.path.split('#')[1] : '';
        const isActive = location.pathname === pathBase && (pathHash ? location.hash === pathHash : !location.hash);
        const isFav = favorites.includes(item.path);

        return (
            <Link
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all group relative ${isActive
                    ? 'bg-primary text-primary-foreground shadow-premium-md shadow-glow'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                onClick={() => setIsMobileMenuOpen(false)}
            >
                {isActive && (
                    <motion.div
                        layoutId="activeLeftIndicator"
                        className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r-md"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                )}
                
                <item.icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground/80 group-hover:text-primary'}`} />
                
                {isSidebarOpen && (
                    <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-bold text-xs tracking-wide flex-1 truncate"
                    >
                        {item.label}
                    </motion.span>
                )}

                {isSidebarOpen && (
                    <button
                        onClick={(e) => toggleFavorite(item.path, e)}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/20 text-muted-foreground/60 hover:text-yellow-500`}
                    >
                        <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-yellow-500 text-yellow-500 opacity-100' : ''}`} />
                    </button>
                )}
            </Link>
        );
    };

    return (
        <>
            <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-background transition-colors duration-300">
                {/* Desktop Collapsible Sidebar */}
                <motion.aside
                    initial={false}
                    animate={{ width: isSidebarOpen ? 280 : 80 }}
                    className="hidden lg:flex flex-col bg-white dark:bg-card border-r border-border/40 sticky top-0 h-screen z-30 transition-all duration-300 overflow-hidden"
                >
                    {/* Sidebar Brand Header */}
                    <div className="p-6 flex flex-col gap-2 shrink-0">
                        <div className="flex items-center gap-3 h-12">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-black text-xl shadow-premium-md shadow-glow shrink-0">
                                E
                            </div>
                            {isSidebarOpen && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col"
                                >
                                    <span className="font-black text-base text-gray-900 dark:text-white tracking-tight">EduTrack</span>
                                    <span className="text-[9px] font-black tracking-widest text-primary uppercase">Enterprise ERP</span>
                                </motion.div>
                            )}
                        </div>

                        {/* Exam Cell Identity Banner */}
                        {isExamAdmin && isSidebarOpen && (
                            <div className="mt-2 px-3 py-2 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-xl">
                                <h4 className="text-[10px] font-black text-purple-900 dark:text-purple-300 uppercase tracking-wide">Examination Cell</h4>
                                <p className="text-[8px] text-purple-600 dark:text-purple-400 font-bold">Controller of Examinations</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Search */}
                    {isSidebarOpen && (
                        <div className="px-4 mb-4 shrink-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                                <input
                                    type="text"
                                    placeholder="Filter navigation..."
                                    value={sidebarSearch}
                                    onChange={(e) => setSidebarSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50/50 dark:bg-muted/10 border border-border text-[11px] font-semibold rounded-xl focus:outline-none focus:border-primary focus:bg-white dark:focus:bg-background transition-all"
                                />
                            </div>
                        </div>
                    )}

                    {/* Sidebar Navigation Body */}
                    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 custom-scrollbar">
                        {/* Favorites Section */}
                        {favorites.length > 0 && isSidebarOpen && (
                            <div className="space-y-1 bg-yellow-500/5 p-2 rounded-2xl border border-yellow-500/10">
                                <div className="px-2 py-1 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-yellow-600">
                                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                    Favorites
                                </div>
                                <div className="space-y-0.5">
                                    {menuGroups.flatMap(g => g.items).filter(item => favorites.includes(item.path)).map((item, i) => (
                                        <SidebarItem key={`fav-${i}`} item={item} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recent History Section */}
                        {recentlyVisited && recentlyVisited.length > 0 && isSidebarOpen && (
                            <div className="space-y-1 p-2 rounded-2xl border border-border/40">
                                <div className="px-2 py-1 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                    <History className="w-3 h-3 text-muted-foreground" />
                                    Recents
                                </div>
                                <div className="space-y-0.5">
                                    {recentlyVisited.slice(0, 3).map((visit: { path: string; label: string }, i: number) => {
                                        // Match label with icon
                                        const matchingItem = menuGroups.flatMap(g => g.items).find(item => item.path === visit.path);
                                        const IconComponent = matchingItem?.icon || FileText;
                                        return (
                                            <Link
                                                key={`recent-${i}`}
                                                to={visit.path}
                                                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:bg-muted/40 hover:text-foreground truncate"
                                            >
                                                <IconComponent className="w-3.5 h-3.5 shrink-0 text-muted-foreground/60" />
                                                <span className="truncate">{visit.label}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Main Group Menus */}
                        {filteredMenuGroups.map((group, idx) => (
                            <div key={idx} className="space-y-1.5">
                                {isSidebarOpen && (
                                    <p className="px-3.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">
                                        {group.label}
                                    </p>
                                )}
                                <div className="space-y-0.5">
                                    {group.items.map((item, i) => (
                                        <SidebarItem key={i} item={item} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Collapse Sidebar Button at Bottom */}
                    <div className="p-4 border-t border-border/40 shrink-0 bg-white dark:bg-card">
                        <button
                            onClick={toggleSidebar}
                            className="w-full flex items-center justify-center p-2.5 rounded-xl bg-gray-50 dark:bg-muted/10 text-muted-foreground hover:text-primary transition-colors border border-border/40 shadow-premium-sm"
                        >
                            {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                    </div>
                </motion.aside>

                {/* Mobile Navigation Drawer / Menu overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="fixed inset-0 bg-black/45 backdrop-blur-sm z-40 lg:hidden"
                            />
                            <motion.aside
                                initial={{ x: -280 }}
                                animate={{ x: 0 }}
                                exit={{ x: -280 }}
                                className="fixed left-0 top-0 bottom-0 w-[280px] bg-white dark:bg-card z-50 lg:hidden flex flex-col p-6 shadow-premium-xl border-r border-border/40"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-black text-xl">E</div>
                                        <div className="flex flex-col">
                                            <span className="font-black text-base text-gray-900 dark:text-white leading-tight">EduTrack</span>
                                            <span className="text-[9px] font-black text-primary uppercase tracking-widest">Enterprise ERP</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-50 dark:bg-muted/10 border border-border rounded-xl">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-1">
                                    {menuGroups.map((group, idx) => (
                                        <div key={idx} className="space-y-1.5">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">{group.label}</p>
                                            <div className="space-y-0.5">
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


                {/* Main View Area */}
                <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
                    {/* Top navbar */}
                    <header className="bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-border/40 sticky top-0 z-20 transition-all duration-300">
                        <div className="h-20 px-4 sm:px-8 flex items-center justify-between">
                            
                            {/* Left: Mobile hamburger & Global Selectors */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsMobileMenuOpen(true)}
                                    className="lg:hidden p-2 text-muted-foreground hover:bg-muted/50 border border-border/40 rounded-xl"
                                >
                                    <Menu className="w-5 h-5" />
                                </button>

                                {/* Campus / Institution Selector */}
                                <div className="hidden sm:block">
                                    <select
                                        defaultValue="primary"
                                        className="bg-gray-50 dark:bg-muted/10 border border-border text-[11px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl outline-none focus:border-primary focus:bg-white transition-all cursor-pointer"
                                    >
                                        <option value="primary">🏛️ RR Village Campus</option>
                                        <option value="international">🏫 International Campus</option>
                                        <option value="prep">🏫 Prep School Campus</option>
                                    </select>
                                </div>

                                {/* Academic Year Switcher */}
                                <div className="hidden md:block">
                                    <select
                                        defaultValue="2026-27"
                                        className="bg-gray-50 dark:bg-muted/10 border border-border text-[11px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl outline-none focus:border-primary focus:bg-white transition-all cursor-pointer"
                                    >
                                        <option value="2025-26">AY 2025 – 26</option>
                                        <option value="2026-27">AY 2026 – 27</option>
                                        <option value="2027-28">AY 2027 – 28</option>
                                    </select>
                                </div>
                            </div>

                            {/* Right: Quick actions, notifications, preferences popover, profile dropdown */}
                            <div className="flex items-center gap-2 sm:gap-4">
                                {/* Global search trigger (⌘K) */}
                                <button
                                    onClick={() => workspace?.setSearchOpen(true) ?? openPalette()}
                                    className="bg-gray-50 dark:bg-muted/10 rounded-2xl px-4 py-2 hidden md:flex items-center gap-3 w-48 lg:w-56 ring-1 ring-border/40 hover:ring-primary/30 hover:bg-white dark:hover:bg-background transition-all group shrink-0"
                                >
                                    <Search className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                                    <span className="text-xs text-muted-foreground/60 flex-1 text-left font-semibold">Global search...</span>
                                    <kbd className="text-[9px] font-bold text-muted-foreground/50 bg-gray-200/50 dark:bg-muted/20 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-sans">
                                        <Command className="w-2.5 h-2.5" />K
                                    </kbd>
                                </button>
                                
                                <button
                                    onClick={() => workspace?.setSearchOpen(true)}
                                    className="md:hidden p-2 text-muted-foreground hover:bg-muted/50 border border-border/40 rounded-xl"
                                >
                                    <Search className="w-4.5 h-4.5" />
                                </button>

                                <button
                                    onClick={() => workspace?.setProductivityOpen(true)}
                                    className="hidden md:flex p-2 text-muted-foreground hover:bg-muted/50 border border-border/40 rounded-xl hover:text-primary transition-colors"
                                    title="Productivity Hub"
                                >
                                    <Sparkles className="w-4.5 h-4.5" />
                                </button>

                                {/* Theme Mode Switcher Popover */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl text-muted-foreground hover:bg-muted/50 border border-border/40">
                                            {theme === 'dark' ? <Moon className="w-4.5 h-4.5 text-primary" /> : <Sun className="w-4.5 h-4.5 text-yellow-500" />}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-2xl w-40">
                                        <DropdownMenuLabel className="text-[10px] font-black uppercase text-gray-400">Appearance Theme</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => setTheme('light')} className="text-xs font-semibold py-2 rounded-lg gap-2 cursor-pointer">
                                            <Sun className="w-4 h-4 text-yellow-500" /> Light
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setTheme('dark')} className="text-xs font-semibold py-2 rounded-lg gap-2 cursor-pointer">
                                            <Moon className="w-4 h-4 text-primary" /> Dark
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setTheme('system')} className="text-xs font-semibold py-2 rounded-lg gap-2 cursor-pointer">
                                            <Monitor className="w-4 h-4 text-muted-foreground" /> System Default
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Preferences Settings Popover (Inline presets configuration) */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl text-muted-foreground hover:bg-muted/50 border border-border/40">
                                            <SlidersHorizontal className="w-4.5 h-4.5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-2xl w-56 p-3">
                                        <DropdownMenuLabel className="text-[10px] font-black uppercase text-gray-400 mb-2">Accent Presets</DropdownMenuLabel>
                                        <div className="grid grid-cols-5 gap-1.5 mb-3">
                                            {(['blue', 'purple', 'emerald', 'slate', 'corporate'] as const).map(preset => {
                                                const colors: Record<string, string> = {
                                                    blue: 'bg-blue-600',
                                                    purple: 'bg-purple-600',
                                                    emerald: 'bg-emerald-600',
                                                    slate: 'bg-slate-500',
                                                    corporate: 'bg-slate-900 dark:bg-white'
                                                };
                                                return (
                                                    <button
                                                        key={preset}
                                                        onClick={() => setColorPreset(preset)}
                                                        className={`w-7 h-7 rounded-full ${colors[preset]} flex items-center justify-center border-2 ${colorPreset === preset ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-transparent hover:scale-105'} transition-all`}
                                                        title={`${preset.charAt(0).toUpperCase() + preset.slice(1)} Preset`}
                                                    >
                                                        {colorPreset === preset && <CheckSquare className="w-3.5 h-3.5 text-white mix-blend-difference" />}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <DropdownMenuSeparator />
                                        <DropdownMenuLabel className="text-[10px] font-black uppercase text-gray-400 mt-2">Layout Density</DropdownMenuLabel>
                                        <div className="flex gap-1 mt-1 mb-2">
                                            {(['compact', 'comfortable', 'spacious'] as const).map(d => (
                                                <button
                                                    key={d}
                                                    onClick={() => setDensity(d)}
                                                    className={`flex-1 py-1 rounded-lg text-[9px] font-black uppercase border transition-all ${density === d ? 'bg-primary text-white border-transparent' : 'bg-muted/30 text-muted-foreground border-border/40 hover:bg-muted/50'}`}
                                                >
                                                    {d}
                                                </button>
                                            ))}
                                        </div>

                                        <DropdownMenuSeparator />
                                        <div className="flex items-center justify-between py-1.5 mt-1.5">
                                            <span className="text-[10px] font-black uppercase text-gray-400">Reduced Motion</span>
                                            <button
                                                onClick={toggleReducedMotion}
                                                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ${reducedMotion ? 'bg-primary' : 'bg-gray-200 dark:bg-muted'}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full shadow-premium-sm transition-transform duration-200 ${reducedMotion ? 'translate-x-4' : ''}`} />
                                            </button>
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Message Center Alert Badge */}
                                <div className="relative">
                                    <button className="p-2.5 bg-gray-50 dark:bg-muted/10 text-muted-foreground rounded-xl hover:bg-white dark:hover:bg-muted/20 hover:shadow-premium-sm hover:text-primary transition-all border border-border/40">
                                        <MessageSquare className="w-4.5 h-4.5" />
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-card">
                                            5
                                        </span>
                                    </button>
                                </div>

                                {/* Notifications Center Slide Toggle */}
                                <div className="relative">
                                    <button
                                        onClick={toggleNotifications}
                                        className="p-2.5 bg-gray-50 dark:bg-muted/10 text-muted-foreground rounded-xl hover:bg-white dark:hover:bg-muted/20 hover:shadow-premium-sm hover:text-primary transition-all border border-border/40"
                                    >
                                        <Bell className="w-4.5 h-4.5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-card">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>
                                </div>

                                <div className="h-8 w-[1px] bg-border/40 hidden sm:block"></div>

                                {/* Modernized Profile Menu Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center gap-2.5 p-1.5 pl-3.5 bg-gray-50 dark:bg-muted/10 rounded-2xl border border-border/40 hover:bg-white dark:hover:bg-muted/20 hover:shadow-premium-md transition-all duration-200"
                                    >
                                        <div className="hidden sm:block text-right">
                                            <p className="text-xs font-black text-gray-900 dark:text-white leading-tight">{user?.full_name}</p>
                                            <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-0.5">{user?.roles?.[0]}</p>
                                        </div>
                                        <div className="w-9 h-9 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center text-primary shadow-premium-sm border border-primary/20 shrink-0 font-black text-xs">
                                            {user?.full_name?.charAt(0) || 'U'}
                                        </div>
                                        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground/60 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {isProfileOpen && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute right-0 mt-3 w-64 bg-white dark:bg-card rounded-3xl shadow-premium-xl border border-border/60 p-3 z-50 overflow-hidden"
                                                >
                                                    <div className="px-4 py-4 mb-2 bg-gray-50 dark:bg-muted/10 rounded-2xl border border-border/30">
                                                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Signed in as</p>
                                                        <p className="font-bold text-xs text-gray-900 dark:text-white truncate">{user?.email}</p>
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {user?.roles.map(r => (
                                                                <span key={r} className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/10 rounded-full text-[8px] font-black uppercase tracking-wide">{r}</span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-0.5">
                                                        <Link to="/app/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors font-bold">
                                                            <UserCircle className="w-4 h-4 text-muted-foreground/60" />
                                                            My Profile
                                                        </Link>
                                                        <Link to="/app/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-3.5 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors font-bold">
                                                            <Settings className="w-4 h-4 text-muted-foreground/60" />
                                                            Settings
                                                        </Link>
                                                        <div className="h-[1px] bg-border/40 mx-2 my-2" />
                                                        <button
                                                            onClick={() => {
                                                                setIsProfileOpen(false);
                                                                signOut();
                                                            }}
                                                            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors font-bold"
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

                    {/* Breadcrumb — auto-generated from current URL */}
                    <Breadcrumb />

                    {/* Mobile Quick Search Input Box */}
                    <AnimatePresence>
                        {isSearchOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-white dark:bg-card border-b border-border/40 p-4 md:hidden sticky top-20 z-10"
                            >
                                <div className="bg-gray-50 dark:bg-muted/10 rounded-xl px-4 py-3 flex items-center gap-3 border border-border">
                                    <Search className="w-4.5 h-4.5 text-muted-foreground/60" />
                                    <input
                                        type="text"
                                        placeholder="Search catalog..."
                                        className="bg-transparent border-none text-xs font-semibold focus:ring-0 placeholder:text-muted-foreground/60 w-full outline-none"
                                        autoFocus
                                    />
                                    <button onClick={() => setIsSearchOpen(false)}>
                                        <X className="w-4.5 h-4.5 text-muted-foreground/60" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Main Dynamic Panel Outlet */}
                    <main className="flex-1 p-4 sm:p-8 overflow-x-hidden">
                        <div className="max-w-7xl mx-auto">
                            <Outlet />
                        </div>
                    </main>
                </div>

                {/* Mobile Bottom Navigation Bar (Dynamic role-based bottom bar) */}
                <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-card/90 backdrop-blur-md border-t border-border/40 z-30 flex items-center justify-around px-2 lg:hidden shadow-premium-lg">
                    {mobileBottomNavItems.map((item, idx) => {
                        const pathBase = item.path.split('#')[0];
                        const isActive = location.pathname === pathBase;
                        return (
                            <Link
                                key={idx}
                                to={item.path}
                                className={`flex flex-col items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl transition-all relative ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                                <span className={`text-[9px] font-black tracking-wide ${isActive ? 'opacity-100' : 'opacity-80 font-bold'}`}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <motion.div
                                        layoutId="activeBottomIndicator"
                                        className="absolute -top-1 left-2 right-2 h-0.5 bg-primary rounded-full"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Global — CommandPalette (Ctrl+K) */}
            <CommandPalette isOpen={isPaletteOpen} onClose={closePalette} />

            {/* Global — NotificationCenter slide-over */}
            <NotificationCenter />
        </>
    );
};
