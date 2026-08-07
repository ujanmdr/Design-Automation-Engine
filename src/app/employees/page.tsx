"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import NepaliDate from "nepali-date-converter";
import { Edit2, Save, X, Upload, Search, UserCheck, Trash2, Plus, Calendar, AlertTriangle, UserPlus } from "lucide-react";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Inline Delete Dialog State
  const [deletingEmployee, setDeletingEmployee] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Temporary state for the row being edited
  const [editForm, setEditForm] = useState<any>({});

  // Add Employee Form States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    title: "",
    email: "",
    birthday: "",
    appointmentDate: ""
  });
  const [birthdayPhoto, setBirthdayPhoto] = useState<File | null>(null);
  const [idPhoto, setIdPhoto] = useState<File | null>(null);
  const [adding, setAdding] = useState(false);

  // Birthday BS Calendar states
  const [bdayBsYear, setBdayBsYear] = useState<number>(2080);
  const [bdayBsMonth, setBdayBsMonth] = useState<number>(3); // Ashadh
  const [bdayBsDay, setBdayBsDay] = useState<number>(16);
  const [bdayTab, setBdayTab] = useState<"AD" | "BS">("AD");

  // Appointment Date BS Calendar states
  const [apptBsYear, setApptBsYear] = useState<number>(2080);
  const [apptBsMonth, setApptBsMonth] = useState<number>(3); // Ashadh
  const [apptBsDay, setApptBsDay] = useState<number>(16);
  const [apptTab, setApptTab] = useState<"AD" | "BS">("AD");

  const updateBirthdayFromBs = (y: number, m: number, d: number) => {
    try {
      const nepaliDate = new NepaliDate(y, m - 1, d);
      const adDate = nepaliDate.toJsDate();
      const month = String(adDate.getMonth() + 1).padStart(2, "0");
      const day = String(adDate.getDate()).padStart(2, "0");
      setAddForm(prev => ({ ...prev, birthday: `${month}-${day}` }));
    } catch (e) {
      console.warn("Invalid BS birthday selected");
    }
  };

  const updateAppointmentFromBs = (y: number, m: number, d: number) => {
    try {
      const nepaliDate = new NepaliDate(y, m - 1, d);
      const adDate = nepaliDate.toJsDate();
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const day = adDate.getDate();
      const monthStr = months[adDate.getMonth()];
      const year = adDate.getFullYear();
      setAddForm(prev => ({ ...prev, appointmentDate: `${day}-${monthStr}-${year}` }));
    } catch (e) {
      console.warn("Invalid BS appointment date selected");
    }
  };

  useEffect(() => {
    if (bdayTab === "BS") {
      updateBirthdayFromBs(bdayBsYear, bdayBsMonth, bdayBsDay);
    }
  }, [bdayTab, bdayBsYear, bdayBsMonth, bdayBsDay]);

  useEffect(() => {
    if (apptTab === "BS") {
      updateAppointmentFromBs(apptBsYear, apptBsMonth, apptBsDay);
    }
  }, [apptTab, apptBsYear, apptBsMonth, apptBsDay]);

  const handleBdayAdChange = (value: string) => {
    if (!value) return;
    const parts = value.split("-"); // [YYYY, MM, DD]
    if (parts.length === 3) {
      setAddForm(prev => ({ ...prev, birthday: `${parts[1]}-${parts[2]}` }));
    }
  };

  const handleApptAdChange = (value: string) => {
    if (!value) return;
    const adDate = new Date(value);
    if (!isNaN(adDate.getTime())) {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const day = adDate.getDate();
      const monthStr = months[adDate.getMonth()];
      const year = adDate.getFullYear();
      setAddForm(prev => ({ ...prev, appointmentDate: `${day}-${monthStr}-${year}` }));
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (err) {
      console.error("Failed to fetch employees", err);
    }
    setLoading(false);
  };

  const startEditing = (emp: any) => {
    setEditingId(emp.id);
    setEditForm({ ...emp });
  };

  const confirmDeleteEmployee = async () => {
    if (!deletingEmployee) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/employees?id=${deletingEmployee.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setEmployees(employees.filter((e) => e.id !== deletingEmployee.id));
        setDeletingEmployee(null);
      } else {
        alert(data.error || "Failed to delete employee");
      }
    } catch (err) {
      console.error("Failed to delete employee", err);
      alert("Failed to delete employee");
    }
    setIsDeleting(false);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEditing = async () => {
    try {
      const res = await fetch("/api/employees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        setEmployees(employees.map(e => e.id === editForm.id ? editForm : e));
        setEditingId(null);
      } else {
        alert(data.error || "Failed to save changes");
      }
    } catch (err) {
      console.error("Failed to save employee changes", err);
      alert("Error saving changes");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, empId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("employeeId", empId);

    try {
      const res = await fetch("/api/employees/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setEmployees(employees.map(e => e.id === empId ? { ...e, photoFileName: data.photoFileName } : e));
      } else {
        alert(data.error || "Failed to upload photo");
      }
    } catch (err) {
      console.error("Photo upload failed", err);
      alert("Photo upload failed");
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.title) {
      alert("Name and Title are required!");
      return;
    }

    setAdding(true);
    try {
      const formData = new FormData();
      formData.append("name", addForm.name);
      formData.append("title", addForm.title);
      formData.append("email", addForm.email);
      formData.append("birthday", addForm.birthday);
      formData.append("appointmentDate", addForm.appointmentDate);

      if (birthdayPhoto) formData.append("birthdayPhoto", birthdayPhoto);
      if (idPhoto) formData.append("idPhoto", idPhoto);

      const res = await fetch("/api/employees", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setEmployees([...employees, data.employee]);
        setIsAddModalOpen(false);
        setAddForm({ name: "", title: "", email: "", birthday: "", appointmentDate: "" });
        setBirthdayPhoto(null);
        setIdPhoto(null);
      } else {
        alert(data.error || "Failed to add employee");
      }
    } catch (err) {
      console.error("Add employee error:", err);
      alert("Failed to add employee");
    }
    setAdding(false);
  };

  const cleanQuery = searchQuery.trim().toLowerCase();
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(cleanQuery) ||
    emp.title.toLowerCase().includes(cleanQuery) ||
    (emp.email && emp.email.toLowerCase().includes(cleanQuery))
  );

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 apple-glass border-b border-slate-200/80 px-8 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-sm">
              👥
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-slate-900">Employee Directory</h1>
              <p className="text-[11px] text-slate-500 font-medium">Manage Team Records & Photo Assets</p>
            </div>
            <span className="px-2.5 py-0.5 text-[11px] font-extrabold text-blue-700 bg-blue-50 rounded-full border border-blue-200/80 ml-2">
              {employees.length} Members
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-72">
              <input 
                type="text" 
                placeholder="Search by name, title, email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium placeholder-slate-400"
              />
              <Search className="absolute left-3.5 top-2.5 text-slate-400" size={15} />
            </div>
            
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-2xl transition-all shadow-md shadow-blue-600/25 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <Plus size={15} />
              Add Employee
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1600px] mx-auto p-6 md:p-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                  <th className="py-4 px-6 w-20">Avatar</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Title</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Birthday (MM-DD)</th>
                  <th className="py-4 px-6">Appointment Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-xs font-semibold text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                        Loading employee directory...
                      </div>
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-xs font-semibold text-slate-400">
                      No employees found matching "{searchQuery}"
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => {
                    const isEditing = editingId === emp.id;

                    return (
                      <tr 
                        key={emp.id} 
                        className={`transition-colors group ${
                          isEditing ? "bg-blue-50/30" : "hover:bg-slate-50/60"
                        }`}
                      >
                        {/* Avatar Column */}
                        <td className="py-4 px-6">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                            <img 
                              src={`/assets/templates/Id%20Card%20Employee%20Images/${encodeURIComponent(emp.photoFileName)}`} 
                              alt={emp.name} 
                              className="w-full h-full object-cover object-top"
                              onError={(e) => (e.currentTarget.src = '/assets/templates/overlay.png')}
                            />
                            {/* Photo Upload Hover Overlay */}
                            <label className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                              <Upload size={15} className="text-white" />
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => handlePhotoUpload(e, emp.id)}
                              />
                            </label>
                          </div>
                        </td>

                        {/* Name Column */}
                        <td className="py-4 px-6">
                          {isEditing ? (
                            <input 
                              type="text" 
                              value={editForm.name} 
                              onChange={e => setEditForm({...editForm, name: e.target.value})}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                            />
                          ) : (
                            <div className="font-extrabold text-xs text-slate-900">{emp.name}</div>
                          )}
                        </td>

                        {/* Title Column */}
                        <td className="py-4 px-6">
                          {isEditing ? (
                            <input 
                              type="text" 
                              value={editForm.title} 
                              onChange={e => setEditForm({...editForm, title: e.target.value})}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                            />
                          ) : (
                            <div className="text-xs text-slate-600 font-medium">{emp.title}</div>
                          )}
                        </td>

                        {/* Email Column */}
                        <td className="py-4 px-6">
                          {isEditing ? (
                            <input 
                              type="email" 
                              value={editForm.email} 
                              onChange={e => setEditForm({...editForm, email: e.target.value})}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                            />
                          ) : (
                            <div className="text-xs text-slate-500 font-mono">{emp.email || "—"}</div>
                          )}
                        </td>

                        {/* Birthday Column */}
                        <td className="py-4 px-6">
                          {isEditing ? (
                            <input 
                              type="text" 
                              value={editForm.birthday} 
                              placeholder="MM-DD"
                              onChange={e => setEditForm({...editForm, birthday: e.target.value})}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                            />
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                              🎂 {emp.birthday || "N/A"}
                            </span>
                          )}
                        </td>

                        {/* Appointment Date Column */}
                        <td className="py-4 px-6">
                          {isEditing ? (
                            <input 
                              type="text" 
                              value={editForm.appointmentDate} 
                              placeholder="DD-MMM-YYYY"
                              onChange={e => setEditForm({...editForm, appointmentDate: e.target.value})}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                            />
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                              🎓 {emp.appointmentDate || "N/A"}
                            </span>
                          )}
                        </td>

                        {/* Actions Column */}
                        <td className="py-4 px-6 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={saveEditing}
                                className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer"
                                title="Save Changes"
                              >
                                <Save size={14} />
                              </button>
                              <button 
                                onClick={cancelEditing}
                                className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-all flex items-center justify-center cursor-pointer"
                                title="Cancel"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => startEditing(emp)}
                                className="p-2 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl transition-all border border-slate-200/80 flex items-center justify-center cursor-pointer"
                                title="Edit Employee"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                onClick={() => setDeletingEmployee(emp)}
                                className="p-2 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all border border-slate-200/80 flex items-center justify-center cursor-pointer"
                                title="Delete Employee"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ── Apple-Grade Inline Delete Confirmation Modal ────────────────────── */}
      {deletingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-md w-full space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
              <AlertTriangle size={28} />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Delete Employee Profile?</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Are you sure you want to delete <b className="text-slate-900">{deletingEmployee.name}</b>? This will remove their record and photo assets permanently.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingEmployee(null)}
                disabled={isDeleting}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-extrabold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteEmployee}
                disabled={isDeleting}
                className="py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-extrabold transition-all shadow-md shadow-red-600/25 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Apple-Grade Add Employee Modal ────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Add New Employee</h2>
                  <p className="text-xs text-slate-500 font-medium">Create profile and upload photo assets</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-5">
              {/* Name & Title */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Full Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. John Doe"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Designation Title *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Software Engineer"
                    value={addForm.title}
                    onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  placeholder="e.g. john@gritfeat.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                />
              </div>

              {/* Birthday (AD / BS Converter) */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Calendar size={14} className="text-amber-500" /> Birthday Selection
                  </label>
                  <div className="flex bg-slate-200 p-0.5 rounded-lg text-[10px] font-extrabold">
                    <button
                      type="button"
                      onClick={() => setBdayTab("AD")}
                      className={`px-2.5 py-0.5 rounded-md transition-all ${bdayTab === "AD" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
                    >
                      AD (English)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBdayTab("BS")}
                      className={`px-2.5 py-0.5 rounded-md transition-all ${bdayTab === "BS" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
                    >
                      BS (Nepali)
                    </button>
                  </div>
                </div>

                {bdayTab === "AD" ? (
                  <input
                    type="date"
                    onChange={(e) => handleBdayAdChange(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={bdayBsYear}
                      onChange={(e) => setBdayBsYear(parseInt(e.target.value))}
                      className="px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    >
                      {Array.from({ length: 80 }, (_, i) => 2010 + i).map((y) => (
                        <option key={y} value={y}>{y} BS</option>
                      ))}
                    </select>
                    <select
                      value={bdayBsMonth}
                      onChange={(e) => setBdayBsMonth(parseInt(e.target.value))}
                      className="px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    >
                      {["Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"].map((m, idx) => (
                        <option key={m} value={idx + 1}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={bdayBsDay}
                      onChange={(e) => setBdayBsDay(parseInt(e.target.value))}
                      className="px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    >
                      {Array.from({ length: 32 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="text-[11px] font-bold text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200/60">
                  Converted Birthday (MM-DD): <b>{addForm.birthday || "Not selected"}</b>
                </div>
              </div>

              {/* Appointment Date (AD / BS Converter) */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Calendar size={14} className="text-emerald-500" /> Appointment Date
                  </label>
                  <div className="flex bg-slate-200 p-0.5 rounded-lg text-[10px] font-extrabold">
                    <button
                      type="button"
                      onClick={() => setApptTab("AD")}
                      className={`px-2.5 py-0.5 rounded-md transition-all ${apptTab === "AD" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
                    >
                      AD (English)
                    </button>
                    <button
                      type="button"
                      onClick={() => setApptTab("BS")}
                      className={`px-2.5 py-0.5 rounded-md transition-all ${apptTab === "BS" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
                    >
                      BS (Nepali)
                    </button>
                  </div>
                </div>

                {apptTab === "AD" ? (
                  <input
                    type="date"
                    onChange={(e) => handleApptAdChange(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={apptBsYear}
                      onChange={(e) => setApptBsYear(parseInt(e.target.value))}
                      className="px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    >
                      {Array.from({ length: 80 }, (_, i) => 2010 + i).map((y) => (
                        <option key={y} value={y}>{y} BS</option>
                      ))}
                    </select>
                    <select
                      value={apptBsMonth}
                      onChange={(e) => setApptBsMonth(parseInt(e.target.value))}
                      className="px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    >
                      {["Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"].map((m, idx) => (
                        <option key={m} value={idx + 1}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={apptBsDay}
                      onChange={(e) => setApptBsDay(parseInt(e.target.value))}
                      className="px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    >
                      {Array.from({ length: 32 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200/60">
                  Converted Appointment Date: <b>{addForm.appointmentDate || "Not selected"}</b>
                </div>
              </div>

              {/* Photo Upload Dropzones */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Birthday Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBirthdayPhoto(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">ID Card Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setIdPhoto(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-extrabold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-extrabold transition-all shadow-md shadow-blue-600/25 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider disabled:opacity-50"
                >
                  {adding ? "Saving Employee..." : "Create Employee"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
