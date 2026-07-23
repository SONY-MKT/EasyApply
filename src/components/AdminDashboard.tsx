import { motion, AnimatePresence, Reorder } from 'motion/react';
import { toast, Toaster } from 'react-hot-toast';
import React, { useState, useEffect, useMemo } from 'react';
import { LoanApplication, AppSettings, ActivityLog } from '../types';
import { defaultSettings } from '../defaultSettings';
import { subscribeToSettings, subscribeToApplications, updateApplication, deleteApplication as dbDeleteApplication, updateSettings, subscribeToLogs, addActivityLog } from '../lib/db';
import { RichTextEditor } from './RichTextEditor';
import XLSX from 'xlsx-js-style';
import { Search, ChevronDown, CheckCircle, XCircle, Clock, Trash2, Edit, LayoutDashboard, FileText, Settings, Eye, EyeOff, Download, X, Lock, Megaphone, PhoneCall, GripVertical, Users, UserPlus, Image, Box, User, Filter, ChevronLeft, ChevronRight, Activity, Upload, LogOut, FileSpreadsheet, Table, Send, CalendarDays, DollarSign, ShieldCheck, ArrowLeft, LogIn, AlertCircle, KeyRound, Menu, Plus, MessageSquare } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell, PieChart, Pie } from 'recharts';
import AmortizationScheduleModal from './AmortizationScheduleModal';
import { testTelegramNotification, sendTelegramStatusUpdateNotification, registerTelegramWebhook } from '../lib/telegram';

const getStatusBadge = (status: LoanApplication['status']) => {
    switch(status) {
      case 'disbursed':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white border border-blue-700"><CheckCircle size={14} /> Disbursed</span>;
      case 'approved':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200"><CheckCircle size={14} /> Approved</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200"><XCircle size={14} /> Rejected</span>;
      case 'reviewing':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200"><Clock size={14} /> Reviewing</span>;
      case 'submitted':
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200"><Clock size={14} /> Submitted</span>;
    }
  };

