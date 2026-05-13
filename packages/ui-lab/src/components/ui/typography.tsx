import * as React from 'react';

import { cn } from '../../lib/utils';

function TypographyH1({ className, ...props }: React.ComponentProps<'h1'>) {
  return (
    <h1
      className={cn(
        'scroll-m-20 text-4xl font-semibold tracking-normal text-foreground',
        className
      )}
      {...props}
    />
  );
}

function TypographyH2({ className, ...props }: React.ComponentProps<'h2'>) {
  return (
    <h2
      className={cn(
        'scroll-m-20 text-3xl font-semibold tracking-normal text-foreground',
        className
      )}
      {...props}
    />
  );
}

function TypographyH3({ className, ...props }: React.ComponentProps<'h3'>) {
  return (
    <h3
      className={cn(
        'scroll-m-20 text-2xl font-semibold tracking-normal text-foreground',
        className
      )}
      {...props}
    />
  );
}

function TypographyP({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('leading-7 text-muted-foreground', className)} {...props} />;
}

function TypographyLead({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('text-xl leading-8 text-muted-foreground', className)} {...props} />;
}

function TypographyMuted({ className, ...props }: React.ComponentProps<'p'>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

function TypographyInlineCode({ className, ...props }: React.ComponentProps<'code'>) {
  return (
    <code
      className={cn(
        'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm text-foreground',
        className
      )}
      {...props}
    />
  );
}

export {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyInlineCode,
  TypographyLead,
  TypographyMuted,
  TypographyP,
};
