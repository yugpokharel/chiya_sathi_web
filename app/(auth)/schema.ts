import { z } from "zod";

// login
export const loginSchema = z.object({
    email: z.string().email("Please provide a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginData = z.infer<typeof loginSchema>;

// register
const passwordRule = z
    .string()
    .min(8, "Password must be at least 8 characters");

export const registerSchema = z
    .object({
        fullName: z.string().min(2, "Full name is too short"),
        username: z.string().min(2, "Username is too short"),
        phoneNumber: z.string().min(7, "Phone number is too short"),
        email: z.string().email("Please provide valid email address"),
        password: passwordRule,
        confirmPassword: passwordRule,
        profilePicture: z.instanceof(File, {
            message: "Please select a profile picture",
        }),
    })
    .superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["confirmPassword"],
                message: "Passwords do not match",
            });
        }
    });

export type RegisterData = z.infer<typeof registerSchema>;
