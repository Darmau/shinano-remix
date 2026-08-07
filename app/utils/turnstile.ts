export type TurnstileVerificationOutcome = {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
};

export const isTurnstileOutcome = (value: unknown): value is TurnstileVerificationOutcome =>
    typeof value === "object" &&
    value !== null &&
    typeof (value as { success?: unknown }).success === "boolean";

export const parseTurnstileOutcome = (value: unknown): TurnstileVerificationOutcome => {
  if (!isTurnstileOutcome(value)) {
    throw new Error("Invalid Turnstile response");
  }

  return value;
};
