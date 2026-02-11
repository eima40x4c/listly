/**
 * UI Components Barrel Export
 *
 * Central export for all base UI components.
 * Import UI components from this file for cleaner imports.
 *
 * @example
 * ```tsx
 * import { Button, Card, Input } from '@/components/ui';
 * ```
 */

export { Avatar, type AvatarProps, avatarVariants } from './Avatar';
export { Badge, type BadgeProps, badgeVariants } from './Badge';
export { Button, type ButtonProps, buttonVariants } from './Button';
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  type CardProps,
  CardTitle,
  cardVariants,
} from './Card';
export { Checkbox, type CheckboxProps } from './Checkbox';
export { ErrorMessage } from './ErrorMessage';
export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from './Form';
export { Input, type InputProps, inputVariants } from './Input';
export { Label, type LabelProps } from './Label';
export {
  RadixSelect,
  RadixSelectContent,
  RadixSelectGroup,
  RadixSelectItem,
  RadixSelectLabel,
  RadixSelectSeparator,
  RadixSelectTrigger,
  RadixSelectValue,
} from './RadixSelect';
export { Skeleton } from './Skeleton';
export { Spinner, type SpinnerProps, spinnerVariants } from './Spinner';
