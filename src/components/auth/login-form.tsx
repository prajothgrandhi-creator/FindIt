"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { loginAction, type LoginActionState } from "@/app/actions/auth";
import { Button, Input } from "@/components/ui";

const initialState: LoginActionState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="srn" className="mb-2 block text-sm font-semibold">Student registration number (SRN)</label>
        <Input
          id="srn"
          name="srn"
          type="text"
          autoComplete="username"
          inputMode="text"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={20}
          required
          disabled={isPending}
          placeholder="PES1UG00ABC123"
          aria-describedby={state.error ? "login-error" : undefined}
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-semibold">Password</label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            maxLength={72}
            required
            disabled={isPending}
            className="pr-12"
            aria-describedby={state.error ? "login-error" : undefined}
          />
          <button
            type="button"
            className="focus-ring absolute inset-y-1 right-1 grid w-10 place-items-center rounded-md text-subtle transition hover:bg-white/[.05] hover:text-text disabled:opacity-50"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            disabled={isPending}
            onClick={() => setShowPassword((visible) => !visible)}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>

      {state.error && <p id="login-error" role="alert" className="rounded-lg border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">{state.error}</p>}
      <div role="status" aria-live="polite" className="sr-only">{isPending ? "Signing in." : ""}</div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? <><LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> Signing in…</> : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted">
        New to FindIt? <Link href="/signup" className="font-semibold text-accent-bright hover:text-accent">Create an account</Link>
      </p>
    </form>
  );
}
