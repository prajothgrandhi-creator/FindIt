import type { Metadata } from "next";
import { Card, PageHeader } from "@/components/ui";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in | FindIt",
  description: "Sign in to your FindIt campus account.",
};

export const instant = false;

export default function LoginPage() {
  return (
    <div className="shell py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <PageHeader
          eyebrow="WELCOME BACK"
          first="Your campus"
          second="is just ahead."
          description="Sign in with your university SRN and FindIt password."
        />
        <Card className="p-5 sm:p-8">
          <LoginForm />
          {process.env.NODE_ENV === "development" && <Link href="/dev-dashboard-preview" className="focus-ring mt-4 flex min-h-11 items-center justify-center rounded-lg border border-white/10 bg-white/[.04] px-5 text-sm font-semibold text-text transition hover:bg-white/[.08]">Go to Dashboard</Link>}
        </Card>
      </div>
    </div>
  );
}
