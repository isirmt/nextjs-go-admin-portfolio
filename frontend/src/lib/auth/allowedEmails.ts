import { requiredEnv } from "../requiredEnv";

export const isAllowedEmail = (email: string | null | undefined) => {
  const allowedEmailsEnv = requiredEnv("ADMIN_ALLOWED_EMAILS");
  const allowedEmails = allowedEmailsEnv
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!email) return false;
  const normalizedEmail = email.trim().toLowerCase();
  return allowedEmails.includes(normalizedEmail);
};
