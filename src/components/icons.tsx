import Image from 'next/image';

interface LogoProps {
  size: number;
  className?: string;
}

export function LinkHubLogo({ size, className }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="LinkHub Logo"
      width={size}
      height={size}
      className={className}
    />
  );
}
