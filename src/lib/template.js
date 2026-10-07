const VARIABLE_PATTERN = /\{\{(\w+)\}\}/g;

export function extractVariables(text) {
  if (!text) return [];
  const names = [...text.matchAll(VARIABLE_PATTERN)].map((m) => m[1]);
  return [...new Set(names)];
}

export function fillTemplate(text, values = {}) {
  if (!text) return "";
  return text.replace(VARIABLE_PATTERN, (match, key) => {
    return values[key] !== undefined && values[key] !== "" ? values[key] : match;
  });
}

export const CURATED_TEMPLATES = [
  {
    id: "preset-college-leave",
    name: "College Official Leave Application",
    category: "Academic",
    description: "Formal medical or personal absence request to Dean, HOD, or Class Coordinator.",
    text: `Date: {{date}}

To,
The Head of Department,
Department of {{department}},
{{institution_name}}

Subject: Application for Leave of Absence - {{student_name}} (Roll No: {{roll_number}})

Respected Sir/Madam,

I am writing to formally request a leave of absence from {{start_date}} to {{end_date}} due to {{reason_for_leave}}.

I assure you that I will coordinate with my classmates and professors to review all lectures, class notes, and laboratory work conducted during my absence. All prescribed medical or supporting records are attached for your administrative reference.

I kindly request you to approve my leave application and update the academic attendance records accordingly.

Thanking you.

Yours faithfully,
{{student_name}}
Roll No: {{roll_number}}
Semester / Branch: {{semester_branch}}`,
  },
  {
    id: "preset-bonafide-request",
    name: "Bonafide Certificate Requisition",
    category: "Academic",
    description: "Official student verification request for passport, visa, or scholarship clearance.",
    text: `Date: {{date}}

To,
The Registrar / Dean of Academic Affairs,
{{institution_name}}

Subject: Requisition for Issuance of Bonafide Certificate

Respected Sir/Madam,

I am a bona fide student of {{institution_name}}, currently pursuing {{degree_program}} in the Department of {{department}} (Registration No: {{registration_no}}).

I urgently require an official Bonafide Certificate issued by the institution for the purpose of {{purpose_of_certificate}}.

I have cleared all dues up to the current term, and copies of my institutional ID and fee receipt are enclosed for expediting this request. I request that the certificate be prepared at the earliest convenient date.

Thank you for your valuable assistance.

Yours sincerely,
{{student_name}}
Contact: {{phone_or_email}}`,
  },
  {
    id: "preset-project-escalation",
    name: "Executive Milestone & Risk Escalation",
    category: "Corporate",
    description: "Transparent, proactive update to leadership or clients regarding schedule adjustments.",
    text: `Subject: Formal Operational Update: {{project_name}} Schedule & Risk Mitigation
To: {{stakeholder_name}}
Date: {{date}}

Dear {{stakeholder_name}},

I am reaching out to provide a transparent briefing on the operational trajectory of {{project_name}}, specifically concerning the delivery of {{deliverable_name}}.

Due to {{root_cause}}, our projected delivery milestone has shifted from {{original_date}} to {{revised_date}}. To preserve output quality and eliminate downstream dependencies, our engineering team has initiated the following remediation protocol:

- Immediate reallocation of dedicated resources under the direction of {{lead_person}}.
- Accelerated QA review cycles to prevent regressions.
- Daily status checkpoints to ensure strict adherence to {{revised_date}}.

We remain fully committed to meeting executive expectations and will share our updated milestone burn-down report by {{report_checkpoint}}.

Best regards,

{{sender_name}}
{{sender_title}}
{{company_or_team}}`,
  },
  {
    id: "preset-billing-complaint",
    name: "Formal Dispute & Service Rectification",
    category: "Legal & Consumer",
    description: "Strict contractual grievance letter demanding prompt corrective measures.",
    text: `Date: {{date}}

To,
The Grievance Redressal Officer / Accounts Lead,
{{service_provider_name}}
Reference Account / Invoice ID: {{reference_id}}

Subject: Formal Notice of Dispute Regarding Erroneous Charges and Service Deficiency

Dear Sir/Madam,

I am writing to register an official complaint regarding {{service_or_product_name}} under Account ID {{reference_id}}.

On {{incident_date}}, an unauthorized charge / discrepancy of {{disputed_amount}} was debited, despite {{contractual_agreement_or_terms}}. Furthermore, our team experienced {{service_interruption_detail}}, causing material operational friction.

We hereby request:
1. Immediate reversal and refund of {{disputed_amount}} to the original payment source.
2. A formal written explanation and technical post-mortem addressing the root failure.
3. Verification that future recurring billings will accurately reflect agreed pricing.

Please provide a formal written confirmation acknowledging this dispute within 48 business hours.

Sincerely,

{{claimant_name}}
{{claimant_organization}}
Contact: {{claimant_email_phone}}`,
  },
  {
    id: "preset-formal-resignation",
    name: "Executive Resignation & Transition",
    category: "Corporate",
    description: "Dignified, professional notice of departure outlining handover commitments.",
    text: `Date: {{date}}

To: {{manager_name}}
Title: {{manager_title}}
Company: {{company_name}}

Subject: Formal Notice of Resignation - {{employee_name}}

Dear {{manager_name}},

Please accept this letter as formal notification that I am resigning from my position as {{position_title}} at {{company_name}}. In accordance with my contractual notice period, my final working day will be {{final_date}}.

I want to express my sincere appreciation for the opportunities, mentorship, and professional growth I have experienced during my tenure here. Working alongside such talented colleagues has been an enriching chapter of my career.

Over the coming weeks, I am dedicated to ensuring a seamless transition of my responsibilities. I will complete outstanding deliverables, document operational workflows, and actively train {{successor_or_colleague}} to guarantee uninterrupted business continuity.

I wish you and {{company_name}} continued success. Please let me know how I can further assist during this transition period.

Warm regards,

{{employee_name}}
{{contact_details}}`,
  },
];