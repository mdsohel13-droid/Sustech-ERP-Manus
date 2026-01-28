import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";

import { cn } from "@/lib/utils";

function HoverCard({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />;
}

function HoverCardTrigger({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return (
    <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  );
}

function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Content
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-[9999] w-64 rounded-md border bg-white dark:bg-slate-900 p-4 text-foreground shadow-lg outline-none",
        className
      )}
      style={{ position: 'absolute' }}
      {...props}
    />
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
