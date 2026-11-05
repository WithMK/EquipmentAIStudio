// shadcn-style source-owned primitive; no paid components.
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
const variants = cva('inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 disabled:opacity-40 disabled:pointer-events-none', {
 variants: { variant: {default:'bg-cyan-400 text-slate-950 hover:bg-cyan-300', outline:'border border-slate-600 text-slate-200 hover:bg-slate-800'}, size:{default:'h-9 px-3',sm:'h-8 px-2.5'} }, defaultVariants:{variant:'default',size:'default'},
});
export function Button({className,variant,size,asChild=false,...props}: React.ComponentProps<'button'> & VariantProps<typeof variants> & {asChild?:boolean}) {
 const Component=asChild ? Slot : 'button';
 return <Component className={twMerge(clsx(variants({variant,size}),className))} {...props}/>;
}
