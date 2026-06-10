"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  User,
  Lock,
  Mail,
  Trash2,
  AlertTriangle,
  Save,
  CheckCircle,
  Loader2,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();

  // Profile Form States
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Password Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  // Notifications Toggles
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [instantAlerts, setInstantAlerts] = useState(false);

  // Status banners
  const [successMsg, setSuccessMsg] = useState("");

  // Account deletion dialog
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // Hydrate profile data from NextAuth session
  useEffect(() => {
    if (session?.user) {
      setDisplayName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  // Load notification preferences
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/settings/notifications");
        if (res.ok) {
          const data = await res.json();
          setEmailNotifications(data.emailNotifications);
          setWeeklyReport(data.weeklyReport);
          setInstantAlerts(data.instantAlerts);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    }
    fetchNotifications();

    document.title = "Settings — AuraFi";
  }, []);

  const triggerSuccessMsg = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg("");
    }, 3000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: displayName }),
      });
      if (res.ok) {
        // Sync local auth session
        await updateSession({ name: displayName });
        triggerSuccessMsg("Profile details updated successfully!");
      } else {
        const data = await res.json();
        console.error(data.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      const data = await res.json();
      if (res.ok) {
        triggerSuccessMsg("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(data.message || "Failed to update password.");
      }
    } catch (err) {
      console.error(err);
      setPasswordError("Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailNotifications,
          weeklyReport,
          instantAlerts,
        }),
      });
      if (res.ok) {
        triggerSuccessMsg("Notification preferences saved.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    if (deleteConfirmationText.toLowerCase() !== "delete my account") {
      setDeleteError("Please type 'delete my account' exactly to confirm.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/settings/account", {
        method: "DELETE",
      });
      if (res.ok) {
        triggerSuccessMsg("Deleting account...");
        setTimeout(() => {
          // Log out and redirect
          router.push("/register");
        }, 1200);
      } else {
        setDeleteError("Failed to delete account.");
      }
    } catch (err) {
      console.error(err);
      setDeleteError("Failed to communicate with server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-4xl relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0b0914]/20 backdrop-blur-[1px] z-50">
          <Loader2 className="animate-spin text-accent-purple" size={32} />
        </div>
      )}

      {/* Success Banner */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle size={18} />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Grid of panels */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 border-b border-brand-border pb-4 mb-4">
            <User size={18} className="text-accent-purple" />
            <h3 className="font-semibold text-text-primary text-base">Profile Settings</h3>
          </div>

          <form onSubmit={handleUpdateProfile} className="flex-1 flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-brand-input border border-brand-border focus:border-accent-purple rounded-xl text-sm transition-all focus:outline-none text-text-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-4 py-2.5 bg-brand-surface border border-brand-border text-text-muted rounded-xl text-sm transition-all focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 justify-center px-4 py-2.5 bg-brand-surface border border-brand-border hover:bg-brand-surface-hover text-xs font-semibold rounded-xl text-text-primary transition-all mt-auto w-full cursor-pointer"
            >
              <Save size={14} />
              <span>Save Profile</span>
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 border-b border-brand-border pb-4 mb-4">
            <Lock size={18} className="text-accent-purple" />
            <h3 className="font-semibold text-text-primary text-base">Security Settings</h3>
          </div>

          <form onSubmit={handleUpdatePassword} className="flex-1 flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-brand-input border border-brand-border focus:border-accent-purple rounded-xl text-sm transition-all focus:outline-none text-text-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-brand-input border border-brand-border focus:border-accent-purple rounded-xl text-sm transition-all focus:outline-none text-text-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-brand-input border border-brand-border focus:border-accent-purple rounded-xl text-sm transition-all focus:outline-none text-text-primary"
                />
              </div>
            </div>

            {passwordError && (
              <p className="text-[11px] text-rose-400 font-medium">{passwordError}</p>
            )}

            <button
              type="submit"
              className="flex items-center gap-2 justify-center px-4 py-2.5 bg-brand-surface border border-brand-border hover:bg-brand-surface-hover text-xs font-semibold rounded-xl text-text-primary transition-all mt-auto w-full cursor-pointer"
            >
              <span>Update Password</span>
            </button>
          </form>
        </div>
      </section>

      {/* Notifications Preferences */}
      <section className="glass-panel rounded-2xl p-6">
        <div className="flex items-center gap-3 border-b border-brand-border pb-4 mb-6">
          <Mail size={18} className="text-accent-purple" />
          <h3 className="font-semibold text-text-primary text-base">Notification Preferences</h3>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-primary">Email Notifications</p>
              <p className="text-[10px] text-text-secondary max-w-[40ch]">Receive critical system alerts via email</p>
            </div>
            <button
              type="button"
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`w-10 h-5 rounded-full transition-colors duration-200 relative shrink-0 ${
                emailNotifications ? "bg-accent-purple" : "bg-brand-surface border border-brand-border"
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform duration-200 ${
                emailNotifications ? "translate-x-5" : "translate-x-0.5"
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-primary">Weekly Spend Reports</p>
              <p className="text-[10px] text-text-secondary max-w-[40ch]">Summary breakdown of weekly cash flow activity</p>
            </div>
            <button
              type="button"
              onClick={() => setWeeklyReport(!weeklyReport)}
              className={`w-10 h-5 rounded-full transition-colors duration-200 relative shrink-0 ${
                weeklyReport ? "bg-accent-purple" : "bg-brand-surface border border-brand-border"
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform duration-200 ${
                weeklyReport ? "translate-x-5" : "translate-x-0.5"
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-primary">Instant Sync Alerts</p>
              <p className="text-[10px] text-text-secondary max-w-[40ch]">Get notified instantly when new transactions sync</p>
            </div>
            <button
              type="button"
              onClick={() => setInstantAlerts(!instantAlerts)}
              className={`w-10 h-5 rounded-full transition-colors duration-200 relative shrink-0 ${
                instantAlerts ? "bg-accent-purple" : "bg-brand-surface border border-brand-border"
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform duration-200 ${
                instantAlerts ? "translate-x-5" : "translate-x-0.5"
              }`} />
            </button>
          </div>

          <button
            onClick={handleNotificationSave}
            className="flex items-center gap-2 justify-center px-4 py-2.5 bg-brand-surface border border-brand-border hover:bg-brand-surface-hover text-xs font-semibold rounded-xl text-text-primary transition-all mt-4 w-max ml-auto cursor-pointer"
          >
            <span>Save Preferences</span>
          </button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="glass-panel border-rose-500/20 bg-rose-950/5 rounded-2xl p-6">
        <div className="flex items-center gap-3 border-b border-rose-500/10 pb-4 mb-4 text-rose-400">
          <Trash2 size={18} />
          <h3 className="font-semibold text-text-primary text-base">Danger Zone</h3>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-sm font-semibold text-text-primary">Delete Account and Data</p>
            <p className="text-[10px] text-text-secondary max-w-[40ch]">
              Wipe all transactions, connected institutions, configurations, and details permanently.
            </p>
          </div>
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-xs font-bold rounded-xl text-white transition-all cursor-pointer"
          >
            Delete Account
          </button>
        </div>
      </section>

      {/* Cascading Delete Confirmation Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel bg-brand-sidebar border border-brand-border max-w-sm w-full p-6 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 text-text-primary">
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <AlertTriangle size={24} />
              <h4 className="font-bold text-text-primary text-base">Are you absolutely sure?</h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed mb-6">
              This action is destructive and irreversible. It will cascade-delete your credentials, 
              sessions, connected Plaid items, balance data, and transaction logs.
            </p>
            
            <div className="flex flex-col gap-2 mb-6">
              <label className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">
                Type <strong className="text-text-primary">delete my account</strong> to verify
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="delete my account"
                className="w-full px-4 py-2 bg-brand-input border border-brand-border focus:border-rose-500 rounded-xl text-xs transition-all focus:outline-none text-text-primary"
              />
              {deleteError && (
                <p className="text-[10px] text-rose-400 font-semibold">{deleteError}</p>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsDeleteOpen(false);
                  setDeleteConfirmationText("");
                  setDeleteError("");
                }}
                className="px-4 py-2 bg-brand-surface border border-brand-border hover:bg-brand-surface-hover text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-xs font-bold rounded-xl text-white transition-all cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
