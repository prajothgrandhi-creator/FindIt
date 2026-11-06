"use client";

import { useActionState } from "react";
import { updateProfileAction, type ProfileActionState } from "@/app/actions/profile";
import { Button, Input } from "@/components/ui";

const initialState: ProfileActionState = {};

export function ProfileSettingsForm({ displayName, email, srn }: { displayName: string; email: string; srn: string }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="profile-srn" className="mb-2 block text-sm font-semibold">Student registration number</label>
        <Input id="profile-srn" value={srn} readOnly aria-describedby="profile-srn-note" />
        <p id="profile-srn-note" className="mt-2 text-xs text-subtle">Your SRN is used for sign-in and cannot be changed here.</p>
      </div>
      <div>
        <label htmlFor="profile-displayName" className="mb-2 block text-sm font-semibold">Full name</label>
        <Input id="profile-displayName" name="displayName" defaultValue={displayName} maxLength={100} autoComplete="name" required disabled={pending} />
      </div>
      <div>
        <label htmlFor="profile-email" className="mb-2 block text-sm font-semibold">Email address</label>
        <Input id="profile-email" name="email" type="email" defaultValue={email} maxLength={254} autoComplete="email" required disabled={pending} />
        <p className="mt-2 text-xs text-subtle">Email is saved to your profile for future account use. No verification message is sent.</p>
      </div>
      {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      {state.success && <p role="status" className="text-sm text-success">{state.success}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save profile"}</Button>
    </form>
  );
}
