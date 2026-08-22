import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
  as: Tag = "div",
}: {
  className?: string;
  children: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
}) {
  return <Tag className={cn("mx-auto w-full max-w-[1280px] px-4 lg:px-6", className)}>{children}</Tag>;
}
