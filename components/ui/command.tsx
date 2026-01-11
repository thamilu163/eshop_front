import * as React from 'react'

type CommandProps = { children?: React.ReactNode; className?: string; [key: string]: unknown };

export const Command = ({ children, className, ...props }: CommandProps) => (
  <div className={className} {...props}>
    {children}
  </div>
)

type CommandInputProps = { value?: any; onValueChange?: (...args: any[]) => any; placeholder?: any; [key: string]: unknown };

export const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  ({ value, onValueChange, placeholder, ...props }, ref) => {
    const rest = props as React.InputHTMLAttributes<HTMLInputElement>;
    const safeOnValueChange = onValueChange as ((v: string) => any) | undefined;
    return (
      <input
        ref={ref}
        value={value as any}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => safeOnValueChange?.(e.target.value)}
        placeholder={String(placeholder ?? '')}
        {...rest}
      />
    )
  }
)
CommandInput.displayName = 'CommandInput';

export const CommandList = ({ children, className, ...props }: CommandProps) => (
  <div className={className} {...props}>{children}</div>
)

type CommandItemProps = { children?: React.ReactNode; onSelect?: (value: unknown) => void; className?: string; value?: unknown; [key: string]: unknown };

export const CommandItem = ({ children, onSelect, className, ...props }: CommandItemProps) => (
  <div
    className={className}
    onClick={(_e) => {
      onSelect?.(typeof props.value !== 'undefined' ? props.value : undefined)
    }}
    role="button"
    tabIndex={0}
    {...props}
  >
    {children}
  </div>
)

type CommandGroupProps = { heading?: React.ReactNode; children?: React.ReactNode };

export const CommandGroup = ({ heading, children }: CommandGroupProps) => (
  <div>
    {heading && <div className="px-2 py-1 text-sm font-medium">{heading}</div>}
    <div>{children}</div>
  </div>
)

type CommandEmptyProps = { children?: React.ReactNode };

export const CommandEmpty = ({ children }: CommandEmptyProps) => <div className="p-2 text-sm text-muted-foreground">{children}</div>

export default Command