const StatusDropdown = ({ value, onChange }: { value: LoanApplication['status'], onChange: (v: LoanApplication['status']) => void }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const statuses: { value: LoanApplication['status'], label: string }[] = [
    { value: 'submitted', label: 'Submitted' },
    { value: 'reviewing', label: 'Reviewing' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'disbursed', label: 'Disbursed' }
  ];

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1">
        {getStatusBadge(value)}
        <ChevronDown size={14} className="text-gray-500" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="origin-top-right absolute right-0 mt-2 w-40 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-50 overflow-hidden"
          >
            <div className="py-1 relative z-50">
              {statuses.map(s => (
                <div 
                  key={s.value} 
                  onClick={() => { onChange(s.value); setIsOpen(false); }}
                  className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 flex items-center gap-2.5 transition-colors ${value === s.value ? 'bg-gray-50 font-bold text-gray-900' : 'text-gray-600 font-medium'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    s.value === 'approved' ? 'bg-green-500' :
                    s.value === 'rejected' ? 'bg-red-500' :
                    s.value === 'disbursed' ? 'bg-blue-600' :
                    s.value === 'reviewing' ? 'bg-blue-400' :
                    'bg-gray-400'
                  }`}></span>
                  {s.label}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CustomSelect = ({ value, onChange, options, className }: { value: string, onChange: (v: string) => void, options: { value: string, label: string }[], className?: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div className={`relative ${className || ''}`} ref={containerRef}>
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-shadow"
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full min-w-max mt-1 bg-white border border-gray-100 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden"
          >
            <div className="py-1 max-h-60 overflow-y-auto">
              {options.map(o => (
                <div 
                  key={o.value} 
                  onClick={() => { onChange(o.value); setIsOpen(false); }}
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors flex items-center ${value === o.value ? 'bg-red-50 text-red-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {o.label}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface AdminUser {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: 'Admin' | 'Staff';
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [activeTab, setActiveTab] = useState<'dashboard' | 'applications' | 'products' | 'promotions' | 'users' | 'logs' | 'contact' | 'settings'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectAppId, setRejectAppId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Activity Logs State
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const logActivity = (action: string, details: string, userOverride?: AdminUser) => {
    const userToLog = userOverride || currentUser;
    if (!userToLog) return;
    addActivityLog({
      userId: userToLog.id,
      userName: userToLog.name || userToLog.username,
      action,
      details,
      timestamp: new Date().toISOString()
    }).catch(console.error);
  };

  // Users State
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('admin_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch(e) {}
    }
    return [{ id: '1', name: 'Administrator', username: 'admin', password: 'password', role: 'Admin' }];
  });

  const handleSaveUsers = (newUsers: AdminUser[]) => {
    setAdminUsers(newUsers);
    localStorage.setItem('admin_users', JSON.stringify(newUsers));
  };

  // Settings State
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(settings);
      toast.success('Settings saved successfully');
      logActivity('Update Settings', 'Updated application settings configuration');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };
  const [isEditing, setIsEditing] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<LoanApplication>>({});

  // Advanced Export Modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDateRange, setExportDateRange] = useState<'all' | 'today' | 'this_week' | 'this_month' | 'custom'>('all');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportStatus, setExportStatus] = useState<string>('all');
  const [exportProductId, setExportProductId] = useState<string>('all');
  const [exportMinAmount, setExportMinAmount] = useState<string>('');
  const [exportMaxAmount, setExportMaxAmount] = useState<string>('');
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [isRegisteringWebhook, setIsRegisteringWebhook] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = adminUsers.find(u => u.username === username);
    if (!user) {
      setError('Invalid username or password');
      return;
    }
    const userPassword = user.password || '123456';
    if (password === userPassword) {
      setIsAuthenticated(true);
      setCurrentUser(user);
      setError('');
      logActivity('User Login', `User ${user.username} logged in successfully`, user);
    } else {
      setError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      logActivity('User Logout', `User ${currentUser.username} logged out`);
    }
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    setCurrentUser(null);
    toast.success('Logged out successfully');
  };

  useEffect(() => {
    // Only subscribe to logs and apps if authenticated (for security & cost)
    if (!isAuthenticated) return;
    
    const unsubscribeApps = subscribeToApplications(setApplications);
    const unsubscribeLogs = subscribeToLogs(setActivityLogs);
    
    return () => {
      unsubscribeApps();
      unsubscribeLogs();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    // We should load settings even if not authenticated so login page has correct styling
    const unsubscribeSettings = subscribeToSettings(setSettings);
    return () => unsubscribeSettings();
  }, []);

  const handleStatusChange = (id: string, newStatus: LoanApplication['status']) => {
    if (newStatus === 'rejected') {
      setRejectAppId(id);
      setRejectReason('');
      setShowRejectModal(true);
    } else {
      updateStatus(id, newStatus);
    }
  };

  const updateStatus = async (id: string, newStatus: LoanApplication['status'], reason?: string) => {
    try {
      const appToUpdate = applications.find(a => a.id === id);
      if (!appToUpdate) return;
      const newTimestamps = {
        ...(appToUpdate.statusTimestamps || {}),
        [newStatus]: new Date().toISOString()
      };
      
      const updates: Partial<LoanApplication> = {
        status: newStatus,
        statusTimestamps: newTimestamps
      };
      
      if (newStatus === 'rejected' && reason) {
        updates.rejectionReason = reason;
      }
      
      await updateApplication(id, updates);
      
      toast.success('Status updated successfully');
      logActivity('Update Status', `Updated application ${id} to ${newStatus}`);

      const notifyResult = await sendTelegramStatusUpdateNotification(settings, appToUpdate, newStatus, reason, currentUser?.name);
      if (!notifyResult) {
        if (!appToUpdate.telegramUserId) {
          toast.info("No Telegram ID linked to this application");
        } else {
          toast.error("Failed to send Telegram notification");
        }
      } else {
        toast.success("Notification sent to user");
      }
      
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp({
          ...selectedApp,
          ...updates
        } as LoanApplication);
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const confirmReject = async () => {
    if (rejectAppId) {
      await updateStatus(rejectAppId, 'rejected', rejectReason);
      setShowRejectModal(false);
      setRejectAppId(null);
      setRejectReason('');
    }
  };

  const deleteApplication = async (id: string) => {
    try {
      await dbDeleteApplication(id);
      toast.success('Application deleted successfully');
      logActivity('Delete Application', `Deleted application ${id}`);
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp(null);
      }
    } catch (err) {
      toast.error('Failed to delete application');
    }
  };

  const handleEditSave = async () => {
    if (!selectedApp) return;
    try {
      await updateApplication(selectedApp.id, editForm);
      const updatedApp = { ...selectedApp, ...editForm } as LoanApplication;
      toast.success('Details updated successfully');
      logActivity('Edit Application', `Edited details for application ${selectedApp.id}`);
      setSelectedApp(updatedApp);
      setIsEditing(false);
    } catch (err) {
      toast.error('Failed to update details');
    }
  };

  const startEditing = () => {
    if (!selectedApp) return;
    setEditForm(selectedApp);
    setIsEditing(true);
  };

  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      // Search filter
      const matchesSearch = 
        app.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.phone.includes(searchTerm);

      // Status filter
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

      // Product filter
      const matchesProduct = productFilter === 'all' || app.productId === productFilter;

      // Date filter
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const appDate = new Date(app.appliedAt).getTime();
        const now = new Date().getTime();
        const diffDays = (now - appDate) / (1000 * 3600 * 24);
        
        if (dateFilter === 'today') {
          matchesDate = new Date(app.appliedAt).toDateString() === new Date().toDateString();
        } else if (dateFilter === '7days') {
          matchesDate = diffDays <= 7;
        } else if (dateFilter === '30days') {
          matchesDate = diffDays <= 30;
        }
      }

      return matchesSearch && matchesStatus && matchesProduct && matchesDate;
    });
  }, [applications, searchTerm, statusFilter, productFilter, dateFilter]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, productFilter, dateFilter]);

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  
  const paginatedApps = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredApps.slice(start, start + itemsPerPage);
  }, [filteredApps, currentPage, itemsPerPage]);


  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter(a => ['submitted', 'reviewing'].includes(a.status)).length;
    const approved = applications.filter(a => a.status === 'approved').length;
    const totalAmount = applications.reduce((sum, a) => sum + a.amount, 0);
    return { total, pending, approved, totalAmount };
  }, [applications]);

  const chartData = useMemo(() => {
    const statusData = [
      { name: 'Submitted', value: applications.filter(a => a.status === 'submitted').length, color: '#6b7280' },
      { name: 'Reviewing', value: applications.filter(a => a.status === 'reviewing').length, color: '#3b82f6' },
      { name: 'Approved', value: applications.filter(a => a.status === 'approved').length, color: '#22c55e' },
      { name: 'Rejected', value: applications.filter(a => a.status === 'rejected').length, color: '#ef4444' },
      { name: 'Disbursed', value: applications.filter(a => a.status === 'disbursed').length, color: '#2563eb' }
    ].filter(d => d.value > 0);

    if (statusData.length === 0) {
      statusData.push({ name: 'No Data', value: 1, color: '#e5e7eb' });
    }

    const productDataMap: Record<string, number> = {};
    const productColors = ['#f43f5e', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#64748b'];
    
    settings.products.forEach(p => {
      productDataMap[p.id] = 0;
    });

    let hasProductData = false;
    applications.forEach(app => {
      if (app.productId) {
        productDataMap[app.productId] = (productDataMap[app.productId] || 0) + 1;
        hasProductData = true;
      }
    });

    const productData = Object.entries(productDataMap).map(([id, count], index) => ({
      name: settings.products.find(p => p.id === id)?.nameEn || 'Other',
      value: count,
      color: productColors[index % productColors.length]
    })).filter(d => d.value > 0);

    if (!hasProductData) {
      productData.push({ name: 'No Data', value: 1, color: '#e5e7eb' });
    }

    const timeDataMap: Record<string, number> = {};
    const sortedApps = [...applications].sort((a, b) => new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime());
    
    // Create an empty chart for the last 7 days if there is no data
    if (sortedApps.length === 0) {
      for(let i=6; i>=0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        timeDataMap[dateStr] = 0;
      }
    }

    sortedApps.forEach(app => {
      const dateStr = new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      timeDataMap[dateStr] = (timeDataMap[dateStr] || 0) + 1;
    });

    const timeData = Object.entries(timeDataMap).map(([date, count]) => ({
      date,
      applications: count
    }));

    return { statusData, timeData, productData };
  }, [applications, settings.products]);

  const exportFilteredApps = useMemo(() => {
    return applications.filter(app => {
      // Status Filter
      if (exportStatus !== 'all' && app.status !== exportStatus) return false;

      // Product Filter
      if (exportProductId !== 'all' && app.productId !== exportProductId) return false;

      // Amount Filter
      if (exportMinAmount && Number(app.amount) < Number(exportMinAmount)) return false;
      if (exportMaxAmount && Number(app.amount) > Number(exportMaxAmount)) return false;

      // Date Range Filter
      if (exportDateRange !== 'all') {
        const appTime = new Date(app.appliedAt).getTime();
        const now = new Date();

        if (exportDateRange === 'today') {
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
          if (appTime < todayStart) return false;
        } else if (exportDateRange === 'this_week') {
          const day = now.getDay();
          const diff = now.getDate() - day + (day === 0 ? -6 : 1);
          const monday = new Date(now.setDate(diff));
          monday.setHours(0, 0, 0, 0);
          if (appTime < monday.getTime()) return false;
        } else if (exportDateRange === 'this_month') {
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
          if (appTime < monthStart) return false;
        } else if (exportDateRange === 'custom') {
          if (exportStartDate) {
            const start = new Date(exportStartDate).getTime();
            if (appTime < start) return false;
          }
          if (exportEndDate) {
            const end = new Date(exportEndDate).getTime() + (24 * 60 * 60 * 1000 - 1);
            if (appTime > end) return false;
          }
        }
      }

      return true;
    });
  }, [applications, exportStatus, exportProductId, exportMinAmount, exportMaxAmount, exportDateRange, exportStartDate, exportEndDate]);

  const exportToExcel = (customList?: LoanApplication[]) => {
    const appsToExport = customList || (filteredApps.length > 0 ? filteredApps : applications);
    if (appsToExport.length === 0) {
      toast.error('No applications available to export');
      return;
    }

    const formatDocName = (docStr: string, idx: number) => {
      if (!docStr) return '';
      if (docStr.includes('|||')) {
        return docStr.split('|||')[0];
      }
      if (docStr.startsWith('data:image')) {
        return `Image ${idx + 1}`;
      }
      if (docStr.startsWith('http://') || docStr.startsWith('https://')) {
        const parts = docStr.split('/');
        return parts[parts.length - 1] || `File ${idx + 1}`;
      }
      return docStr.length > 25 ? `Doc_${idx + 1}` : docStr;
    };

    const totalAmount = appsToExport.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
    const totalIncome = appsToExport.reduce((sum, a) => sum + (Number(a.monthlyIncome) || 0), 0);

    const aoa: any[][] = [];

    // Row 0: Executive Header Banner
    aoa.push([
      {
        v: `  ${settings.appName || 'HFC Microfinance'} — LOAN APPLICATIONS REPORT`,
        t: 's',
        s: {
          font: { name: 'Katumroy Pro', sz: 15, bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '991B1B' } }, // Premium HFC Red
          alignment: { horizontal: 'left', vertical: 'center' }
        }
      }
    ]);

    // Row 1: Subheader KPI Bar
    aoa.push([
      {
        v: `Export Date: ${new Date().toLocaleString('en-US')}`,
        t: 's',
        s: {
          font: { name: 'Katumroy Pro', sz: 10, bold: true, color: { rgb: '475569' } },
          fill: { fgColor: { rgb: 'F1F5F9' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: { top: { style: 'thin', color: { rgb: 'CBD5E1' } }, bottom: { style: 'thin', color: { rgb: 'CBD5E1' } }, left: { style: 'thin', color: { rgb: 'CBD5E1' } }, right: { style: 'thin', color: { rgb: 'CBD5E1' } } }
        }
      },
      '', '',
      {
        v: `Total Applications: ${appsToExport.length} Record(s)`,
        t: 's',
        s: {
          font: { name: 'Katumroy Pro', sz: 10, bold: true, color: { rgb: '0F172A' } },
          fill: { fgColor: { rgb: 'F1F5F9' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: { top: { style: 'thin', color: { rgb: 'CBD5E1' } }, bottom: { style: 'thin', color: { rgb: 'CBD5E1' } }, left: { style: 'thin', color: { rgb: 'CBD5E1' } }, right: { style: 'thin', color: { rgb: 'CBD5E1' } } }
        }
      },
      '', '',
      {
        v: `Total Loan Portfolio: $${totalAmount.toLocaleString('en-US')}`,
        t: 's',
        s: {
          font: { name: 'Katumroy Pro', sz: 10, bold: true, color: { rgb: '15803D' } },
          fill: { fgColor: { rgb: 'F1F5F9' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: { top: { style: 'thin', color: { rgb: 'CBD5E1' } }, bottom: { style: 'thin', color: { rgb: 'CBD5E1' } }, left: { style: 'thin', color: { rgb: 'CBD5E1' } }, right: { style: 'thin', color: { rgb: 'CBD5E1' } } }
        }
      },
      '', '',
      {
        v: `Generated By: System Administrator`,
        t: 's',
        s: {
          font: { name: 'Katumroy Pro', sz: 10, bold: true, color: { rgb: '475569' } },
          fill: { fgColor: { rgb: 'F1F5F9' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: { top: { style: 'thin', color: { rgb: 'CBD5E1' } }, bottom: { style: 'thin', color: { rgb: 'CBD5E1' } }, left: { style: 'thin', color: { rgb: 'CBD5E1' } }, right: { style: 'thin', color: { rgb: 'CBD5E1' } } }
        }
      },
      '', ''
    ]);

    // Row 2: Empty Spacer
    aoa.push([]);

    // Row 3: Table Headers
    const headers = [
      'No.', 'Application ID', 'Applicant Name', 'Phone Number',
      'Product Name', 'Amount ($)', 'Term (M)', 'Monthly Income ($)',
      'Address', 'Status', 'Attached Documents', 'Applied Date'
    ];

    aoa.push(
      headers.map(h => ({
        v: h,
        t: 's',
        s: {
          font: { name: 'Katumroy Pro', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '0F172A' } }, // Executive Slate Navy Header
          alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
          border: {
            top: { style: 'medium', color: { rgb: '0F172A' } },
            bottom: { style: 'medium', color: { rgb: '0F172A' } },
            left: { style: 'thin', color: { rgb: '334155' } },
            right: { style: 'thin', color: { rgb: '334155' } }
          }
        }
      }))
    );

    // Row 4+: Data Rows with Zebra Striping and Color Badge Statuses
    appsToExport.forEach((app, idx) => {
      const isEven = idx % 2 === 0;
      const bgRgb = isEven ? 'FFFFFF' : 'F8FAFC';

      let statusBg = 'FEF3C7';
      let statusColor = '92400E';
      let statusText = 'Reviewing';

      if (app.status === 'disbursed') {
        statusBg = 'E0E7FF';
        statusColor = '3730A3';
        statusText = 'Disbursed';
      } else if (app.status === 'approved') {
        statusBg = 'DCFCE7';
        statusColor = '166534';
        statusText = 'Approved';
      } else if (app.status === 'rejected') {
        statusBg = 'FEE2E2';
        statusColor = '991B1B';
        statusText = 'Rejected';
      }

      const borderStyle = {
        top: { style: 'thin', color: { rgb: 'E2E8F0' } },
        bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
        left: { style: 'thin', color: { rgb: 'E2E8F0' } },
        right: { style: 'thin', color: { rgb: 'E2E8F0' } }
      };

      const docNames = app.documents && app.documents.length > 0
        ? `${app.documents.length} File(s): ${app.documents.map((d, i) => formatDocName(d, i)).join(', ')}`
        : 'None';

      const productName = app.productNameKh || app.productNameEn || (
        settings.products?.find(p => p.id === app.productId)?.nameKh ||
        settings.products?.find(p => p.id === app.productId)?.nameEn || 'N/A'
      );

      aoa.push([
        // No.
        { v: idx + 1, t: 'n', s: { font: { name: 'Katumroy Pro', sz: 10, color: { rgb: '64748B' } }, fill: { fgColor: { rgb: bgRgb } }, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle } },
        // Application ID
        { v: app.id, t: 's', s: { font: { name: 'Katumroy Pro', sz: 10, bold: true, color: { rgb: '0F172A' } }, fill: { fgColor: { rgb: bgRgb } }, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle } },
        // Applicant Name
        { v: app.applicantName || 'N/A', t: 's', s: { font: { name: 'Katumroy Pro', sz: 10, bold: true, color: { rgb: '0F172A' } }, fill: { fgColor: { rgb: bgRgb } }, alignment: { horizontal: 'left', vertical: 'center' }, border: borderStyle } },
        // Phone Number
        { v: app.phone || 'N/A', t: 's', s: { font: { name: 'Katumroy Pro', sz: 10, color: { rgb: '334155' } }, fill: { fgColor: { rgb: bgRgb } }, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle } },
        // Product Name
        { v: productName, t: 's', s: { font: { name: 'Katumroy Pro', sz: 10, color: { rgb: '334155' } }, fill: { fgColor: { rgb: bgRgb } }, alignment: { horizontal: 'left', vertical: 'center' }, border: borderStyle } },
        // Amount ($)
        { v: Number(app.amount) || 0, t: 'n', z: '$#,##0.00', s: { font: { name: 'Katumroy Pro', sz: 10, bold: true, color: { rgb: '15803D' } }, fill: { fgColor: { rgb: bgRgb } }, alignment: { horizontal: 'right', vertical: 'center' }, border: borderStyle } },
        // Term (Months)
        { v: Number(app.termMonths) || 0, t: 'n', s: { font: { name: 'Katumroy Pro', sz: 10, color: { rgb: '334155' } }, fill: { fgColor: { rgb: bgRgb } }, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle } },
        // Monthly Income ($)
        { v: Number(app.monthlyIncome) || 0, t: 'n', z: '$#,##0.00', s: { font: { name: 'Katumroy Pro', sz: 10, color: { rgb: '0F172A' } }, fill: { fgColor: { rgb: bgRgb } }, alignment: { horizontal: 'right', vertical: 'center' }, border: borderStyle } },
        // Address
        { v: app.address || 'N/A', t: 's', s: { font: { name: 'Katumroy Pro', sz: 10, color: { rgb: '475569' } }, fill: { fgColor: { rgb: bgRgb } }, alignment: { horizontal: 'left', vertical: 'center' }, border: borderStyle } },
        // Status Badge
        { v: statusText, t: 's', s: { font: { name: 'Katumroy Pro', sz: 10, bold: true, color: { rgb: statusColor } }, fill: { fgColor: { rgb: statusBg } }, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle } },
        // Documents
        { v: docNames, t: 's', s: { font: { name: 'Katumroy Pro', sz: 9, color: { rgb: '475569' } }, fill: { fgColor: { rgb: bgRgb } }, alignment: { horizontal: 'left', vertical: 'center', wrapText: true }, border: borderStyle } },
        // Applied Date
        { v: new Date(app.appliedAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), t: 's', s: { font: { name: 'Katumroy Pro', sz: 9, color: { rgb: '64748B' } }, fill: { fgColor: { rgb: bgRgb } }, alignment: { horizontal: 'center', vertical: 'center' }, border: borderStyle } }
      ]);
    });

    // Summary Total Footer Row
    aoa.push([]);

    const totalBorderStyle = {
      top: { style: 'medium', color: { rgb: '991B1B' } },
      bottom: { style: 'double', color: { rgb: '991B1B' } },
      left: { style: 'thin', color: { rgb: 'CBD5E1' } },
      right: { style: 'thin', color: { rgb: 'CBD5E1' } }
    };

    const grandTotalBg = 'FEF2F2'; // Soft Crimson tint for summary

    aoa.push([
      { v: 'GRAND TOTAL / សរុប', t: 's', s: { font: { name: 'Katumroy Pro', sz: 11, bold: true, color: { rgb: '991B1B' } }, fill: { fgColor: { rgb: grandTotalBg } }, alignment: { horizontal: 'left', vertical: 'center' }, border: totalBorderStyle } },
      { v: '', t: 's', s: { fill: { fgColor: { rgb: grandTotalBg } }, border: totalBorderStyle } },
      { v: '', t: 's', s: { fill: { fgColor: { rgb: grandTotalBg } }, border: totalBorderStyle } },
      { v: '', t: 's', s: { fill: { fgColor: { rgb: grandTotalBg } }, border: totalBorderStyle } },
      { v: `Applications: ${appsToExport.length}`, t: 's', s: { font: { name: 'Katumroy Pro', sz: 10, bold: true, color: { rgb: '0F172A' } }, fill: { fgColor: { rgb: grandTotalBg } }, alignment: { horizontal: 'right', vertical: 'center' }, border: totalBorderStyle } },
      { v: totalAmount, t: 'n', z: '$#,##0.00', s: { font: { name: 'Katumroy Pro', sz: 11, bold: true, color: { rgb: '16A34A' } }, fill: { fgColor: { rgb: grandTotalBg } }, alignment: { horizontal: 'right', vertical: 'center' }, border: totalBorderStyle } },
      { v: '', t: 's', s: { fill: { fgColor: { rgb: grandTotalBg } }, border: totalBorderStyle } },
      { v: totalIncome, t: 'n', z: '$#,##0.00', s: { font: { name: 'Katumroy Pro', sz: 10, bold: true, color: { rgb: '0F172A' } }, fill: { fgColor: { rgb: grandTotalBg } }, alignment: { horizontal: 'right', vertical: 'center' }, border: totalBorderStyle } },
      { v: '', t: 's', s: { fill: { fgColor: { rgb: grandTotalBg } }, border: totalBorderStyle } },
      { v: '', t: 's', s: { fill: { fgColor: { rgb: grandTotalBg } }, border: totalBorderStyle } },
      { v: '', t: 's', s: { fill: { fgColor: { rgb: grandTotalBg } }, border: totalBorderStyle } },
      { v: '', t: 's', s: { fill: { fgColor: { rgb: grandTotalBg } }, border: totalBorderStyle } }
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);

    // Apply cell merges for header banner & metadata bar & Grand Total
    const totalRowIndex = aoa.length - 1;

    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }, // Title row merge A1:L1
      { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },  // A2:C2 Export Date
      { s: { r: 1, c: 3 }, e: { r: 1, c: 5 } },  // D2:F2 Total Apps
      { s: { r: 1, c: 6 }, e: { r: 1, c: 8 } },  // G2:I2 Total Amount
      { s: { r: 1, c: 9 }, e: { r: 1, c: 11 } }, // J2:L2 Status
      { s: { r: totalRowIndex, c: 0 }, e: { r: totalRowIndex, c: 3 } } // Merge A-D for Grand Total label
    ];

    // Custom Row Heights for Generous Padding
    worksheet['!rows'] = [
      { hpt: 32 }, // Row 0 Title
      { hpt: 24 }, // Row 1 KPI
      { hpt: 10 }, // Row 2 Spacer
      { hpt: 28 }, // Row 3 Headers
      ...appsToExport.map(() => ({ hpt: 22 })), // Data rows
      { hpt: 10 }, // Spacer
      { hpt: 26 }  // Total Row
    ];

    // Ensure grid lines are visible in Excel
    worksheet['!views'] = [{ showGridLines: true }];

    // Auto Column Widths
    worksheet['!cols'] = [
      { wch: 6 },   // No.
      { wch: 18 },  // Application ID
      { wch: 24 },  // Applicant Name
      { wch: 16 },  // Phone Number
      { wch: 22 },  // Product Name
      { wch: 16 },  // Amount ($)
      { wch: 10 },  // Term (M)
      { wch: 18 },  // Monthly Income ($)
      { wch: 28 },  // Address
      { wch: 14 },  // Status
      { wch: 38 },  // Documents
      { wch: 22 },  // Applied Date
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Applications');

    const fileName = `Loan_Applications_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast.success(`Exported ${appsToExport.length} applications to styled Excel report!`);
    logActivity('Export Excel', `Exported ${appsToExport.length} applications to styled Excel file`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans p-4 sm:p-6 relative overflow-hidden select-none">
        <Toaster position="top-center" toastOptions={{ className: 'text-sm font-medium rounded-xl shadow-lg border border-gray-100' }} />
        <style dangerouslySetInnerHTML={{__html: `
          .text-red-600 { color: ${settings.primaryColor} !important; }
          .bg-red-600 { background-color: ${settings.primaryColor} !important; }
          .border-red-600 { border-color: ${settings.primaryColor} !important; }
          .ring-red-500 { --tw-ring-color: ${settings.primaryColor} !important; }
          .focus\\:border-red-500:focus { border-color: ${settings.primaryColor} !important; }
          .hover\\:bg-red-700:hover { filter: brightness(0.9); }
          .bg-red-50 { background-color: ${settings.primaryColor}15 !important; }
          .text-red-700 { color: ${settings.primaryColor} !important; }
        `}} />
        
        {/* Ambient Background Lights */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-red-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative bg-white p-8 sm:p-10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] w-full max-w-[430px] border border-white/20 flex flex-col z-10 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 p-2.5 shadow-sm flex items-center justify-center mb-4 relative group">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full rounded-xl bg-red-600 flex items-center justify-center text-white shadow-sm">
                  <ShieldCheck size={28} />
                </div>
              )}
            </div>

            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {settings.appName || 'EasyApply'}
            </h2>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold mt-2 border border-red-100">
              <ShieldCheck size={14} />
              <span>ផ្ទាំងគ្រប់គ្រង Admin Portal</span>
            </div>

            <p className="text-slate-500 text-xs sm:text-sm mt-2">
              បញ្ចូលព័ត៌មានសម្ងាត់ដើម្បីចូលប្រព័ន្ធគ្រប់គ្រង
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block text-left">
                ឈ្មោះគណនី / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  placeholder="Enter username"
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl border bg-slate-50/50 focus:bg-white transition-all outline-none text-slate-900 text-sm font-medium ${error ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'}`}
                  autoFocus
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block text-left">
                ពាក្យសម្ងាត់ / Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-11 py-3 rounded-2xl border bg-slate-50/50 focus:bg-white transition-all outline-none text-slate-900 text-sm font-medium ${error ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-xl animate-in slide-in-from-top-1">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-semibold py-3.5 rounded-2xl transition-all shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 mt-4 text-sm"
            >
              <LogIn size={18} />
              <span>ចូលប្រព័ន្ធ / Unlock Dashboard</span>
            </button>
          </form>

          {/* Footer Back Link */}
          <a 
            href="/" 
            className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors mt-6 pt-5 border-t border-slate-100"
          >
            <ArrowLeft size={14} />
            <span>ត្រឡប់ទៅទំព័រដើម / Back to Main Site</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex font-sans">
      <Toaster position="top-center" toastOptions={{ className: 'text-sm font-medium rounded-xl shadow-lg border border-gray-100' }} />
      <style dangerouslySetInnerHTML={{__html: `
        .text-red-600 { color: ${settings.primaryColor} !important; }
        .bg-red-600 { background-color: ${settings.primaryColor} !important; }
        .border-red-600 { border-color: ${settings.primaryColor} !important; }
        .ring-red-500 { --tw-ring-color: ${settings.primaryColor} !important; }
        .focus\\:border-red-500:focus { border-color: ${settings.primaryColor} !important; }
        .hover\\:bg-red-700:hover { filter: brightness(0.9); }
        .bg-red-50 { background-color: ${settings.primaryColor}15 !important; }
        .text-red-700 { color: ${settings.primaryColor} !important; }
      `}} />
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col z-50 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 h-screen pt-4`}>
        <div className="flex items-center justify-between px-6 pb-4 lg:hidden">
          <span className="font-bold text-lg text-gray-900">Menu</span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-gray-900 bg-gray-50 rounded-full">
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 flex-1 space-y-2 overflow-y-auto">
          <button 
            onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button 
            onClick={() => { setActiveTab('applications'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'applications' ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <FileText size={20} />
            Applications
          </button>
          {currentUser?.role === 'Admin' && (
            <>
              <button 
                onClick={() => { setActiveTab('products'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'products' ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <Box size={20} />
                Products
              </button>
              <button 
                onClick={() => { setActiveTab('promotions'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'promotions' ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <Megaphone size={20} />
                Promotions
              </button>
              <button 
                onClick={() => { setActiveTab('users'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'users' ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <Users size={20} />
                Users
              </button>
            </>
          )}
          <button 
            onClick={() => { setActiveTab('contact'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'contact' ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <PhoneCall size={20} />
            Contact Info
          </button>
          {currentUser?.role === 'Admin' && (
            <>
              <button 
                onClick={() => { setActiveTab('logs'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'logs' ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <Activity size={20} />
                Activity Logs
              </button>
              <button 
                onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'settings' ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <Settings size={20} />
                Settings
              </button>
              <button 
                onClick={() => { setActiveTab('telegram'); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'telegram' ? 'bg-sky-50 text-sky-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <Send size={20} />
                Telegram Bot
              </button>
            </>
          )}
        </nav>
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm shrink-0">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-gray-800 leading-tight truncate">{currentUser?.name || 'User'}</div>
                <div className="text-xs text-gray-500">{currentUser?.role === 'Admin' ? 'Admin Access' : 'Staff Access'}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
              title="Logout (ចាកចេញ)"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col relative bg-gray-50/50 min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 lg:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 tracking-tight">
              {activeTab === 'dashboard' ? 'Overview' : activeTab === 'settings' ? 'Settings' : activeTab === 'telegram' ? 'Telegram Bot Configuration' : activeTab === 'products' ? 'Products' : activeTab === 'promotions' ? 'Promotions' : activeTab === 'users' ? 'Users Management' : activeTab === 'contact' ? 'Contact Information' : 'Loan Applications'}
            </h2>
          </div>
          {activeTab === 'applications' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="Search by ID, Name or Phone..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all text-sm font-medium"
                />
              </div>
              <button 
                onClick={() => setShowExportModal(true)} 
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl transition-all text-sm font-semibold shadow-2xs hover:shadow-xs active:scale-95"
                title="Export applications to Excel with date range & custom filters"
              >
                <FileSpreadsheet size={18} className="text-emerald-600" />
                <span>Export Excel</span>
              </button>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5"><LayoutDashboard size={64} /></div>
                  <span className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Total Applications</span>
                  <span className="text-4xl font-black text-gray-900">{stats.total}</span>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-600"><Clock size={64} /></div>
                  <span className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wider">Pending Review</span>
                  <span className="text-4xl font-black text-gray-900">{stats.pending}</span>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-green-200 shadow-sm flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-green-600"><CheckCircle size={64} /></div>
                  <span className="text-sm font-semibold text-green-600 mb-2 uppercase tracking-wider">Approved Loans</span>
                  <span className="text-4xl font-black text-gray-900">{stats.approved}</span>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-purple-200 shadow-sm flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-purple-600"><FileText size={64} /></div>
                  <span className="text-sm font-semibold text-purple-600 mb-2 uppercase tracking-wider">Total Requested</span>
                  <span className="text-4xl font-black text-gray-900">${stats.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm lg:col-span-2">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Applications Over Time</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData.timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={settings.primaryColor} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={settings.primaryColor} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="applications" stroke={settings.primaryColor} strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" activeDot={{ r: 6, fill: settings.primaryColor, stroke: '#fff', strokeWidth: 2 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Application Status</h3>
                  <div className="h-[300px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Product Types</h3>
                  <div className="h-[300px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.productData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.productData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'promotions' && (
            <motion.div key="promotions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-w-4xl">
              <div className="p-6 sm:p-8">
                <form onSubmit={handleSettingsSave} className="space-y-8">
                  {/* Guideline Box for Image Dimensions */}
                  <div className="bg-gradient-to-r from-red-50/80 via-rose-50/50 to-amber-50/40 p-5 rounded-2xl border border-red-100 shadow-2xs space-y-3">
                    <div className="flex items-center gap-2.5 text-red-700 font-bold text-base">
                      <Image size={20} className="text-red-600 shrink-0" />
                      <span>ណែនាំទំហំរូបភាព Slideshow (Banner Image Guidelines)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs sm:text-sm">
                      <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-red-100/60 shadow-2xs">
                        <span className="block font-semibold text-gray-500 text-xs mb-0.5">សមាមាត្ររូបភាព (Aspect Ratio)</span>
                        <span className="font-bold text-gray-900 text-sm">16 : 9 (Landscape)</span>
                      </div>
                      <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-red-100/60 shadow-2xs">
                        <span className="block font-semibold text-gray-500 text-xs mb-0.5">ទំហំដែលល្អបំផុត (Dimensions)</span>
                        <span className="font-bold text-gray-900 text-sm">800 x 400px ឬ 1200 x 600px</span>
                      </div>
                      <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-red-100/60 shadow-2xs">
                        <span className="block font-semibold text-gray-500 text-xs mb-0.5">ទំហំ File និងប្រភេទ</span>
                        <span className="font-bold text-gray-900 text-sm">ក្រោម 2MB (JPG, PNG, WEBP)</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 pt-1 leading-relaxed">
                      💡 <span className="font-semibold text-gray-700">គន្លឹះ៖</span> ការប្រើប្រាស់រូបភាពដែលមានទំហំ 16:9 ឬ 2:1 ធ្វើឱ្យ Slideshow បង្ហាញបានពេញលេញ មិនវៀច ឬដាច់រូបលើអេក្រង់ទូរស័ព្ទឡើយ។
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-100 pb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Slideshow Images ({settings.promoImages?.length || 0})</h3>
                        <p className="text-xs text-gray-500 mt-0.5">គ្រប់គ្រង និង Upload រូបភាពប្រូម៉ូសិន Slideshow</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl cursor-pointer shadow-xs transition-colors flex items-center gap-2">
                          <Upload size={16} />
                          <span>Upload Banner</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 3 * 1024 * 1024) {
                                  toast.error('File size too large! Please select an image under 3MB.');
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  if (event.target?.result) {
                                    const newImages = [...(settings.promoImages || []), event.target.result as string];
                                    setSettings({...settings, promoImages: newImages});
                                    toast.success('Uploaded banner successfully!');
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        <button 
                          type="button" 
                          onClick={() => {
                            const newImages = [...(settings.promoImages || []), ''];
                            setSettings({...settings, promoImages: newImages});
                          }}
                          className="px-3.5 py-2 bg-gray-100 text-gray-700 font-medium text-sm rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-1.5"
                        >
                          + Add URL
                        </button>
                      </div>
                    </div>

                    <Reorder.Group axis="y" values={settings.promoImages || []} onReorder={(newImages) => setSettings({...settings, promoImages: newImages})} className="space-y-4">
                      {(settings.promoImages || []).map((imgUrl, index) => (
                        <Reorder.Item key={`${index}-${imgUrl.slice(0, 30)}`} value={imgUrl} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-3 border border-gray-200 rounded-2xl shadow-xs hover:border-gray-300 transition-all">
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <GripVertical className="text-gray-400 cursor-grab active:cursor-grabbing shrink-0" size={20} />
                            
                            {/* Image Thumbnail Preview */}
                            <div className="w-28 h-16 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center relative group/thumb">
                              {imgUrl ? (
                                <img src={imgUrl} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-xs text-gray-400 font-medium flex flex-col items-center">
                                  <Image size={18} className="mb-0.5 text-gray-300" />
                                  <span>No Image</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex-1 w-full space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-2">
                            <input 
                              type="text" 
                              value={imgUrl} 
                              placeholder="Paste Image URL or Upload Image"
                              onChange={(e) => {
                                const newImages = [...(settings.promoImages || [])];
                                newImages[index] = e.target.value;
                                setSettings({...settings, promoImages: newImages});
                              }} 
                              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" 
                            />
                            
                            <label className="cursor-pointer px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium text-xs rounded-xl border border-red-100 transition-colors shrink-0 flex items-center justify-center gap-1.5">
                              <Upload size={14} />
                              <span>Replace</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (file.size > 3 * 1024 * 1024) {
                                      toast.error('File size too large! Please select an image under 3MB.');
                                      return;
                                    }
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      if (event.target?.result) {
                                        const newImages = [...(settings.promoImages || [])];
                                        newImages[index] = event.target.result as string;
                                        setSettings({...settings, promoImages: newImages});
                                        toast.success('Banner updated successfully!');
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const newImages = [...(settings.promoImages || [])];
                              newImages.splice(index, 1);
                              setSettings({...settings, promoImages: newImages});
                            }}
                            className="text-red-500 hover:text-red-700 p-2.5 hover:bg-red-50 rounded-xl transition-colors shrink-0 self-end sm:self-center"
                            title="Remove Image"
                          >
                            <Trash2 size={18} />
                          </button>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button type="submit" className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-xs">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-w-4xl">
              <div className="p-8">
                <form onSubmit={handleSettingsSave} className="space-y-8">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b pb-4">
                      <h3 className="text-xl font-bold text-gray-900">Products</h3>
                      <button 
                        type="button" 
                        onClick={() => {
                          const newProducts = [...(settings.products || []), { id: Date.now().toString(), nameEn: '', nameKh: '', descEn: '', descKh: '', icon: 'Box' }];
                          setSettings({...settings, products: newProducts});
                        }}
                        className="px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                      >
                        + Add Product
                      </button>
                    </div>
                    <Reorder.Group axis="y" values={settings.products || []} onReorder={(newProducts) => setSettings({...settings, products: newProducts})} className="space-y-4">
                      {settings.products?.map((product, index) => (
                        <Reorder.Item key={product.id || index.toString()} value={product} className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-3">
                              <GripVertical className="text-gray-400 cursor-grab active:cursor-grabbing" size={20} />
                              <h4 className="font-bold text-gray-700">Product {index + 1}</h4>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newProducts = [...(settings.products || [])];
                                newProducts.splice(index, 1);
                                setSettings({...settings, products: newProducts});
                              }}
                              className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove Product"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Name (EN)</label>
                              <input type="text" value={product.nameEn} onChange={(e) => {
                                const newProducts = [...(settings.products || [])];
                                newProducts[index] = { ...newProducts[index], nameEn: e.target.value };
                                setSettings({...settings, products: newProducts});
                              }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm" />
                            </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Name (KH)</label>
                            <input type="text" value={product.nameKh} onChange={(e) => {
                              const newProducts = [...(settings.products || [])];
                              newProducts[index] = { ...newProducts[index], nameKh: e.target.value };
                              setSettings({...settings, products: newProducts});
                            }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm" />
                          </div>
                          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <RichTextEditor
                              label="Description (EN)"
                              value={product.descEn || ''}
                              onChange={(val) => {
                                const newProducts = [...(settings.products || [])];
                                newProducts[index] = { ...newProducts[index], descEn: val };
                                setSettings({...settings, products: newProducts});
                              }}
                              rows={3}
                            />
                            <RichTextEditor
                              label="Description (KH)"
                              value={product.descKh || ''}
                              onChange={(val) => {
                                const newProducts = [...(settings.products || [])];
                                newProducts[index] = { ...newProducts[index], descKh: val };
                                setSettings({...settings, products: newProducts});
                              }}
                              rows={3}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Lucide Icon Name</label>
                            <input type="text" value={product.icon} onChange={(e) => {
                              const newProducts = [...(settings.products || [])];
                              newProducts[index] = { ...newProducts[index], icon: e.target.value };
                              setSettings({...settings, products: newProducts});
                            }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm font-mono" placeholder="e.g. Briefcase, Car" />
                          </div>
                        </div>
                      </Reorder.Item>
                    ))}
                    </Reorder.Group>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button type="submit" className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-visible max-w-4xl">
              <div className="p-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b pb-4">
                    <h3 className="text-xl font-bold text-gray-900">User Management</h3>
                    <button 
                      type="button" 
                      onClick={() => {
                        const newUsers = [...adminUsers, { id: Date.now().toString(), name: '', username: '', password: 'password', role: 'Staff' as const }];
                        handleSaveUsers(newUsers);
                        logActivity('Add User', 'Created a new user account entry');
                      }}
                      className="px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                    >
                      <UserPlus size={18} />
                      Add User
                    </button>
                  </div>
                    
                  <div className="space-y-4">
                    {adminUsers.map((user, index) => (
                      <div key={user.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-bold text-gray-700">User {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => {
                              if(adminUsers.length > 1) {
                                const newUsers = [...adminUsers];
                                newUsers.splice(index, 1);
                                handleSaveUsers(newUsers);
                                logActivity('Remove User', `Deleted user account ${user.username || user.name || `User ${index+1}`}`);
                              } else {
                                toast.error('You must have at least one user');
                              }
                            }}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove User"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                            <input type="text" value={user.name} onChange={(e) => {
                              const newUsers = [...adminUsers];
                              newUsers[index] = { ...newUsers[index], name: e.target.value };
                              handleSaveUsers(newUsers);
                            }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="e.g. John Doe" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Username / Telegram ID</label>
                            <input type="text" value={user.username} onChange={(e) => {
                              const newUsers = [...adminUsers];
                              newUsers[index] = { ...newUsers[index], username: e.target.value };
                              handleSaveUsers(newUsers);
                            }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="e.g. john_doe" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
                            <input type="text" value={user.password || ''} onChange={(e) => {
                              const newUsers = [...adminUsers];
                              newUsers[index] = { ...newUsers[index], password: e.target.value };
                              handleSaveUsers(newUsers);
                            }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm" placeholder="Default: 123456" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Role</label>
                            <CustomSelect 
                              value={user.role} 
                              onChange={(v) => {
                                const newUsers = [...adminUsers];
                                newUsers[index] = { ...newUsers[index], role: v as 'Admin' | 'Staff' };
                                handleSaveUsers(newUsers);
                              }}
                              options={[
                                { value: 'Admin', label: 'Admin (Full Access)' },
                                { value: 'Staff', label: 'Staff (Read Only)' }
                              ]}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'contact' && (
            <motion.div key="contact" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-w-4xl">
              <div className="p-8">
                <form onSubmit={handleSettingsSave} className="space-y-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 border-b pb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Phone</label>
                        <input type="text" value={settings.contactPhone} onChange={(e) => setSettings({...settings, contactPhone: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Email</label>
                        <input type="email" value={settings.contactEmail} onChange={(e) => setSettings({...settings, contactEmail: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Live Chat URL</label>
                        <input type="text" value={settings.contactLiveChatUrl} onChange={(e) => setSettings({...settings, contactLiveChatUrl: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Branch Location URL</label>
                        <input type="text" value={settings.contactBranchUrl} onChange={(e) => setSettings({...settings, contactBranchUrl: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none" />
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button type="submit" className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-w-3xl">
              <div className="p-8">
                <form onSubmit={handleSettingsSave} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">App Name</label>
                    <input 
                      type="text" 
                      value={settings.appName}
                      onChange={(e) => setSettings({...settings, appName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Color (Hex)</label>
                    <div className="flex gap-4 items-center">
                      <input 
                        type="color" 
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                        className="w-12 h-12 rounded cursor-pointer border-0 p-0"
                      />
                      <span className="font-mono text-gray-500">{settings.primaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">App Logo (រូបភាព Logo)</label>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      {settings.logoUrl && (
                        <div className="w-24 h-20 rounded-2xl border border-gray-200 p-1.5 bg-gray-50 flex items-center justify-center shrink-0">
                          <img src={settings.logoUrl} alt="Logo preview" className="w-full h-full object-contain" />
                        </div>
                      )}
                      <div className="flex-1 w-full space-y-2">
                        <div className="flex gap-2">
                          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-medium text-sm rounded-xl border border-red-200 transition-colors">
                            <Upload size={16} />
                            <span>Upload Logo Image</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    if (event.target?.result) {
                                      const imgUrl = event.target.result as string;
                                      setSettings({ ...settings, logoUrl: imgUrl, faviconUrl: imgUrl });
                                      toast.success('Logo & Favicon updated successfully!');
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                        <input 
                          type="text" 
                          value={settings.logoUrl || ''}
                          placeholder="Or paste image URL"
                          onChange={(e) => setSettings({...settings, logoUrl: e.target.value})}
                          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Favicon Icon (រូបភាព Favicon)</label>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      {settings.faviconUrl && (
                        <div className="w-16 h-16 rounded-2xl border border-gray-200 p-2 bg-gray-50 flex items-center justify-center shrink-0">
                          <img src={settings.faviconUrl} alt="Favicon preview" className="w-10 h-10 object-contain" />
                        </div>
                      )}
                      <div className="flex-1 w-full space-y-2">
                        <div className="flex gap-2">
                          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-medium text-sm rounded-xl border border-red-200 transition-colors">
                            <Upload size={16} />
                            <span>Upload Favicon Image</span>
                            <input 
                              type="file" 
                              accept="image/*,.ico" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    if (event.target?.result) {
                                      const imgUrl = event.target.result as string;
                                      setSettings({ ...settings, faviconUrl: imgUrl, logoUrl: imgUrl });
                                      toast.success('Favicon & Logo updated across all icons!');
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                        <input 
                          type="text" 
                          value={settings.faviconUrl || ''}
                          placeholder="Or paste favicon URL (.png, .ico, .svg)"
                          onChange={(e) => setSettings({...settings, faviconUrl: e.target.value})}
                          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Welcome Text (EN)</label>
                      <input 
                        type="text" 
                        value={settings.welcomeEn}
                        onChange={(e) => setSettings({...settings, welcomeEn: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Welcome Text (KH)</label>
                      <input 
                        type="text" 
                        value={settings.welcomeKh}
                        onChange={(e) => setSettings({...settings, welcomeKh: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                      />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mt-8 mb-4">Loan Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Interest Rate (%)</label>
                      <input type="number" step="0.1" value={settings.interestRate} onChange={(e) => setSettings({...settings, interestRate: Number(e.target.value)})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Min Amount ($)</label>
                        <input type="number" value={settings.minLoanAmount} onChange={(e) => setSettings({...settings, minLoanAmount: Number(e.target.value)})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Max Amount ($)</label>
                        <input type="number" value={settings.maxLoanAmount} onChange={(e) => setSettings({...settings, maxLoanAmount: Number(e.target.value)})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <button type="submit" className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-sm">
                      Save Settings
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'telegram' && (
            <motion.div key="telegram" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center gap-4 bg-sky-50/50">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                    <Send size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">1. Telegram Bot Connection</h2>
                    <p className="text-xs text-gray-500">Link your Telegram bot to enable notifications and Web App integration.</p>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Bot Token
                      </label>
                      <input
                        type="password"
                        value={settings.telegramBotToken || ''}
                        onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
                        placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Admin Chat ID (For Notifications)
                      </label>
                      <input
                        type="text"
                        value={settings.telegramChatId || ''}
                        onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
                        placeholder="e.g. -1001234567890 or 987654321"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Web App / Webhook Domain
                    </label>
                    <input
                      type="text"
                      value={settings.telegramWebhookDomain || ''}
                      onChange={(e) => setSettings({ ...settings, telegramWebhookDomain: e.target.value })}
                      placeholder="e.g. https://easyapply.tobsonyofficial.workers.dev (Leave empty to use current URL)"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
                    />
                    <p className="mt-1.5 text-[11px] text-gray-500">This URL is used when users click "Open App" in the bot and for webhook registration.</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={isTestingTelegram || !settings.telegramBotToken || !settings.telegramChatId}
                      onClick={async () => {
                        setIsTestingTelegram(true);
                        const res = await testTelegramNotification(
                          settings.telegramBotToken || '',
                          settings.telegramChatId || ''
                        );
                        setIsTestingTelegram(false);
                        if (res.success) {
                          toast.success(res.message);
                          logActivity('Test Telegram Notification', 'Successfully sent test notification to Telegram chat');
                        } else {
                          toast.error(res.message);
                        }
                      }}
                      className="px-4 py-2 bg-sky-100 hover:bg-sky-200 text-sky-700 disabled:opacity-50 font-semibold rounded-lg text-xs flex items-center gap-2 transition-colors"
                    >
                      <Send size={14} />
                      <span>{isTestingTelegram ? 'Testing...' : 'Test Connection'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isRegisteringWebhook || !settings.telegramBotToken}
                      onClick={async () => {
                        setIsRegisteringWebhook(true);
                        const domain = settings.telegramWebhookDomain?.trim() || window.location.origin;
                        const res = await registerTelegramWebhook(
                          settings.telegramBotToken || '',
                          domain
                        );
                        setIsRegisteringWebhook(false);
                        if (res.success) {
                          toast.success(res.message);
                          logActivity('Register Telegram Webhook', 'Successfully registered Telegram Webhook for domain: ' + domain);
                        } else {
                          toast.error(res.message);
                        }
                      }}
                      className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 disabled:opacity-50 font-semibold rounded-lg text-xs flex items-center gap-2 transition-colors"
                    >
                      <Activity size={14} />
                      <span>{isRegisteringWebhook ? 'Registering...' : 'Register Webhook'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center gap-4 bg-purple-50/50">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <MessageSquare size={20} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-base font-bold text-gray-900">2. Notification Templates</h2>
                    <p className="text-xs text-gray-500">Customize the messages sent to administrators and applicants.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer" title="Enable Order Notifications">
                    <input
                      type="checkbox"
                      checked={!!settings.enableTelegramNotify}
                      onChange={(e) => setSettings({ ...settings, enableTelegramNotify: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                  </label>
                </div>
                
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                      <span>New Application Alert (Sent to Admin)</span>
                    </label>
                    <p className="text-[11px] text-gray-500 mb-2">Variables: {'{{name}}'}, {'{{phone}}'}, {'{{amount}}'}, {'{{term}}'}, {'{{product}}'}, {'{{occupation}}'}, {'{{company}}'}, {'{{income}}'}, {'{{address}}'}, {'{{docs}}'}, {'{{date}}'}, {'{{id}}'}</p>
                    <textarea
                      rows={5}
                      value={settings.botNewApplicationMessage || `🚨 <b>ពាក្យស្នើសុំប្រាក់កម្ចីថ្មី</b>\n\n👤 <b>ឈ្មោះ:</b> {{name}}\n📞 <b>ទូរស័ព្ទ:</b> <code>{{phone}}</code>\n💵 <b>ចំនួនប្រាក់:</b> <b>{{amount}}</b>\n⏱️ <b>រយៈពេល:</b> {{term}} ខែ\n📦 <b>ប្រភេទផលិតផល:</b> {{product}}\n💼 <b>មុខរបរ:</b> {{occupation}}\n🏢 <b>ក្រុមហ៊ុន:</b> {{company}}\n💰 <b>ប្រាក់ចំណូល:</b> {{income}}\n📍 <b>អាសយដ្ឋាន:</b> {{address}}\n📄 <b>ឯកសារ:</b> {{docs}} ឯកសារ\n📅 <b>កាលបរិច្ឆេទ:</b> {{date}}\n🆔 <b>ID:</b> <code>{{id}}</code>`}
                      onChange={(e) => setSettings({ ...settings, botNewApplicationMessage: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                      <span>Status Update Notification (Sent to User & Admin)</span>
                    </label>
                    <p className="text-[11px] text-gray-500 mb-2">Variables: {'{{name}}'}, {'{{id}}'}, {'{{product}}'}, {'{{amount}}'}, {'{{emoji}}'}, {'{{status}}'}, {'{{reason}}'}, {'{{admin}}'}</p>
                    <textarea
                      rows={5}
                      value={settings.botStatusUpdateMessage || `🔔 <b>ជម្រាបសួរ {{name}},</b>\nពាក្យស្នើសុំប្រាក់កម្ចីរបស់អ្នកត្រូវបានផ្លាស់ប្តូរស្ថានភាព។\n\n🆔 <b>ID:</b> <code>{{id}}</code>\n📦 <b>ប្រភេទផលិតផល:</b> {{product}}\n💵 <b>ចំនួនប្រាក់:</b> <b>{{amount}}</b>\n\n{{emoji}} <b>ស្ថានភាពថ្មី:</b> <b>{{status}}</b>{{reason}}{{admin}}`}
                      onChange={(e) => setSettings({ ...settings, botStatusUpdateMessage: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center gap-4 bg-orange-50/50">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">3. Bot Welcome Message (Users)</h2>
                    <p className="text-xs text-gray-500">Configure what users see when they start a chat with the bot.</p>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Welcome Message Content
                    </label>
                    <textarea
                      rows={6}
                      value={settings.botWelcomeMessage || ''}
                      onChange={(e) => setSettings({ ...settings, botWelcomeMessage: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                      placeholder="Welcome message supporting HTML format"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                       <label className="block text-xs font-semibold text-gray-700">Bot Buttons (Inline Keyboard)</label>
                       <button
                          type="button"
                          onClick={() => {
                             const newBtns = [...(settings.telegramButtons || [])];
                             newBtns.push({ id: Date.now().toString(), text: 'New Button', type: 'web_app', url: '' });
                             setSettings({ ...settings, telegramButtons: newBtns });
                          }}
                          className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-md transition-colors"
                       >
                          <Plus size={14} /> Add Button
                       </button>
                    </div>
                    <div className="space-y-2">
                      {(settings.telegramButtons || []).map((btn, index) => (
                         <div key={btn.id} className="flex flex-col lg:flex-row gap-2 items-center bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                           <div className="flex-1 w-full flex items-center gap-2">
                             <GripVertical size={16} className="text-gray-400 cursor-move shrink-0" />
                             <input 
                               type="text" 
                               placeholder="Button Text"
                               value={btn.text}
                               onChange={(e) => {
                                  const newBtns = [...(settings.telegramButtons || [])];
                                  newBtns[index].text = e.target.value;
                                  setSettings({ ...settings, telegramButtons: newBtns });
                               }}
                               className="w-1/3 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                             />
                             <select 
                               value={btn.type}
                               onChange={(e) => {
                                  const newBtns = [...(settings.telegramButtons || [])];
                                  newBtns[index].type = e.target.value as 'web_app' | 'url';
                                  setSettings({ ...settings, telegramButtons: newBtns });
                               }}
                               className="w-1/4 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                             >
                               <option value="web_app">Web App</option>
                               <option value="url">URL Link</option>
                             </select>
                             <input 
                               type="text" 
                               placeholder={btn.type === 'web_app' ? 'Leave empty for default Web App URL' : 'https://...'}
                               value={btn.url || ''}
                               onChange={(e) => {
                                  const newBtns = [...(settings.telegramButtons || [])];
                                  newBtns[index].url = e.target.value;
                                  setSettings({ ...settings, telegramButtons: newBtns });
                               }}
                               className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-mono outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                             />
                           </div>
                           <button
                             type="button"
                             onClick={() => {
                                const newBtns = (settings.telegramButtons || []).filter(b => b.id !== btn.id);
                                setSettings({ ...settings, telegramButtons: newBtns });
                             }}
                             className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0 transition-colors"
                           >
                             <Trash2 size={16} />
                           </button>
                         </div>
                      ))}
                      {(!settings.telegramButtons || settings.telegramButtons.length === 0) && (
                        <div className="text-xs text-gray-500 text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                           No buttons added yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 pb-12">
                 <button onClick={handleSettingsSave} type="button" className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors shadow-sm text-sm">
                   Save All Telegram Settings
                 </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'applications' && (
            <motion.div key="applications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl shadow-sm border border-gray-200">
              
              {/* Advanced Filters */}
              <div className="p-4 border-b border-gray-200 bg-gray-50/50 rounded-t-2xl flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                  <Filter size={16} />
                  Filters:
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <CustomSelect 
                    value={statusFilter}
                    onChange={(v) => setStatusFilter(v)}
                    options={[
                      { value: 'all', label: 'All Statuses' },
                      { value: 'submitted', label: 'Submitted' },
                      { value: 'reviewing', label: 'Reviewing' },
                      { value: 'approved', label: 'Approved' },
                      { value: 'rejected', label: 'Rejected' },
                      { value: 'disbursed', label: 'Disbursed' }
                    ]}
                    className="w-40"
                  />

                  <CustomSelect
                    value={productFilter}
                    onChange={(v) => setProductFilter(v)}
                    options={[
                      { value: 'all', label: 'All Products' },
                      ...(settings.products?.map(p => ({ value: p.id, label: p.nameEn })) || [])
                    ]}
                    className="w-40"
                  />

                  <CustomSelect 
                    value={dateFilter}
                    onChange={(v) => setDateFilter(v)}
                    options={[
                      { value: 'all', label: 'All Time' },
                      { value: 'today', label: 'Today' },
                      { value: '7days', label: 'Last 7 Days' },
                      { value: '30days', label: 'Last 30 Days' }
                    ]}
                    className="w-40"
                  />
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 hidden sm:inline">
                    Showing {paginatedApps.length} of {filteredApps.length} applications
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
                      <th className="px-6 py-4">App ID</th>
                      <th className="px-6 py-4">Applicant</th>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-6 py-4">Amount & Term</th>
                      <th className="px-6 py-4">Applied Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedApps.length > 0 ? (
                      paginatedApps.map((app) => (
                        <tr key={app.id} className="hover:bg-gray-50/80 transition-colors group">
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm font-bold text-gray-700 bg-white border border-gray-200 shadow-sm px-2.5 py-1 rounded-md">{app.id}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{app.applicantName}</div>
                            <div className="text-sm text-gray-500 mt-0.5">{app.phone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-gray-700">
                              {app.productId ? (settings.products?.find(p => p.id === app.productId)?.nameEn || app.productId) : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-black text-gray-900">${app.amount.toLocaleString()}</div>
                            <div className="text-sm font-medium text-gray-500 mt-0.5">{app.termMonths} Months</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-800">{new Date(app.appliedAt).toLocaleDateString()}</div>
                            <div className="text-xs font-medium text-gray-500 mt-0.5">{new Date(app.appliedAt).toLocaleTimeString()}</div>
                          </td>
                          <td className="px-6 py-4">
                            <StatusDropdown value={app.status} onChange={(v) => handleStatusChange(app.id, v)} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 transition-opacity">
                              <button onClick={() => setSelectedApp(app)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-lg" title="View Details">
                                <Eye size={16} strokeWidth={2.5} />
                              </button>
                              <button onClick={() => deleteApplication(app.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors rounded-lg" title="Delete">
                                <Trash2 size={16} strokeWidth={2.5} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4 text-gray-400">
                            <Search size={24} />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">No applications found</h3>
                          <p className="text-gray-500">We couldn't find any loan applications matching your search and filters.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-white rounded-b-2xl">
                  <div className="text-sm text-gray-500">
                    Page <span className="font-semibold text-gray-700">{currentPage}</span> of <span className="font-semibold text-gray-700">{totalPages}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                        // Only show a few page numbers around the current page
                        if (
                          page === 1 || 
                          page === totalPages || 
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                                currentPage === page 
                                  ? 'bg-red-50 text-red-600 border border-red-200' 
                                  : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          (page === currentPage - 2 && currentPage > 3) ||
                          (page === currentPage + 2 && currentPage < totalPages - 2)
                        ) {
                          return <span key={page} className="text-gray-400 px-1">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'logs' && (
            <motion.div key="logs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Activity Logs</h3>
                <p className="text-gray-500 mt-1">Audit trail of system changes and administrative actions.</p>
              </div>
              <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500">
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Action</th>
                      <th className="px-6 py-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activityLogs.length > 0 ? (
                      activityLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-800">{new Date(log.timestamp).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{log.userName}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">{log.details}</div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-16 text-center">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4 text-gray-400">
                            <Activity size={24} />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">No activities recorded</h3>
                          <p className="text-gray-500">System changes will appear here.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          </AnimatePresence>
        </div>
      </main>

      {/* Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSelectedApp(null)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-gray-900">Application Details</h3>
              <button onClick={() => setSelectedApp(null)} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 sm:p-8 space-y-8">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Application ID</div>
                  <div className="font-mono text-xl font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg inline-block">{selectedApp.id}</div>
                </div>
                <div className="flex flex-col items-start sm:items-end">
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Current Status</div>
                  <StatusDropdown value={selectedApp.status} onChange={(v) => handleStatusChange(selectedApp.id, v)} />
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100 relative">
                {!isEditing ? (
                  <button onClick={startEditing} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-blue-600 transition-colors bg-white rounded-lg shadow-sm border border-gray-200">
                    <Edit size={16} />
                  </button>
                ) : (
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 bg-white rounded-lg shadow-sm border border-gray-200">
                      Cancel
                    </button>
                    <button onClick={handleEditSave} className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm">
                      Save
                    </button>
                  </div>
                )}

                <div>
                  <div className="text-sm font-semibold text-gray-500 mb-1">Applicant Name</div>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={editForm.applicantName || ''} 
                      onChange={(e) => setEditForm({...editForm, applicantName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  ) : (
                    <div className="text-lg font-bold text-gray-900">{selectedApp.applicantName}</div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-500 mb-1">Phone Number</div>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={editForm.phone || ''} 
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  ) : (
                    <div className="text-lg font-bold text-gray-900">{selectedApp.phone}</div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-500 mb-1">Requested Amount</div>
                  {isEditing ? (
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500 font-bold">$</span>
                      <input
                        type="number"
                        value={editForm.amount || 0}
                        onChange={(e) => setEditForm({...editForm, amount: Number(e.target.value)})}
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                      />
                    </div>
                  ) : (
                    <div className="text-lg font-black text-gray-900">${selectedApp.amount.toLocaleString()}</div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-500 mb-1">Loan Term</div>
                  {isEditing ? (
                    <div className="relative">
                      <input
                        type="number"
                        value={editForm.termMonths || 0}
                        onChange={(e) => setEditForm({...editForm, termMonths: Number(e.target.value)})}
                        className="w-full pr-16 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                      />
                      <span className="absolute right-3 top-2 text-gray-500 font-medium">Months</span>
                    </div>
                  ) : (
                    <div className="text-lg font-bold text-gray-900">{selectedApp.termMonths} Months</div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-500 mb-1">Product Type</div>
                  {isEditing ? (
                    <CustomSelect
                      value={editForm.productId || ''}
                      onChange={(v) => setEditForm({...editForm, productId: v})}
                      options={[
                        { value: '', label: 'None' },
                        ...(settings.products?.map(p => ({ value: p.id, label: p.nameEn })) || [])
                      ]}
                      className="w-full"
                    />
                  ) : (
                    <div className="text-lg font-bold text-gray-900">
                      {selectedApp.productId ? (settings.products?.find(p => p.id === selectedApp.productId)?.nameEn || selectedApp.productId) : 'N/A'}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-500 mb-1">Applied Date</div>
                  <div className="text-base font-bold text-gray-900">{new Date(selectedApp.appliedAt).toLocaleString()}</div>
                </div>
              </div>

              {/* Action Button: Amortization Schedule */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-sm transition-all"
                >
                  <Table size={18} className="text-red-400" />
                  <span>View Amortization Schedule / មើលតារាងរំលស់</span>
                </button>
              </div>

              {selectedApp.status === 'rejected' && selectedApp.rejectionReason && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-red-600 mb-1 uppercase tracking-wider">Rejection Reason</h4>
                  <p className="text-sm text-red-900">{selectedApp.rejectionReason}</p>
                </div>
              )}

              {/* Documents */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-red-500" />
                  Attached Documents
                </h4>
                {selectedApp.documents && selectedApp.documents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedApp.documents.map((doc, idx) => {
                      const docName = doc.includes('|||') ? doc.split('|||')[0] : doc;
                      return (
                      <div key={idx} onClick={() => setPreviewDoc(doc)} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-red-300 transition-colors cursor-pointer group">
                        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                          <FileText size={20} />
                        </div>
                        <div className="flex-1 truncate">
                          <div className="font-semibold text-gray-900 text-sm truncate">{docName}</div>
                          <div className="text-xs text-gray-500">Click to view</div>
                        </div>
                      </div>
                    )})}
                  </div>
                ) : (
                  <div className="p-6 bg-gray-50 border border-gray-200 border-dashed rounded-2xl text-center">
                    <p className="text-sm text-gray-500 font-medium">No documents attached to this application.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      <AnimatePresence>
        {previewDoc && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setPreviewDoc(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 truncate pr-4">{previewDoc.includes('|||') ? previewDoc.split('|||')[0] : previewDoc}</h3>
                <button onClick={() => setPreviewDoc(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 bg-gray-100 flex items-center justify-center min-h-[500px]">
                 {previewDoc.includes('|||') && previewDoc.split('|||')[1].startsWith('data:image') ? (
                   <img src={previewDoc.split('|||')[1]} alt="Document" className="max-w-full max-h-full object-contain bg-white shadow-sm" />
                 ) : (
                   <div className="text-center space-y-4">
                     <FileText size={64} className="mx-auto text-gray-300" />
                     <p className="text-gray-500 font-medium">Document preview is not available in demo mode.</p>
                     <p className="text-xs text-gray-400">File: {previewDoc.includes('|||') ? previewDoc.split('|||')[0] : previewDoc}</p>
                   </div>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Amortization Schedule Modal for Admin */}
      {selectedApp && (
        <AmortizationScheduleModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          principal={selectedApp.amount}
          annualRate={settings.interestRate}
          termMonths={selectedApp.termMonths}
          applicantName={selectedApp.applicantName}
        />
      )}

      {/* Advanced Filter Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => setShowExportModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col z-10"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white px-6 py-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <FileSpreadsheet size={22} className="text-emerald-200" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Export Applications Data (ទាញយកទិន្នន័យ)</h3>
                    <p className="text-xs text-emerald-100">ជ្រើសរើសជម្រើសចម្រោះ និង កាលបរិច្ឆេទសម្រាប់ទាញយកជា Excel</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
                
                {/* 1. Date Filter Section */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 font-bold text-gray-800 text-sm">
                    <CalendarDays size={18} className="text-emerald-600" />
                    <span>១. កាលបរិច្ឆេទ (Date Range Filter)</span>
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'all', label: 'ទាំងអស់ (All)' },
                      { id: 'today', label: 'ថ្ងៃនេះ (Today)' },
                      { id: 'this_week', label: 'សប្តាហ៍នេះ' },
                      { id: 'this_month', label: 'ខែនេះ' },
                      { id: 'custom', label: 'កំណត់ផ្ទាល់' },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => setExportDateRange(btn.id as any)}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                          exportDateRange === btn.id
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {exportDateRange === 'custom' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">ចាប់ពីថ្ងៃទី (From Date)</label>
                        <input
                          type="date"
                          value={exportStartDate}
                          onChange={(e) => setExportStartDate(e.target.value)}
                          className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">ដល់ថ្ងៃទី (To Date)</label>
                        <input
                          type="date"
                          value={exportEndDate}
                          onChange={(e) => setExportEndDate(e.target.value)}
                          className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* 2. Status & Product Filter Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div>
                    <label className="flex items-center gap-2 font-bold text-gray-800 text-xs mb-2">
                      <Filter size={16} className="text-emerald-600" />
                      <span>២. ស្ថានភាពកម្ចី (Loan Status)</span>
                    </label>
                    <CustomSelect
                      value={exportStatus}
                      onChange={setExportStatus}
                      options={[
                        { value: 'all', label: 'ស្ថានភាពទាំងអស់ (All Statuses)' },
                        { value: 'submitted', label: 'Submitted (ពាក្យផ្ញើមក)' },
                        { value: 'reviewing', label: 'Reviewing (កំពុងពិនិត្យ)' },
                        { value: 'approved', label: 'Approved (អនុម័ត)' },
                        { value: 'disbursed', label: 'Disbursed (បើកប្រាក់)' },
                        { value: 'rejected', label: 'Rejected (បដិសេធ)' }
                      ]}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 font-bold text-gray-800 text-xs mb-2">
                      <Box size={16} className="text-emerald-600" />
                      <span>៣. ប្រភេទផលិតផល (Product)</span>
                    </label>
                    <CustomSelect
                      value={exportProductId}
                      onChange={setExportProductId}
                      options={[
                        { value: 'all', label: 'ផលិតផលទាំងអស់ (All Products)' },
                        ...(settings.products || []).map(p => ({
                          value: p.id,
                          label: p.nameKh || p.nameEn
                        }))
                      ]}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* 3. Loan Amount Filter Section */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="flex items-center gap-2 font-bold text-gray-800 text-xs">
                    <DollarSign size={16} className="text-emerald-600" />
                    <span>៤. ទំហំប្រាក់កម្ចី (Loan Amount Filter)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        placeholder="ប្រាក់កម្ចីអប្បបរមា ($ Min)"
                        value={exportMinAmount}
                        onChange={(e) => setExportMinAmount(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="ប្រាក់កម្ចីអតិបរមា ($ Max)"
                        value={exportMaxAmount}
                        onChange={(e) => setExportMaxAmount(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Live Counter Preview Card */}
                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-900">
                  <div className="space-y-0.5 text-center sm:text-left">
                    <div className="text-xs font-medium text-emerald-700">ចំនួនទិន្នន័យដែលស្របតាមលក្ខខណ្ឌ៖</div>
                    <div className="text-lg font-black text-emerald-900">
                      {exportFilteredApps.length} ពាក្យស្នើសុំ (Applications)
                    </div>
                  </div>
                  <div className="text-right bg-white/80 px-4 py-2 rounded-xl border border-emerald-200/50 shadow-2xs">
                    <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">សរុបប្រាក់កម្ចី / Total Portfolio</div>
                    <div className="text-base font-bold text-emerald-700">
                      ${exportFilteredApps.reduce((sum, a) => sum + (Number(a.amount) || 0), 0).toLocaleString()}
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setExportDateRange('all');
                    setExportStartDate('');
                    setExportEndDate('');
                    setExportStatus('all');
                    setExportProductId('all');
                    setExportMinAmount('');
                    setExportMaxAmount('');
                  }}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 rounded-xl transition-colors"
                >
                  កំណត់ឡើងវិញ (Reset)
                </button>

                <button
                  type="button"
                  disabled={exportFilteredApps.length === 0}
                  onClick={() => {
                    exportToExcel(exportFilteredApps);
                    setShowExportModal(false);
                    logActivity('Export Applications', `Exported ${exportFilteredApps.length} applications to Excel with custom filters`);
                  }}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <FileSpreadsheet size={18} />
                  <span>ទាញយកទិន្នន័យជា Excel ({exportFilteredApps.length})</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">ហេតុផលនៃការបដិសេធ (Rejection Reason)</h3>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectAppId(null);
                    setRejectReason('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  សូមបញ្ចូលហេតុផលនៃការបដិសេធពាក្យស្នើសុំនេះ ដើម្បីផ្តល់ជាដំណឹងដល់អ្នកស្នើសុំ។
                </p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="ហេតុផលនៃការបដិសេធ..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none h-32"
                />
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectAppId(null);
                    setRejectReason('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  onClick={confirmReject}
                  disabled={!rejectReason.trim()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  បដិសេធ (Reject)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

