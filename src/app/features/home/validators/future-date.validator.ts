import { FormControl, ValidationErrors } from '@angular/forms';

/**
 * Custom validator to ensure due date is not in the past
 */
export const futureDateValidator = (
  bypass = false,
  control: FormControl<string | Date>,
): ValidationErrors | null => {
  if (!control.value || (control.value && bypass)) {
    return null;
  }
  const selectedDate = new Date(control.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    return { pastDate: true };
  }
  return null;
};
