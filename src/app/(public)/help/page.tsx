import { PageHeader } from "@/components/ui";

const questions = [
  ["Which email should I use at signup?", "Enter an email address you can use. FindIt saves it on your profile for future account use, but does not send a confirmation message."],
  ["What do I use to sign in?", "Sign in with the university SRN and password you chose during registration. Your email is not used as a sign-in credential."],
  ["Does signup confirm my enrollment?", "No. An SRN match is only an eligibility check against the authorized roster. Student access remains pending until an authorized university verification process confirms enrollment."],
  ["Who can use FindIt?", "FindIt is designed for members of the PES University campus community. Campus account verification will be connected in a later phase."],
  ["What should I include in a report?", "Add a clear item description, the approximate time, and a general campus location. Keep one unique identifying detail private so you can confirm ownership."],
  ["I think I found my item. What next?", "Compare details that were not included in the public report. Once you are confident, arrange a handoff in a sensible public campus location."],
  ["How do I safely return something I found?", "Ask the person claiming the item to describe a private detail. If you are unsure, contact campus staff and arrange to leave the item with an appropriate office."],
  ["Can I share my phone number in a public report?", "Avoid posting personal contact details or sensitive information in a public description. FindIt is being prepared to support verified campus interactions."],
];
export default function HelpPage() { return <div className="shell max-w-4xl py-14 sm:py-20"><PageHeader eyebrow="HELP CENTER" first="A few answers" second="to get you started." description="Some useful pointers for reporting and reconnecting campus items." /><div className="mt-10 divide-y divide-white/[.08] border-y border-white/[.08]">{questions.map(([question, answer]) => <details key={question} className="group py-5"><summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-4 rounded text-base font-semibold marker:hidden">{question}<span aria-hidden="true" className="text-xl font-light text-accent-bright transition group-open:rotate-45">+</span></summary><p className="max-w-2xl pt-3 text-sm leading-6 text-[#8e8799]">{answer}</p></details>)}</div><p className="mt-8 text-sm text-[#8e8799]">For roster eligibility or account questions, contact your authorized university roster administrator or the FindIt project owner.</p></div>; }
