
import { forwardRef } from 'react';
import { Button as ShadcnButton } from './Button';

const Button = forwardRef(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {

    let mappedVariant = 'default';
    if (variant === 'primary') mappedVariant = 'default';
    else if (variant === 'secondary') mappedVariant = 'secondary';
    else if (variant === 'outline') mappedVariant = 'outline';
    else if (variant === 'ghost') mappedVariant = 'ghost'; 
    else if (variant === 'link') mappedVariant = 'link';
    else if (variant === 'destructive') mappedVariant = 'destructive';
    
    let mappedSize = 'default';
    if (size === 'md') mappedSize = 'default';
    else if (size === 'lg') mappedSize = 'lg';
    else if (size === 'sm') mappedSize = 'sm';
    else if (size === 'icon') mappedSize = 'icon';
    else if (size === 'default') mappedSize = 'default';

    return (
      <ShadcnButton
        ref={ref}
        variant={mappedVariant}
        size={mappedSize}
        className={className}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
        ) : null}
        {children}
      </ShadcnButton>
    );
  }
);


export default Button;
