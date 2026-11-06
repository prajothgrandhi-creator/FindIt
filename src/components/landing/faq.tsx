const questions = [
  ["What is FindIt?", "FindIt is a campus lost-and-found product concept designed to help students report belongings, discover possible matches and coordinate returns. This phase delivers the landing page; reports and accounts are not connected yet."],
  ["Can I report both lost and found items?", "That is part of the planned product. Report submission is not available in this landing-page phase."],
  ["How will university membership be verified?", "Student access is planned to rely on a university-approved verification source. No roster or verification service is configured in this phase."],
  ["How will item matching work?", "The planned matching experience will use relevant report details to suggest candidates. Suggestions will be advisory, and matching is not active yet."],
  ["How will private ownership evidence be protected?", "Keeping identifying evidence out of public listings is a product principle. The private evidence workflow has not been implemented yet, so avoid sharing sensitive personal information here."],
];

export function FaqSection() {
  return <section id="faq" className="shell faq-section"><div className="faq-intro"><p className="eyebrow">GOOD QUESTIONS</p><h2 className="section-heading">A few things<span> to know.</span></h2><p className="section-description">What’s here now, and what belongs to a later phase.</p></div><div className="faq-list">{questions.map(([question, answer]) => <details className="faq-item" key={question}><summary>{question}<span aria-hidden="true" className="faq-plus">+</span></summary><p>{answer}</p></details>)}</div></section>;
}
