"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { NotificationToast } from "@/components/ui/NotificationToast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CodeforcesAccountCard } from "@/components/profile/CodeforcesAccountCard";
import { CodeforcesConnectDialog } from "@/components/profile/CodeforcesConnectDialog";
import { apiService } from "@/lib/api-service";
import { getApiErrorMessage } from "@/lib/errors";
import type {
  CodeforcesIntegrationStatus,
  MenteeProfileResponse,
  SkillLevelOption,
  SkillLevelPreference,
  SkillSyncStatus,
} from "@/types";
import { LevelPreferenceDialog } from "@/components/profile/LevelPreferenceDialog";

const inputClass =
  "w-full max-w-full min-w-0 p-2 rounded-lg border border-accent text-accent bg-transparent placeholder:text-accent focus:outline-none focus:ring-2 focus:ring-accent box-border";

export default function ProfilePage() {
  const [data, setData] = useState<MenteeProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");
  const [profileUpdating, setProfileUpdating] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [menteeStats, setMenteeStats] = useState<{
    codePathRating: number;
    codePathLevel: string;
    problemsSolved: number;
    accuracy: number;
  } | null>(null);

  const [cfIntegration, setCfIntegration] = useState<CodeforcesIntegrationStatus | null>(null);
  const [connectOpen, setConnectOpen] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [disconnectConfirmOpen, setDisconnectConfirmOpen] = useState(false);
  const [levelOptionsOpen, setLevelOptionsOpen] = useState(false);
  const [levelOptions, setLevelOptions] = useState<SkillLevelOption[]>([]);
  const [levelCurrentPreference, setLevelCurrentPreference] =
    useState<SkillLevelPreference | null>(null);
  const [levelChoiceMandatory, setLevelChoiceMandatory] = useState(false);
  const [levelOptionsLoading, setLevelOptionsLoading] = useState(false);
  const [levelPreferenceSaving, setLevelPreferenceSaving] = useState(false);
  const [levelOptionsError, setLevelOptionsError] = useState<string | null>(null);
  const [skillSyncStatus, setSkillSyncStatus] = useState<SkillSyncStatus>("idle");
  const [skillSyncMessage, setSkillSyncMessage] = useState<string | null>(null);
  const [skillSyncPending, setSkillSyncPending] = useState(false);
  const syncPollActive = useRef(false);
  const pendingChoiceFetchRef = useRef(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const loadCodeforcesIntegration = useCallback(async () => {
    try {
      const status = await apiService.getCodeforcesIntegration();
      setCfIntegration(status);
    } catch {
      setCfIntegration({ linked: false, handle: null, isVerified: false, lastSynced: null, codePathLevel: null });
    }
  }, []);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await loadCodeforcesIntegration();
      const res = await apiService.getMenteeProfile();
      setData(res);
      setFullName(res.mentee.fullName ?? "");
      setPhone(res.mentee.phone ?? "");
      setCountry(res.mentee.country ?? "");
      setBio(res.mentee.bio ?? "");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load profile"));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [loadCodeforcesIntegration]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const refreshMenteeStats = useCallback(async () => {
    const stats = await apiService.getMenteeStatistics();
    setMenteeStats({
      codePathRating: stats.codePathRating ?? 0,
      codePathLevel: stats.codePathLevel ?? "—",
      problemsSolved: stats.problemsSolved ?? 0,
      accuracy: stats.accuracy ?? 0,
    });
  }, []);

  const loadProfileQuiet = useCallback(async () => {
    try {
      await loadCodeforcesIntegration();
      const res = await apiService.getMenteeProfile();
      setData(res);
    } catch {
      // keep existing profile data during background refresh
    }
  }, [loadCodeforcesIntegration]);

  useEffect(() => {
    refreshMenteeStats().catch(() => setMenteeStats(null));
  }, [refreshMenteeStats]);

  useEffect(() => {
    if (cfIntegration?.linked) {
      void refreshMenteeStats();
    }
  }, [cfIntegration?.linked, skillSyncStatus, data?.skillProfile?.sources.codeforces.problemsSolved, refreshMenteeStats]);

  const pollSkillSync = useCallback(async () => {
    if (syncPollActive.current) return;
    syncPollActive.current = true;
    setSkillSyncPending(true);
    setSkillSyncStatus("syncing");
    setSkillSyncMessage(null);

    try {
      while (true) {
        const sync = await apiService.getSkillSyncStatus();
        setSkillSyncStatus(sync.status);

        if (sync.status === "complete") {
          await loadProfileQuiet();
          await refreshMenteeStats();
          if (sync.error) {
            setSkillSyncMessage(sync.error);
          } else {
            setSkillSyncMessage(null);
            setNotification({
              type: "success",
              message: "Skill level sync completed.",
            });
          }
          break;
        }

        if (sync.status === "failed") {
          setSkillSyncMessage(
            sync.error ?? "Skill sync failed. Try reconnecting Codeforces.",
          );
          break;
        }

        if (sync.status !== "syncing") {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    } finally {
      setSkillSyncPending(false);
      syncPollActive.current = false;
    }
  }, [loadProfileQuiet, refreshMenteeStats]);

  useEffect(() => {
    const status = data?.skillProfile?.syncStatus;
    if (!status) return;

    setSkillSyncStatus(status);
    if (status === "failed" || (status === "complete" && data.skillProfile?.syncError)) {
      setSkillSyncMessage(data.skillProfile?.syncError ?? null);
    }

    if (status === "syncing") {
      void pollSkillSync();
    }
  }, [data?.skillProfile?.syncStatus, data?.skillProfile?.syncError, pollSkillSync]);

  const openLevelChoiceDialog = useCallback(
    (
      opts: SkillLevelOption[],
      mandatory = false,
      currentPreference?: SkillLevelPreference | null,
    ) => {
      setLevelOptions(opts);
      setLevelCurrentPreference(currentPreference ?? null);
      setLevelChoiceMandatory(mandatory);
      setLevelOptionsError(null);
      setLevelOptionsOpen(true);
    },
    [],
  );

  useEffect(() => {
    const status = data?.skillProfile?.syncStatus;
    if (status !== "pending_choice") {
      pendingChoiceFetchRef.current = false;
      return;
    }
    if (levelOptionsOpen || pendingChoiceFetchRef.current) return;

    pendingChoiceFetchRef.current = true;
    setLevelOptionsLoading(true);
    apiService
      .getSkillLevelOptions()
      .then((res) => {
        if (res.options.length <= 1) {
          pendingChoiceFetchRef.current = false;
          void loadProfileQuiet();
          if (res.autoResolved) {
            void pollSkillSync();
          }
          return;
        }
        openLevelChoiceDialog(res.options, true, res.currentPreference);
      })
      .catch((err) => {
        pendingChoiceFetchRef.current = false;
        setLevelOptionsError(
          getApiErrorMessage(err, "Failed to load level options."),
        );
        setLevelOptionsOpen(true);
      })
      .finally(() => setLevelOptionsLoading(false));
  }, [data?.skillProfile?.syncStatus, levelOptionsOpen, openLevelChoiceDialog, loadProfileQuiet, pollSkillSync]);

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
    } catch (err) {
      setProfileMessage({ type: "error", text: getApiErrorMessage(err, "Failed to update profile.") });
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
    } catch (err) {
      setPasswordMessage({ type: "error", text: getApiErrorMessage(err, "Failed to update password.") });
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleConnectCodeforces = async (handle: string) => {
    setConnectLoading(true);
    setConnectError(null);
    try {
      const result = await apiService.integrateCodeforces(handle);
      setConnectOpen(false);
      await loadProfileQuiet();
      void refreshMenteeStats();

      setNotification({
        type: "success",
        message:
          result.requiresLevelChoice
            ? result.message ||
              "Codeforces connected. Choose how CodePath should calculate your level."
            : result.message || "Codeforces account connected successfully.",
      });
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to connect Codeforces account.");
      setConnectError(message);
      setNotification({ type: "error", message });
    } finally {
      setConnectLoading(false);
    }
  };

  const handleDisconnectCodeforces = async () => {
    setDisconnecting(true);
    try {
      const result = await apiService.disconnectCodeforces();
      setDisconnectConfirmOpen(false);
      setNotification({
        type: "success",
        message: result.message || "Codeforces account disconnected successfully.",
      });
      await loadProfile();
      void pollSkillSync();
    } catch (err) {
      setNotification({
        type: "error",
        message: getApiErrorMessage(err, "Failed to disconnect Codeforces account."),
      });
    } finally {
      setDisconnecting(false);
    }
  };

  const openLevelPreferenceDialog = async () => {
    if (!cfIntegration?.linked) {
      return;
    }

    if (skillSyncPending || skillSyncStatus === "syncing") {
      setNotification({
        type: "error",
        message: "Please wait — your skill level is still syncing from Codeforces.",
      });
      return;
    }

    setLevelOptionsOpen(true);
    setLevelOptionsLoading(true);
    setLevelOptionsError(null);
    setLevelOptions([]);
    setLevelCurrentPreference(data?.skillProfile?.levelPreference ?? null);
    setLevelChoiceMandatory(false);
    try {
      const res = await apiService.getSkillLevelOptions();
      if (res.options.length <= 1) {
        setLevelOptionsOpen(false);
        return;
      }
      openLevelChoiceDialog(res.options, false, res.currentPreference);
    } catch (err) {
      setLevelOptionsError(
        getApiErrorMessage(err, "Failed to load level options."),
      );
    } finally {
      setLevelOptionsLoading(false);
    }
  };

  const handleApplyLevelPreference = async (preference: SkillLevelPreference) => {
    setLevelPreferenceSaving(true);
    try {
      const result = await apiService.setSkillLevelPreference(preference, "rules");
      setLevelOptionsOpen(false);
      setLevelChoiceMandatory(false);
      await loadProfileQuiet();
      setNotification({
        type: "success",
        message: "Updating your level…",
      });
      if (result.skillSyncPending) {
        void pollSkillSync();
      } else {
        await refreshMenteeStats();
      }
    } catch (err) {
      setNotification({
        type: "error",
        message: getApiErrorMessage(err, "Failed to update level preference."),
      });
    } finally {
      setLevelPreferenceSaving(false);
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

  const { mentee, statistics, skillProfile } = data;
  const isSkillSyncing = skillSyncPending || skillSyncStatus === "syncing";
  const quizResult = statistics?.quizResult ?? "—";
  const cfConnected = skillProfile?.sources.codeforces.connected ?? cfIntegration?.linked ?? false;
  const cfProblemsSolved = skillProfile?.sources.codeforces.problemsSolved ?? 0;
  const codepathProblemsSolved = skillProfile?.sources.codepath.solvedCount ?? 0;
  const liveCfCount =
    menteeStats?.problemsSolved ?? statistics?.problemsSolved ?? cfProblemsSolved;
  const cfCountLooksStale =
    cfConnected &&
    codepathProblemsSolved > 0 &&
    liveCfCount === codepathProblemsSolved;
  const cfCountPending =
    cfConnected &&
    (cfCountLooksStale ||
      (liveCfCount === 0 &&
        (isSkillSyncing || skillSyncStatus === "syncing" || skillSyncStatus === "pending_choice")));
  const displayProblemsSolved = cfConnected
    ? cfCountPending
      ? null
      : liveCfCount
    : codepathProblemsSolved;
  const levelLabel = skillProfile?.tier ?? statistics?.level ?? "—";
  const ratingLabel =
    skillProfile?.rating ?? statistics?.rating ?? menteeStats?.codePathRating ?? "—";
  const confidenceLabel = skillProfile?.confidence ?? statistics?.confidence;
  const sourceLabel = skillProfile?.primarySource ?? statistics?.primarySource;

  const codeforcesAccount =
    cfIntegration?.linked && cfIntegration.handle
      ? {
          id: 0,
          platform: "Codeforces",
          handle: cfIntegration.handle,
          lastSynced: cfIntegration.lastSynced,
          isVerified: cfIntegration.isVerified,
          createdAt: "",
          updatedAt: "",
        }
      : null;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {notification && (
        <NotificationToast
          type={notification.type}
          message={notification.message}
          onDismiss={() => setNotification(null)}
        />
      )}

      <CodeforcesConnectDialog
        open={connectOpen}
        onOpenChange={(open) => {
          setConnectOpen(open);
          if (!open) setConnectError(null);
        }}
        onConnect={handleConnectCodeforces}
        loading={connectLoading}
        error={connectError}
      />

      <ConfirmDialog
        open={disconnectConfirmOpen}
        onOpenChange={setDisconnectConfirmOpen}
        title="Disconnect Codeforces?"
        description="Your CodePrint analytics will no longer sync from Codeforces until you connect again. You can choose how your level is calculated afterward."
        confirmLabel="Disconnect"
        cancelLabel="Keep connected"
        variant="destructive"
        action="disconnect"
        loading={disconnecting}
        onConfirm={handleDisconnectCodeforces}
      />

      <LevelPreferenceDialog
        open={levelOptionsOpen}
        onOpenChange={(open) => {
          if (!open) {
            setLevelChoiceMandatory(false);
            setLevelOptionsError(null);
            setLevelCurrentPreference(null);
          }
          setLevelOptionsOpen(open);
        }}
        options={levelOptions}
        currentPreference={
          levelCurrentPreference ?? data?.skillProfile?.levelPreference ?? null
        }
        optionsLoading={levelOptionsLoading}
        saving={levelPreferenceSaving}
        errorMessage={levelOptionsError}
        mandatory={levelChoiceMandatory}
        onConfirm={handleApplyLevelPreference}
      />

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
            <CodeforcesAccountCard
              account={codeforcesAccount}
              onConnect={() => setConnectOpen(true)}
              onDisconnect={() => setDisconnectConfirmOpen(true)}
              disconnecting={disconnecting}
            />
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
                  CodePath Level: {levelLabel}
                  {confidenceLabel ? ` (${confidenceLabel} confidence)` : ""}
                </span>
                <span className="w-full rounded-lg bg-linear-to-r from-accent to-[#3F305C] px-4 py-2 text-accent-foreground text-sm font-bold">
                  CodePath Rating: {ratingLabel}
                </span>
                <span className="w-full rounded-lg bg-linear-to-r from-accent to-[#3F305C] px-4 py-2 text-accent-foreground text-sm font-bold">
                  {cfConnected ? "Codeforces Solved" : "CodePath Solved"}:{" "}
                  {displayProblemsSolved ?? "Updating…"}
                  {cfCountPending && (
                    <span className="block text-[10px] font-normal opacity-80 mt-0.5">
                      Syncing your full Codeforces history — count updates after sync
                    </span>
                  )}
                </span>
                {cfConnected && (
                  <span className="w-full rounded-lg border border-accent/40 px-4 py-2 text-accent text-xs">
                    CodePath platform solves: {codepathProblemsSolved}
                    {skillProfile
                      ? ` · Contests finished: ${skillProfile.sources.contest.finishedCount}`
                      : ""}
                    {skillProfile?.sources.codeforces.handle
                      ? ` · CF handle: ${skillProfile.sources.codeforces.handle}`
                      : ""}
                  </span>
                )}
                <span className="w-full rounded-lg bg-linear-to-r from-accent to-[#3F305C] px-4 py-2 text-accent-foreground text-sm font-bold">
                  Accuracy: {menteeStats != null ? `${menteeStats.accuracy}%` : "—"}
                </span>
                {sourceLabel && (
                  <span className="w-full rounded-lg bg-linear-to-r from-accent to-[#3F305C] px-4 py-2 text-accent-foreground text-sm font-bold capitalize">
                    Level source: {sourceLabel.replace("_", " ")}
                  </span>
                )}
                {skillProfile && !cfConnected && (
                  <span className="w-full rounded-lg border border-accent/40 px-4 py-2 text-accent text-xs">
                    Connect Codeforces on your profile to include your full competitive programming history
                    ({codepathProblemsSolved} solves tracked on CodePath so far).
                  </span>
                )}
                {skillProfile && cfConnected && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={openLevelPreferenceDialog}
                      disabled={isSkillSyncing || levelOptionsLoading}
                    >
                      {isSkillSyncing
                        ? "Syncing level — please wait..."
                        : levelOptionsLoading
                          ? "Loading options..."
                          : "How is my level calculated?"}
                    </Button>
                    {isSkillSyncing && (
                      <span className="w-full rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-100 text-xs flex items-center gap-2">
                        <Icon icon="svg-spinners:ring-resize" className="w-4 h-4 shrink-0" />
                        Syncing full stats and calculating your level… You can change settings when this finishes.
                      </span>
                    )}
                    {!isSkillSyncing && skillSyncStatus === "failed" && skillSyncMessage && (
                      <span className="w-full rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-destructive text-xs">
                        {skillSyncMessage}
                      </span>
                    )}
                    {!isSkillSyncing &&
                      skillSyncStatus === "complete" &&
                      skillSyncMessage && (
                        <span className="w-full rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-100 text-xs">
                          {skillSyncMessage}
                        </span>
                      )}
                  </>
                )}
                <span className="w-full rounded-lg bg-linear-to-r from-accent to-[#3F305C] px-4 py-2 text-accent-foreground text-sm font-bold">
                  Quiz Result: {quizResult}
                </span>
                <Link
                  href="/dashboard/quiz"
                  className="w-full inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Retake placement quiz
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
