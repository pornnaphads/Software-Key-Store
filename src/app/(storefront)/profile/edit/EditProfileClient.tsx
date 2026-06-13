"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAvatarGradient } from "@/lib/avatar";

interface EditProfileClientProps {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
}

export function EditProfileClient({
  userId,
  userName,
  userEmail,
  userRole,
}: EditProfileClientProps) {
  const router = useRouter();

  // Profile data state initialized with default values from props
  const nameParts = userName.trim().split(/\s+/);
  const initialFirstName = nameParts[0] || "User";
  const initialLastName = nameParts.slice(1).join(" ") || "";

  const [profile, setProfile] = useState({
    firstName: initialFirstName,
    lastName: initialLastName,
    email: userEmail,
    profilePicture: "",
  });

  const [editFirstName, setEditFirstName] = useState(initialFirstName);
  const [editLastName, setEditLastName] = useState(initialLastName);
  const [editProfilePic, setEditProfilePic] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch updated profile data from DB on mount
  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setProfile({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            profilePicture: data.profilePicture || "",
          });
          setEditFirstName(data.firstName);
          setEditLastName(data.lastName);
          setEditProfilePic(data.profilePicture || "");
        }
      })
      .catch((err) => console.error("Error fetching profile:", err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setEditProfilePic(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!editFirstName.trim() || !editLastName.trim()) {
      setCopyMessage("กรุณากรอกชื่อและนามสกุล");
      setTimeout(() => setCopyMessage(null), 2000);
      return;
    }

    const nameRegex = /^[a-zA-Z\u0e00-\u0e7f\s]+$/;
    if (
      editFirstName.trim().length < 2 ||
      editFirstName.trim().length > 50 ||
      !nameRegex.test(editFirstName.trim())
    ) {
      setCopyMessage("ชื่อต้องเป็นภาษาไทยหรืออังกฤษ 2-50 ตัวอักษร และไม่มีตัวเลข/อักขระพิเศษ");
      setTimeout(() => setCopyMessage(null), 3000);
      return;
    }

    if (
      editLastName.trim().length < 2 ||
      editLastName.trim().length > 50 ||
      !nameRegex.test(editLastName.trim())
    ) {
      setCopyMessage("นามสกุลต้องเป็นภาษาไทยหรืออังกฤษ 2-50 ตัวอักษร และไม่มีตัวเลข/อักขระพิเศษ");
      setTimeout(() => setCopyMessage(null), 3000);
      return;
    }

    setUpdatingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: editFirstName,
          lastName: editLastName,
          profilePicture: editProfilePic.startsWith("data:image") ? editProfilePic : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProfile({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
          profilePicture: data.user.profilePicture,
        });
        setCopyMessage("บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว!");
        setTimeout(() => {
          setCopyMessage(null);
          router.push("/profile");
        }, 1500);
      } else {
        setCopyMessage(data.error || "เกิดข้อผิดพลาดในการบันทึก");
        setTimeout(() => setCopyMessage(null), 2000);
      }
    } catch (err) {
      console.error(err);
      setCopyMessage("เกิดข้อผิดพลาดในการบันทึก");
      setTimeout(() => setCopyMessage(null), 2000);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleForgotPassword = async () => {
    setForgotPasswordLoading(true);
    try {
      const res = await fetch("/api/profile/forgot-password", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCopyMessage(data.message || "ส่งรหัสกู้คืนไปที่อีเมลเรียบร้อยแล้ว!");
        setTimeout(() => setCopyMessage(null), 4000);
      } else {
        setCopyMessage(data.error || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        setTimeout(() => setCopyMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setCopyMessage("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      setTimeout(() => setCopyMessage(null), 4000);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const avatarInitial = (profile.firstName || userName).slice(0, 1).toUpperCase();
  const isAdmin = userRole === "ADMIN";

  return (
    <div className="bg-[#fdfbff] text-[#1b1b1f] font-body-md antialiased min-h-screen flex items-center justify-center pt-28 pb-16 px-4">
      <div className="w-full max-w-3xl space-y-6">
        <section className="glass-panel p-8 rounded-2xl bg-white shadow-sm border border-outline-variant/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-56 h-56 bg-accent-electric/5 blur-[80px] -z-10" />

          {/* Header (Avatar & Title) */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-outline-variant/30 mb-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {editProfilePic ? (
                <div className="w-20 h-20 rounded-full border-2 border-accent-electric overflow-hidden flex items-center justify-center bg-white shadow-md relative">
                  <img
                    src={editProfilePic}
                    alt="Profile Edit"
                    className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <span className="material-symbols-outlined text-lg">photo_camera</span>
                    <span className="text-[10px] font-medium mt-0.5">เปลี่ยนรูป</span>
                  </div>
                </div>
              ) : (
                <div className={`w-20 h-20 rounded-full ${getAvatarGradient(editFirstName || userName)} flex items-center justify-center text-white text-3xl font-bold shadow-md select-none relative group-hover:opacity-90 transition-opacity`}>
                  {avatarInitial}
                  <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-lg">photo_camera</span>
                    <span className="text-[10px] font-medium mt-0.5">เปลี่ยนรูป</span>
                  </div>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div className="text-center sm:text-left flex-grow">
              <h2 className="text-xl font-bold text-on-surface flex items-center justify-center sm:justify-start gap-2">
                <span className="material-symbols-outlined text-accent-electric">edit</span>
                แก้ไขข้อมูลส่วนตัว
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">คลิกที่รูปภาพเพื่อเปลี่ยนรูปโปรไฟล์</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* ชื่อ */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                ชื่อ
              </label>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-white rounded-xl border border-outline-variant focus-within:border-accent-electric focus-within:ring-1 focus-within:ring-accent-electric transition-all">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">person</span>
                <input
                  type="text"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full text-sm font-medium text-on-surface outline-none bg-transparent py-1.5"
                  placeholder="ชื่อ"
                />
              </div>
            </div>

            {/* นามสกุล */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                นามสกุล
              </label>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-white rounded-xl border border-outline-variant focus-within:border-accent-electric focus-within:ring-1 focus-within:ring-accent-electric transition-all">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">person</span>
                <input
                  type="text"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full text-sm font-medium text-on-surface outline-none bg-transparent py-1.5"
                  placeholder="นามสกุล"
                />
              </div>
            </div>

            {/* Email (Disabled) */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                อีเมล (ไม่สามารถแก้ไขได้)
              </p>
              <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant/30 opacity-70 cursor-not-allowed select-none">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">lock</span>
                <span className="text-sm font-medium text-on-surface-variant">{profile.email}</span>
              </div>
            </div>

            {/* Role (Disabled) */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                ประเภทบัญชี
              </p>
              <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant/30 opacity-70 select-none">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">
                  {isAdmin ? "admin_panel_settings" : "person"}
                </span>
                <span className={`text-sm font-medium ${isAdmin ? "text-red-600" : "text-accent-electric"}`}>
                  {isAdmin ? "ผู้ดูแลระบบ (Admin)" : "ผู้ใช้งานทั่วไป (Customer)"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-outline-variant/30 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="px-5 py-2.5 bg-surface-container-low hover:bg-outline-variant/20 text-on-surface rounded-xl font-semibold text-sm transition-all cursor-pointer"
              disabled={updatingProfile}
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSaveProfile}
              className="flex items-center gap-2 px-6 py-2.5 bg-accent-electric hover:bg-accent-electric/90 text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
              disabled={updatingProfile}
            >
              {updatingProfile ? (
                <>
                  <span className="ui-spinner w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">save</span>
                  <span>บันทึกการเปลี่ยนแปลง</span>
                </>
              )}
            </button>
          </div>

          {/* Forgot Password Section */}
          <div className="mt-6 pt-6 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-low/40 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                <span className="material-symbols-outlined text-lg">lock_reset</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-on-surface">ลืมรหัสผ่าน?</p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  ต้องการรีเซ็ตรหัสผ่านใหม่ผ่านระบบอีเมล
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={forgotPasswordLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {forgotPasswordLoading ? (
                <>
                  <span className="ui-spinner w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                  <span>กำลังดำเนินการ...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">mail</span>
                  <span>ลืมรหัสผ่าน</span>
                </>
              )}
            </button>
          </div>
        </section>
      </div>

      {/* Copy toast */}
      {copyMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-deep-navy text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg animate-fade-in">
          {copyMessage}
        </div>
      )}
    </div>
  );
}
