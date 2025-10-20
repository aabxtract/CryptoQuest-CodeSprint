import { cn } from "@/lib/utils";

export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-6 w-6", className)}
    >
      <path d="M10.25 4.75 4.75 8v8l5.5 3.25 5.5-3.25v-8L10.25 4.75z" fill="hsl(var(--primary))" stroke="none" />
      <path d="m10.25 4.75 5.5 3.25v8l5.5 3.25-5.5-3.25v-8L10.25 4.75z" fill="hsl(var(--accent))" stroke="none"/>
    </svg>
  );
}
