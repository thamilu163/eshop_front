import * as React from 'react'

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function TooltipTrigger({ children, asChild: _asChild }: { children: React.ReactNode; asChild?: boolean }) {
  return <span>{children}</span>
}

export function TooltipContent({ children }: { children: React.ReactNode }) {
  return <div role="tooltip">{children}</div>
}

export default Tooltip
