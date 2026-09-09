"use client";

import { useCallback, useEffect, useState } from "react";
import { apiService } from "@/lib/api-service";
import { getApiErrorMessage } from "@/lib/errors";
import type { CodeforcesIntegrationStatus } from "@/types";

const CF_LINK_REQUIRED_MSG =
  "Link your Codeforces account first to sync submissions.";

export function isCodeforcesLinkRequiredMessage(message: string): boolean {
  return message.toLowerCase().includes("link your codeforces account");
}

export function useCodeforcesIntegration() {
  const [integration, setIntegration] = useState<CodeforcesIntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectOpen, setConnectOpen] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const status = await apiService.getCodeforcesIntegration();
      setIntegration(status);
    } catch {
      setIntegration({
        linked: false,
        handle: null,
        isVerified: false,
        lastSynced: null,
        codePathLevel: null,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openConnect = useCallback(() => {
    setConnectError(null);
    setConnectOpen(true);
  }, []);

  const connect = useCallback(
    async (handle: string) => {
      setConnectLoading(true);
      setConnectError(null);
      try {
        await apiService.integrateCodeforces(handle);
        await refresh();
        setConnectOpen(false);
        return { ok: true as const };
      } catch (err) {
        const message = getApiErrorMessage(err, "Failed to connect Codeforces account.");
        setConnectError(message);
        return { ok: false as const, message };
      } finally {
        setConnectLoading(false);
      }
    },
    [refresh],
  );

  const disconnect = useCallback(async () => {
    await apiService.disconnectCodeforces();
    await refresh();
  }, [refresh]);

  const requireLinkedForSync = useCallback(() => {
    if (integration?.linked) return true;
    openConnect();
    return false;
  }, [integration?.linked, openConnect]);

  return {
    integration,
    linked: integration?.linked ?? false,
    loading,
    connectOpen,
    setConnectOpen,
    connectLoading,
    connectError,
    openConnect,
    connect,
    disconnect,
    refresh,
    requireLinkedForSync,
    CF_LINK_REQUIRED_MSG,
    isCodeforcesLinkRequiredMessage,
  };
}
