import { coachAvatarUrl, coachDisplayName, coachInitials } from "@/lib/coaching-utils";
import type { CoachProfile } from "@/types";

const sizeMap = {
  sm: { box: "h-14 w-14", text: "text-lg" },
  md: { box: "h-20 w-20", text: "text-2xl" },
  lg: { box: "h-[180px] w-[180px]", text: "text-4xl" },
};

type CoachAvatarProps = {
  coach: CoachProfile;
  size?: keyof typeof sizeMap;
  className?: string;
  previewUrl?: string | null;
};

export function CoachAvatar({
  coach,
  size = "sm",
  className = "",
  previewUrl,
}: CoachAvatarProps) {
  const name = coachDisplayName(coach);
  const avatarSrc = previewUrl ?? coachAvatarUrl(coach);
  const { box, text } = sizeMap[size];

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full border-2 border-primary bg-secondary ${box} ${className}`}
    >
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={`${name} profile photo`}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center font-bold text-primary ${text}`}
          aria-hidden
        >
          {coachInitials(name)}
        </div>
      )}
    </div>
  );
}
