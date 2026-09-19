"use client";

import React, { useState, useEffect } from "react";
import { useOfficerAuth } from "@/context/OfficerAuthContext";
import { ShieldAlert, Users, PlusCircle, CheckCircle, Ban, Edit } from "lucide-react";
import OfficerProtectedGuard from "@/components/OfficerProtectedGuard";

interface OfficerAccount {
  id: string;
  employee_code: string;
  full_name: string;
  email: string;
  department: string;
  designation: string;
  role: string;
  district: string;
  taluk: string;
  account_status: string;
  last_login_at: string;
}

export default function AdminPortalPage() {
  const { officer, token } = useOfficerAuth();
  const [officers, setOfficers] = useState<OfficerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Officer Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    employee_code: "", full_name: "", email: "", phone: "", department: "",
    designation: "", role: "SURVEY_OFFICER", district: "", taluk: "", password: "Password123"
  });

  const fetchOfficers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/admin/officers`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOfficers(data.officers);
      } else {
        setError(data.error || "Failed to load officers");
      }
    } catch (err) {
      setError("Network error loading officers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (officer?.role === "SUPER_ADMIN") {
      fetchOfficers();
    }
  }, [officer]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/admin/officers/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchOfficers();
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/admin/officers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: "include",
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowAddModal(false);
        fetchOfficers();
      } else {
        alert(data.error || "Failed to provision officer");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  if (officer?.role !== "SUPER_ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You must have SUPER_ADMIN privileges to access this area.</p>
        </div>
      </div>
    );
  }

  return (
    <OfficerProtectedGuard>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#102A43] flex items-center gap-2">
              <Users className="w-6 h-6 text-[#1D5FD1]" />
              Officer Provisioning & Management
            </h1>
            <p className="text-sm text-[#53627A]">Manage system access, roles, and administrative privileges</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1D5FD1] text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Provision Officer
          </button>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">{error}</div>}

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Code / Name</th>
                <th className="px-4 py-3 font-semibold">Department & Role</th>
                <th className="px-4 py-3 font-semibold">Jurisdiction</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading officers...</td></tr>
              ) : officers.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{o.full_name}</div>
                    <div className="text-xs">{o.employee_code} | {o.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{o.designation}</div>
                    <div className="text-xs font-mono text-blue-600">{o.role}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {o.district ? `${o.district} ${o.taluk ? `/ ${o.taluk}` : ''}` : 'Statewide'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      o.account_status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      o.account_status === 'SUSPENDED' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {o.account_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {o.account_status === 'ACTIVE' ? (
                      <button onClick={() => handleStatusChange(o.id, 'SUSPENDED')} className="text-red-600 hover:text-red-900 text-xs font-semibold ml-3 flex items-center justify-end gap-1"><Ban className="w-3 h-3"/> Suspend</button>
                    ) : (
                      <button onClick={() => handleStatusChange(o.id, 'ACTIVE')} className="text-green-600 hover:text-green-900 text-xs font-semibold ml-3 flex items-center justify-end gap-1"><CheckCircle className="w-3 h-3"/> Activate</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                <h3 className="text-lg font-bold text-gray-900">Provision New Officer Account</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-800">×</button>
              </div>
              <form onSubmit={handleAddSubmit} className="p-6 grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Employee Code</label>
                  <input required type="text" value={formData.employee_code} onChange={e => setFormData({...formData, employee_code: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                  <input required type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                  <input required type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Designation</label>
                  <input required type="text" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">System Role</label>
                  <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none">
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                    <option value="STATE_OFFICER">STATE_OFFICER</option>
                    <option value="DISTRICT_COLLECTOR">DISTRICT_COLLECTOR</option>
                    <option value="TAHSILDAR">TAHSILDAR</option>
                    <option value="SURVEY_OFFICER">SURVEY_OFFICER</option>
                    <option value="SUB_REGISTRAR">SUB_REGISTRAR</option>
                    <option value="TOWN_PLANNER">TOWN_PLANNER</option>
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Temporary Password</label>
                  <input required type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">District</label>
                  <input type="text" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none" placeholder="Leave blank for statewide" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Taluk</label>
                  <input type="text" value={formData.taluk} onChange={e => setFormData({...formData, taluk: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none" placeholder="Leave blank if not applicable" />
                </div>
                <div className="col-span-2 pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold">Create Account</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </OfficerProtectedGuard>
  );
}
