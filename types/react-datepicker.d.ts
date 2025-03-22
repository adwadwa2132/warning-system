declare module 'react-datepicker' {
  import React from 'react';
  
  export interface ReactDatePickerProps {
    selected?: Date | null;
    onChange?: (date: Date | null, event: React.SyntheticEvent<any> | undefined) => void;
    showTimeSelect?: boolean;
    timeFormat?: string;
    timeIntervals?: number;
    dateFormat?: string;
    minDate?: Date;
    className?: string;
    disabled?: boolean;
    [key: string]: any;
  }
  
  declare const DatePicker: React.FC<ReactDatePickerProps>;
  
  export default DatePicker;
} 