import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  helperText?: string;
}

export function FormField({
  label,
  error,
  required,
  children,
  helperText,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
    </div>
  );
}

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export function TextInput({
  label,
  error,
  required,
  helperText,
  ...props
}: TextInputProps) {
  return (
    <FormField label={label} error={error} required={required} helperText={helperText}>
      <Input
        {...props}
        className={error ? 'border-red-500' : ''}
      />
    </FormField>
  );
}

interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export function NumberInput({
  label,
  error,
  required,
  helperText,
  ...props
}: NumberInputProps) {
  return (
    <FormField label={label} error={error} required={required} helperText={helperText}>
      <Input
        type="number"
        {...props}
        className={error ? 'border-red-500' : ''}
      />
    </FormField>
  );
}

interface EmailInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export function EmailInput({
  label,
  error,
  required,
  helperText,
  ...props
}: EmailInputProps) {
  return (
    <FormField label={label} error={error} required={required} helperText={helperText}>
      <Input
        type="email"
        {...props}
        className={error ? 'border-red-500' : ''}
      />
    </FormField>
  );
}

interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export function DateInput({
  label,
  error,
  required,
  helperText,
  ...props
}: DateInputProps) {
  return (
    <FormField label={label} error={error} required={required} helperText={helperText}>
      <Input
        type="date"
        {...props}
        className={error ? 'border-red-500' : ''}
      />
    </FormField>
  );
}

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
}

export function SelectInput({
  label,
  error,
  required,
  helperText,
  options,
  placeholder,
  ...props
}: SelectInputProps) {
  return (
    <FormField label={label} error={error} required={required} helperText={helperText}>
      <select
        {...props}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

interface TextareaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export function TextareaInput({
  label,
  error,
  required,
  helperText,
  ...props
}: TextareaInputProps) {
  return (
    <FormField label={label} error={error} required={required} helperText={helperText}>
      <textarea
        {...props}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
    </FormField>
  );
}
