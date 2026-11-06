"use client";

import Link from "next/link";
import { useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { Check, Eye, EyeOff, LoaderCircle, ShieldCheck } from "lucide-react";
import { Button, Card, Input, PageHeader, Select } from "@/components/ui";
import {
  registrationSchema,
  SUPPORTED_UNIVERSITIES,
  type RegistrationField,
} from "@/lib/registration/schema";

type FieldErrors = Partial<Record<RegistrationField, string>>;

type ApiResponse = {
  message?: string;
  fieldErrors?: FieldErrors;
};

const GENERIC_ACCEPTANCE_MESSAGE =
  "Your account is ready. Sign in with your SRN and password; student-only features remain pending campus approval.";
const REGISTRATION_ERROR_MESSAGE =
  "Registration could not be completed. Please contact the Help Center for assistance.";

function subscribeToLocationHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

function getLocationHash() {
  return window.location.hash;
}

export function RegistrationForm() {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const submissionLock = useRef(false);
  const locationHash = useSyncExternalStore(subscribeToLocationHash, getLocationHash, () => "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionLock.current || isSubmitted) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const result = registrationSchema.safeParse({
      universityId: formData.get("universityId"),
      email: formData.get("email"),
      srn: formData.get("srn"),
      fullName: formData.get("fullName"),
      password: formData.get("password"),
    });

    setFormError("");
    if (!result.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && field in registrationSchema.shape && !nextErrors[field as RegistrationField]) {
          nextErrors[field as RegistrationField] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    submissionLock.current = true;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const body = (await response.json().catch(() => ({}))) as ApiResponse;

      if (response.ok) {
        form.reset();
        setIsSubmitted(true);
        return;
      }

      if (body.fieldErrors) setFieldErrors(body.fieldErrors);
      setFormError(body.message ?? "Registration is temporarily unavailable. Please try again later.");
    } catch {
      setFormError("We couldn’t reach FindIt right now. Please try again in a little while.");
    } finally {
      submissionLock.current = false;
      setIsSubmitting(false);
    }
  }

  const errorFor = (field: RegistrationField) => fieldErrors[field];

  return (
    <div className="shell py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <PageHeader
          eyebrow="STUDENT REGISTRATION"
          first="Join your campus"
          second="community."
          description="Create a FindIt account to take part in your campus lost-and-found community."
        />

        <section aria-labelledby="registration-steps" className="mb-5 rounded-xl border border-white/10 bg-surface p-5 sm:p-6">
          <h2 id="registration-steps" className="text-base font-bold">How account setup works</h2>
          <ol className="mt-4 grid gap-4 text-sm leading-6 text-muted sm:grid-cols-3">
            <li><span className="mb-2 grid size-7 place-items-center rounded-full bg-accent text-xs font-bold text-[#15121C]">1</span>Enter your university, SRN, email, name, and a password.</li>
            <li><span className="mb-2 grid size-7 place-items-center rounded-full bg-accent text-xs font-bold text-[#15121C]">2</span>FindIt saves these details to your account. Email confirmation is not required.</li>
            <li><span className="mb-2 grid size-7 place-items-center rounded-full bg-accent text-xs font-bold text-[#15121C]">3</span>Sign in with your SRN and password after registering. Email confirmation is not required; student access still requires university approval.</li>
          </ol>
        </section>

        <Card className="p-5 sm:p-8">
          {isSubmitted ? (
            <div className="py-3" role="status" aria-live="polite">
              <span className="mb-5 grid size-12 place-items-center rounded-full border border-success/25 bg-success/10 text-success">
                <Check size={22} aria-hidden="true" />
              </span>
              <p className="eyebrow">ACCOUNT CREATED</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">What happens next</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{GENERIC_ACCEPTANCE_MESSAGE}</p>
              <ol className="mt-5 space-y-3 text-sm leading-6 text-muted">
                <li><span className="font-semibold text-text">1. Your account is created.</span> Your SRN, name, email, and password hash are saved in FindIt. The email is kept for future account use; no confirmation message is sent.</li>
                <li><span className="font-semibold text-text">2. Sign in with your SRN and password.</span> You can sign in as soon as registration completes. Your password is stored as a secure hash.</li>
                <li><span className="font-semibold text-text">3. Student access needs campus approval.</span> Your profile remains pending until an authorized university process confirms enrollment.</li>
              </ol>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/login" className="landing-action landing-action-primary focus-ring">Go to sign in</Link>
                <Link href="/help" className="focus-ring inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-semibold text-muted transition hover:text-text">
                  Help center
                </Link>
              </div>
            </div>
          ) : (
            <form noValidate onSubmit={handleSubmit} className="space-y-5" aria-busy={isSubmitting}>
              <div>
                <label htmlFor="universityId" className="mb-2 block text-sm font-semibold">University</label>
                <Select
                  id="universityId"
                  name="universityId"
                  defaultValue=""
                  autoComplete="off"
                  required
                  aria-invalid={Boolean(errorFor("universityId"))}
                  aria-describedby={errorFor("universityId") ? "university-error" : undefined}
                  disabled={isSubmitting}
                  onChange={() => setFieldErrors((current) => ({ ...current, universityId: undefined }))}
                >
                  <option value="">Select your university</option>
                  {SUPPORTED_UNIVERSITIES.map((university) => (
                    <option value={university.id} key={university.id}>{university.name}</option>
                  ))}
                </Select>
                {errorFor("universityId") && <p id="university-error" className="mt-2 text-sm text-danger" role="alert">{errorFor("universityId")}</p>}
              </div>

              <div>
                <label htmlFor="srn" className="mb-2 block text-sm font-semibold">Student registration number (SRN)</label>
                <Input
                  id="srn"
                  name="srn"
                  type="text"
                  placeholder="For example: PES1UG00XX000"
                  autoComplete="username"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={20}
                  required
                  aria-invalid={Boolean(errorFor("srn"))}
                  aria-describedby={errorFor("srn") ? "srn-error srn-hint" : "srn-hint"}
                  disabled={isSubmitting}
                  onChange={() => setFieldErrors((current) => ({ ...current, srn: undefined }))}
                />
                <p id="srn-hint" className="mt-2 text-xs leading-5 text-subtle">Use the configured FindIt SRN format. It has not been confirmed as an official PES rule.</p>
                {errorFor("srn") && <p id="srn-error" className="mt-2 text-sm text-danger" role="alert">{errorFor("srn")}</p>}
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold">Email address</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Your email address"
                  autoComplete="email"
                  maxLength={254}
                  required
                  aria-invalid={Boolean(errorFor("email"))}
                  aria-describedby={errorFor("email") ? "email-hint email-error" : "email-hint"}
                  disabled={isSubmitting}
                  onChange={() => setFieldErrors((current) => ({ ...current, email: undefined }))}
                />
                <p id="email-hint" className="mt-2 text-xs leading-5 text-subtle">Enter the email assigned to your SRN in FindIt’s active roster. Confirmation is sent there; contact the project owner if that address needs updating.</p>
                {errorFor("email") && <p id="email-error" className="mt-2 text-sm text-danger" role="alert">{errorFor("email")}</p>}
              </div>

              <div>
                <label htmlFor="fullName" className="mb-2 block text-sm font-semibold">Full name</label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Your name"
                  autoComplete="name"
                  maxLength={100}
                  required
                  aria-invalid={Boolean(errorFor("fullName"))}
                  aria-describedby={errorFor("fullName") ? "fullName-error" : undefined}
                  disabled={isSubmitting}
                  onChange={() => setFieldErrors((current) => ({ ...current, fullName: undefined }))}
                />
                {errorFor("fullName") && <p id="fullName-error" className="mt-2 text-sm text-danger" role="alert">{errorFor("fullName")}</p>}
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold">Password</label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={72}
                    required
                    aria-invalid={Boolean(errorFor("password"))}
                    aria-describedby={errorFor("password") ? "password-hint password-error" : "password-hint"}
                    className="pr-12"
                    disabled={isSubmitting}
                    onChange={() => setFieldErrors((current) => ({ ...current, password: undefined }))}
                  />
                  <button
                    type="button"
                    className="focus-ring absolute inset-y-1 right-1 grid w-10 place-items-center rounded-md text-subtle transition hover:bg-white/[.05] hover:text-text disabled:opacity-50"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((visible) => !visible)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <p id="password-hint" className="mt-2 text-xs leading-5 text-subtle">Use 8–72 characters. After confirming the message sent to the address on file, sign in with your SRN and this password.</p>
                {errorFor("password") && <p id="password-error" className="mt-2 text-sm text-danger" role="alert">{errorFor("password")}</p>}
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[.025] p-4">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 shrink-0 text-accent-bright" size={18} aria-hidden="true" />
                  <p className="text-xs leading-5 text-muted">An SRN match is not proof of enrollment. Accounts remain pending until an authorized university verification process is configured.</p>
                </div>
              </div>

              {(formError || locationHash === "#registration-error") && (
                <p role="alert" className="rounded-lg border border-danger/25 bg-danger/10 px-4 py-3 text-sm leading-5 text-danger">
                  {formError || REGISTRATION_ERROR_MESSAGE}
                </p>
              )}
              <div role="status" aria-live="polite" className="sr-only">
                {isSubmitting ? "Submitting your registration request." : ""}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <><LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> Creating account…</> : "Create account"}
              </Button>
            </form>
          )}
        </Card>

        <p className="mt-5 text-center text-xs leading-5 text-subtle">PES University is the only university currently supported.</p>
      </div>
    </div>
  );
}
