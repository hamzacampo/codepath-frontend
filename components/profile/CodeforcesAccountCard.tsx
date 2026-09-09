"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import type { ExternalAccount } from "@/types";

interface CodeforcesAccountCardProps {
  account: ExternalAccount | null;
  onConnect: () => void;
  onDisconnect: () => void;
  disconnecting?: boolean;
}

export function CodeforcesAccountCard({
  account,
  onConnect,
  onDisconnect,
  disconnecting = false,
}: CodeforcesAccountCardProps) {
  const isConnected = Boolean(account?.handle);

  return (
    <div className="w-full sm:w-5/6 mx-auto bg-linear-to-r from-accent to-[#3F305C] rounded-lg p-4 box-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Icon
            icon="simple-icons:codeforces"
            className="text-accent-foreground size-7 shrink-0"
            aria-hidden
          />
          <div className="min-w-0">
            <h3 className="text-accent-foreground text-lg sm:text-xl font-bold">Codeforces</h3>
            {isConnected ? (
              <p className="text-accent-foreground/80 text-sm truncate">@{account?.handle}</p>
            ) : (
              <p className="text-accent-foreground/70 text-sm">Not connected</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {isConnected ? (
            <>
              <span className="rounded-lg bg-green-500 px-3 py-1 text-sm font-bold text-white">
                Connected
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onDisconnect}
                disabled={disconnecting}
                className="border-white/30 text-white hover:bg-white/10"
              >
                {disconnecting ? "Disconnecting..." : "Disconnect"}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={onConnect}
              className="bg-white text-[#3F305C] hover:bg-white/90 font-semibold"
            >
              Connect
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
