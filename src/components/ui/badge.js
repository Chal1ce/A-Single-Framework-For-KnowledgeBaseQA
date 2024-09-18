import React from 'react';

// cn 函数实现
const cn = (...args) => args.filter(Boolean).join(' ');

// cva 函数简化实现
const cva = (baseClasses, variants) => {
  return (props = {}) => {
    let classes = baseClasses;
    Object.entries(variants).forEach(([variantName, variantOptions]) => {
      const variantValue = props[variantName];
      if (variantValue && variantOptions[variantValue]) {
        classes += ' ' + variantOptions[variantValue];
      }
    });
    return classes;
  };
};

// Badge 组件样式定义
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
  }
);

// Badge 组件
function Badge({ className, variant = 'default', ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };