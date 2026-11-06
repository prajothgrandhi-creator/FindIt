import type { Metadata } from "next";
import { RegistrationForm } from "@/components/registration/registration-form";

export const metadata: Metadata = {
  title: "Create an account | FindIt",
  description: "Create a FindIt account for the PES University campus community.",
};

export default function SignupPage() {
  return <RegistrationForm />;
}
