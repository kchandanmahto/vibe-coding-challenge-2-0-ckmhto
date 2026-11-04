import Image from "next/image";

export function BrandLogo({
  size = 44,
  priority = false,
  variant = "logo",
}: {
  size?: number;
  priority?: boolean;
  variant?: "logo" | "icon";
}) {
  const icon = variant === "icon";
  return (
    <Image
      src={icon ? "/icons/academy-desk-icon.png" : "/logos/academy-desk-logo.png"}
      alt="Academy Desk"
      width={size}
      height={icon ? size : Math.round(size * (1024 / 1536))}
      priority={priority}
      className="shrink-0 rounded-xl object-contain"
    />
  );
}
