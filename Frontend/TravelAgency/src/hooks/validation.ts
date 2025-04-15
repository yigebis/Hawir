export interface LoginFormValues {
    agencyId: string;
    email: string;
    password: string;
    rememberMe: boolean;
}

export interface LoginFormErrors {
    agencyId: string;
    email: string;
    password: string;
}

export const validateLoginForm = (values: LoginFormValues): LoginFormErrors => {
    const errors: LoginFormErrors = {
        agencyId: "",
        email: "",
        password: ""
    };

    if (!values.agencyId.trim()) {
        errors.agencyId = "Agency ID is required";
    }

    if (!values.email.trim()) {
        errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = "Email is invalid";
    }

    if (!values.password) {
        errors.password = "Password is required";
    } else if (values.password.length < 8) {
        errors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])/.test(values.password) ||
        !/(?=.*[A-Z])/.test(values.password) ||
        !/(?=.*\d)/.test(values.password) ||
        !/(?=.*[@$!%*?&])/.test(values.password)) {
        errors.password =
            "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)";
    }

    return errors;
};