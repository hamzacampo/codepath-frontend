"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { apiService } from "@/lib/api-service";
import type { MenteeProfileResponse } from "@/types";
import type { ExternalAccount } from "@/types";

const inputClass =
  "w-full max-w-full min-w-0 p-2 rounded-lg border border-accent text-accent bg-transparent placeholder:text-accent focus:outline-none focus:ring-2 focus:ring-accent box-border";

function normalizeExternalAccounts(
  data: ExternalAccount | ExternalAccount[] | null
): ExternalAccount[] {
  if (data == null) return [];
  return Array.isArray(data) ? data : [data];
}

export default function ProfilePage() {
  const [data, setData] = useState<MenteeProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile form state (fullName, phone, country, bio)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");
  const [profileUpdating, setProfileUpdating] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Statistics from same API as CodePrint (GET /statistics/mentee) so profile matches dashboard
  const [menteeStats, setMenteeStats] = useState<{
    codePathRating: number;
    codePathLevel: string;
    problemsSolved: number;
    accuracy: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiService
      .getMenteeProfile()
      .then((res) => {
        if (!cancelled) {
          setData(res);
          setError(null);
          setFullName(res.mentee.fullName ?? "");
          setPhone(res.mentee.phone ?? "");
          setCountry(res.mentee.country ?? "");
          setBio(res.mentee.bio ?? "");
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message =
            err && typeof err === "object" && "response" in err
              ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
              : null;
          setError(message || "Failed to load profile");
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    apiService
      .getMenteeStatistics()
      .then((res) => {
        setMenteeStats({
          codePathRating: res.codePathRating ?? 0,
          codePathLevel: res.codePathLevel ?? "—",
          problemsSolved: res.problemsSolved ?? 0,
          accuracy: res.accuracy ?? 0,
        });
      })
      .catch(() => setMenteeStats(null));
  }, []);

  const handleUpdateProfile = async () => {
    setProfileMessage(null);
    setProfileUpdating(true);
    try {
      await apiService.updateMenteeProfile({
        fullName: fullName.trim() || undefined,
        phone: phone.trim() || undefined,
        country: country.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      setProfileMessage({ type: "success", text: "Profile updated successfully." });
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setProfileMessage({ type: "error", text: message || "Failed to update profile." });
    } finally {
      setProfileUpdating(false);
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordMessage(null);
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New password and confirmation do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    setPasswordUpdating(true);
    try {
      await apiService.updateMenteePassword({
        currentPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
      });
      setPasswordMessage({ type: "success", text: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setPasswordMessage({ type: "error", text: message || "Failed to update password." });
    } finally {
      setPasswordUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex items-center justify-center min-h-[200px]">
        <p className="text-accent">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex items-center justify-center min-h-[200px]">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { mentee, externalAccountIntegration, statistics } = data;
  const accounts = normalizeExternalAccounts(externalAccountIntegration);
  const quizResult = statistics?.quizResult ?? "—";

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-stretch w-full max-w-md sm:max-w-lg lg:max-w-none mx-auto lg:mx-0">
        <div className="h-auto w-full lg:w-1/2 min-w-0 flex flex-col border border-accent rounded-lg p-6 sm:p-8 space-y-4 box-border">
          <h3 className="text-center text-accent text-2xl sm:text-3xl font-bold leading-loose">
            My Profile
          </h3>
          <div className="rounded-full bg-accent w-32 h-32 mx-auto">
            <Image src="/Avatar.png" alt="Avatar" width={128} height={128} />
          </div>
          <input
            type="text"
            placeholder="Full Name"
            className={inputClass}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Email"
            className={`${inputClass} opacity-80`}
            value={mentee.email ?? ""}
            readOnly
            disabled
            title="Email cannot be changed here"
          />
          <input
            type="text"
            placeholder="Phone"
            className={inputClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Select
            placeholder="Country"
            className={`${inputClass} pr-10 appearance-none`}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="us">United States</option>
            <option value="uk">United Kingdom</option>
            <option value="ca">Canada</option>
            <option value="au">Australia</option>
            <option value="in">India</option>
            <option value="sy">Syria</option>
            <option value="de">Germany</option>
            <option value="fr">France</option>
            <option value="eg">Egypt</option>
            <option value="sa">Saudi Arabia</option>
          </Select>
          <textarea
            placeholder="Bio"
            rows={5}
            className={`${inputClass} min-h-[120px] resize-none overflow-auto`}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          {profileMessage && (
            <p className={profileMessage.type === "success" ? "text-green-600" : "text-destructive"}>
              {profileMessage.text}
            </p>
          )}
          <div className="flex justify-center sm:justify-end">
            <Button
              type="button"
              className="w-full sm:w-auto min-w-[120px]"
              onClick={handleUpdateProfile}
              disabled={profileUpdating}
            >
              {profileUpdating ? "Updating..." : "Update profile"}
            </Button>
          </div>

          {/* Change password section */}
          <div className="border-t border-accent/50 pt-4 mt-4 space-y-4">
            <h4 className="text-accent text-lg font-semibold">Change password</h4>
            <input
              type="password"
              placeholder="Current password"
              className={inputClass}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
            <input
              type="password"
              placeholder="New password"
              className={inputClass}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              className={inputClass}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            {passwordMessage && (
              <p className={passwordMessage.type === "success" ? "text-green-600" : "text-destructive"}>
                {passwordMessage.text}
              </p>
            )}
            <Button
              type="button"
              className="w-full sm:w-auto min-w-[140px]"
              onClick={handleUpdatePassword}
              disabled={passwordUpdating}
            >
              {passwordUpdating ? "Updating..." : "Update password"}
            </Button>
          </div>
        </div>
        <div className="w-full lg:w-1/2 space-y-4 min-w-0 flex flex-col">
          <div className="border border-accent rounded-lg box-border p-6 sm:p-8 space-y-4">
            <h3 className="text-center text-accent text-2xl sm:text-3xl font-bold leading-loose">
              Connected Accounts
            </h3>
            {accounts.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-4">
                No connected accounts
              </p>
            ) : (
              <div className="space-y-3">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="w-full sm:w-5/6 mx-auto bg-linear-to-r from-accent to-[#3F305C] rounded-lg p-4 box-border"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Icon
                          icon="hugeicons:connect"
                          className="text-accent-foreground size-6 shrink-0"
                        />
                        <h3 className="text-accent-foreground text-lg sm:text-xl font-bold capitalize">
                          {account.platform}
                        </h3>
                        {account.handle && (
                          <span className="text-accent-foreground/80 text-sm">
                            @{account.handle}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="rounded-lg bg-green-500 px-3 py-1 text-sm font-bold text-white">
                          Connected
                        </span>
                        {account.lastSynced && (
                          <span className="rounded-lg bg-blue-500 px-3 py-1 text-sm font-bold text-white">
                            Synced
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="border border-accent rounded-lg box-border p-6 sm:p-8 space-y-4">
            <h3 className="text-center text-accent text-2xl sm:text-3xl font-bold leading-loose">
              Statistics
            </h3>
            <p className="text-center text-muted-foreground text-sm">
              Same data as CodePrint dashboard
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-around gap-4 sm:gap-6 w-full mx-auto items-center">
              <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 aspect-square rounded-full bg-linear-to-r from-accent to-[#3F305C] box-border flex items-center justify-center">
                <Icon
                  icon="wpf:statistics"
                  className="text-accent-foreground w-10 h-10 sm:w-14 sm:h-14"
                />
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-1/2 min-w-0 items-center sm:items-stretch">
                <span className="w-full rounded-lg bg-linear-to-r from-accent to-[#3F305C] px-4 py-2 text-accent-foreground text-sm font-bold">
                  CodePath Rating: {menteeStats != null ? menteeStats.codePathRating : "—"}
                </span>
                <span className="w-full rounded-lg bg-linear-to-r from-accent to-[#3F305C] px-4 py-2 text-accent-foreground text-sm font-bold">
                  CodePath Level: {menteeStats != null ? menteeStats.codePathLevel : "—"}
                </span>
                <span className="w-full rounded-lg bg-linear-to-r from-accent to-[#3F305C] px-4 py-2 text-accent-foreground text-sm font-bold">
                  Problems Solved: {menteeStats != null ? menteeStats.problemsSolved : "—"}
                </span>
                <span className="w-full rounded-lg bg-linear-to-r from-accent to-[#3F305C] px-4 py-2 text-accent-foreground text-sm font-bold">
                  Accuracy: {menteeStats != null ? `${menteeStats.accuracy}%` : "—"}
                </span>
                <span className="w-full rounded-lg bg-linear-to-r from-accent to-[#3F305C] px-4 py-2 text-accent-foreground text-sm font-bold">
                  Quiz Result: {quizResult}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
