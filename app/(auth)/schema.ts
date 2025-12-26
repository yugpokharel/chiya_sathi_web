import { z } from "zod";

//login
export const loginSchema = z.object({
    email: z.string().email("Please provide a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginData = z.infer<typeof loginSchema>;

//registre
const passwordRule = z
    .string()
    .min(6, "Password must be at least 6 characters");

export const registerSchema = z
    .object({
        name: z.string().min(2, "Name is too short"),
        email: z.string().email("Please provide valid email address"),
        password: passwordRule,
        confirmPassword: passwordRule,
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
