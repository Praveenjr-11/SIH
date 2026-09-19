"use client";

import React, { useState } from "react";
import { useOfficerAuth } from "@/context/OfficerAuthContext";
import { ShieldCheck, User, Lock, Save, LogOut } from "lucide-react";
import OfficerProtectedGuard from "@/components/OfficerProtectedGuard";

export default function OfficerProfilePage() {
  const { officer, token, logoutOfficer } = useOfficerAuth();
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: "New passwords do not match" });
      return;
    }
    
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: "Password must be at least 8 characters long" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: "Password changed successfully" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ type: 'error', text: data.error || "Failed to change password" });
      }
    } catch (err) {
      setMessage({ type: 'error', text: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  if (!officer) return null;

  return (
    <OfficerProtectedGuard>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#102A43] flex items-center gap-2">
              <User className="w-6 h-6 text-[#1D5FD1]" />
              Officer Profile & Security
            </h1>
            <p className="text-sm text-[#53627A]">Manage your account details and security credentials</p>
          </div>
          <button 
            onClick={logoutOfficer}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Identity Card */}
          <div className="md:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="text-center pb-4 border-b border-gray-100">
              <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="font-bold text-lg text-gray-900">{officer.name}</h2>
              <p className="text-xs text-gray-500 font-mono mt-1">{officer.badgeNo}</p>
            </div>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="block text-xs font-semibold text-gray-500">Department</span>
                <span className="text-gray-900 font-medium">{officer.department}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-500">Designation & Role</span>
                <span className="text-gray-900">{officer.title} ({officer.role})</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-500">Jurisdiction</span>
                <span className="text-gray-900">{officer.district || 'Statewide'}{officer.taluk ? ` / ${officer.taluk}` : ''}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-500">Email</span>
                <span className="text-gray-900">{officer.email}</span>
              </div>
            </div>
          </div>

          {/* Security & Settings */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-gray-500" />
                Change Password
              </h3>
              
              {message && (
                <div className={`p-3 mb-4 rounded text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loading ? "Saving..." : "Update Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </OfficerProtectedGuard>
  );
}
