import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { Input } from './ui/input';
import { cn } from '../lib/utils';

interface PasswordInputProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  containerClassName?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  className,
  containerClassName,
  ...props
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn('relative', containerClassName)}>
      <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        className={cn(
          'pl-10 pr-10 bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-indigo-600 focus-visible:border-indigo-600',
          className,
        )}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
};
