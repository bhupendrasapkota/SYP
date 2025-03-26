import React, { memo } from 'react';

const FormField = memo(({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  type = "text",
  placeholder = "",
  maxLength,
  isTextArea = false,
  textAreaHeight = "h-20"
}) => {
  const baseClassName = `w-full mt-1 px-3 py-2 border-2 ${
    error ? 'border-red-500' : 'border-black'
  } focus:outline-none`;

  const inputProps = {
    name,
    value,
    onChange,
    className: `${baseClassName} ${isTextArea ? `resize-none ${textAreaHeight}` : ''}`,
    required: true,
    maxLength,
    placeholder,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? `${name}-error` : undefined,
  };

  return (
    <div>
      <label className="block mb-2 font-bold">
        {label}
        {isTextArea ? (
          <textarea {...inputProps} />
        ) : (
          <input type={type} {...inputProps} />
        )}
        {error && (
          <p 
            id={`${name}-error`} 
            className="text-red-500 text-sm mt-1"
            role="alert"
          >
            {error}
          </p>
        )}
      </label>
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;
