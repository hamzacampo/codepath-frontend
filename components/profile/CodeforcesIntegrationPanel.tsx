"use client";

import { useState } from "react";
import { CodeforcesAccountCard } from "@/components/profile/CodeforcesAccountCard";
import { CodeforcesConnectDialog } from "@/components/profile/CodeforcesConnectDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { NotificationToast } from "@/components/ui/NotificationToast";
import { useCodeforcesIntegration } from "@/hooks/use-codeforces-integration";
import { getApiErrorMessage } from "@/lib/errors";

export function CodeforcesIntegrationPanel() {
  const {
    integration,
    loading,
    connectOpen,
    setConnectOpen,
    connectLoading,
    connectError,
    openConnect,
    connect,
    disconnect,
  } = useCodeforcesIntegration();

  const [disconnecting, setDisconnecting] = useState(false);
  const [disconnectConfirmOpen, setDisconnectConfirmOpen] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const codeforcesAccount =
    integration?.linked && integration.handle
      ? {
          id: 0,
          platform: "Codeforces",
          handle: integration.handle,
          isVerified: integration.isVerified,
          lastSynced: integration.lastSynced,
          createdAt: "",
          updatedAt: "",
        }
      : null;

  const handleConnect = async (handle: string) => {
    const result = await connect(handle);
    if (result.ok) {
      setToast({
        type: "success",
        message: "Codeforces account connected successfully.",
      });
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await disconnect();
      setDisconnectConfirmOpen(false);
      setToast({
        type: "success",
        message: "Codeforces account disconnected successfully.",
      });
    } catch (err) {
      setToast({
        type: "error",
        message: getApiErrorMessage(err, "Failed to disconnect Codeforces account."),
      });
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        Loading Codeforces connection...
      </div>
    );
  }

  return (
    <>
      <CodeforcesConnectDialog
        open={connectOpen}
        onOpenChange={setConnectOpen}
        onConnect={handleConnect}
        loading={connectLoading}
        error={connectError}
      />
      <ConfirmDialog
        open={disconnectConfirmOpen}
        onOpenChange={setDisconnectConfirmOpen}
        title="Disconnect Codeforces?"
        description="Your synced Codeforces submissions will no longer update until you connect again."
        confirmLabel="Disconnect"
        action="disconnect"
        loading={disconnecting}
        onConfirm={handleDisconnect}
      />
      {toast && (
        <NotificationToast
          type={toast.type}
          message={toast.message}
          onDismiss={() => setToast(null)}
        />
      )}

      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Connected Accounts</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Link Codeforces to sync external problem submissions and analytics.
          </p>
        </div>
        <CodeforcesAccountCard
          account={codeforcesAccount}
          onConnect={openConnect}
          onDisconnect={() => setDisconnectConfirmOpen(true)}
          disconnecting={disconnecting}
        />
      </div>
    </>
  );
}
