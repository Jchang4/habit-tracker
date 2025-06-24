import { Image } from "@mantine/core";

interface LogoProps {
  width?: number;
  height?: number;
}

export default function Logo({ width = 100, height = 100 }: LogoProps) {
  return (
    <Image
      src="./amor-habits-logo.png"
      alt="Amor Habits Logo"
      width={width}
      height={height}
      fit="contain"
    />
  );
}
