// src/lib/validation/authValidation.ts

export interface ChangePasswordFormValues {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ChangePasswordFormErrors {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export const validateChangePasswordForm = (values: ChangePasswordFormValues): ChangePasswordFormErrors => {
    const errors: ChangePasswordFormErrors = {
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    };

    if (!values.currentPassword) {
        errors.currentPassword = "Current password is required";
    }

    if (!values.newPassword) {
        errors.newPassword = "New password is required";
    } else if (values.newPassword.length < 8) { // Increased minimum length for strong password
        errors.newPassword = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])/.test(values.newPassword) ||
        !/(?=.*[A-Z])/.test(values.newPassword) ||
        !/(?=.*\d)/.test(values.newPassword) ||
        !/(?=.*[@$!%*?&])/.test(values.newPassword)) {
        errors.newPassword =
            "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)";
    }

    if (!values.confirmPassword) {
        errors.confirmPassword = "Please confirm your new password";
    } else if (values.newPassword !== values.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
    }

    return errors;
};