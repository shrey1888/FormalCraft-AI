/**
 * Formal Email & Letter Assistant - Generation Service
 * 
 * ARCHITECTURE NOTE:
 * - This module cleanly isolates AI document generation.
 * - By default, it operates in safe Mock Mode (no API key required).
 * - When you provide your real GEMINI_API_KEY in .env.local, it seamlessly switches
 *   to the real Google GenAI SDK.
 */

import { GoogleGenAI } from "@google/genai";

export const TYPE_METADATA = {
  college: {
    label: "College Official Letter",
    category: "Academic",
    description: "Formal leave applications, bonafide requests, and departmental petitions.",
    defaultSalutation: "Respected Sir/Madam,",
    defaultSignoff: "Yours faithfully,",
    placeholderRecipient: "The Principal / Head of Department",
  },
  business: {
    label: "Business & Corporate Email",
    category: "Corporate",
    description: "Executive memos, project escalations, client correspondence, and partner updates.",
    defaultSalutation: "Dear [Name or Title],",
    defaultSignoff: "Sincerely,",
    placeholderRecipient: "Operations Director / Client Team",
  },
  complaint: {
    label: "Formal Complaint & Dispute",
    category: "Legal & Consumer",
    description: "Detailed service disputes, contractual breaches, and grievance resolutions.",
    defaultSalutation: "To the Grievance Redressal Committee / Support Manager,",
    defaultSignoff: "Regards,",
    placeholderRecipient: "Customer Redressal Officer / Service Lead",
  },
  request: {
    label: "Official Request & Inquiry",
    category: "Administrative",
    description: "Reference letters, document verification, transfer notices, and formal inquiries.",
    defaultSalutation: "Dear Sir/Madam,",
    defaultSignoff: "Respectfully yours,",
    placeholderRecipient: "Registrar / Human Resources Department",
  },
};

/**
 * Intelligent Mock Document Generator
 * Constructs nuanced, professional formal letters and emails from user bullet points.
 */
export function mockGenerateFormalDocument({
  bullets = "",
  letterType = "business",
  tone = "formal",
  length = "medium",
  recipient = "",
  subject = "",
}) {
  const lines = bullets
    .split("\n")
    .map((l) => l.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter(Boolean);

  const meta = TYPE_METADATA[letterType] || TYPE_METADATA.business;
  const targetRecipient = recipient.trim() || meta.placeholderRecipient;
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Extract core keywords from bullets for context
  const combinedText = lines.join(" ");
  const isLeave = /leave|fever|sick|medical|vacation|absence|exam/i.test(combinedText);
  const isUrgent = /urgent|critical|immediately|deadline|asap/i.test(combinedText);
  const isBilling = /bill|payment|refund|invoice|charge|fee/i.test(combinedText);

  // Dynamic Subject Generation
  let autoSubject = subject.trim();
  if (!autoSubject) {
    if (letterType === "college") {
      autoSubject = isLeave
        ? "Application for Formal Leave of Absence - Academic Record"
        : "Formal Request for Academic Documentation and Certification";
    } else if (letterType === "complaint") {
      autoSubject = isBilling
        ? "Formal Dispute Regarding Discrepancies in Recent Invoiced Charges"
        : "Formal Grievance Notice Regarding Service Deficiencies and Request for Rectification";
    } else if (letterType === "request") {
      autoSubject = "Formal Requisition for Official Verification and Record Endorsement";
    } else {
      autoSubject = isUrgent
        ? "High Priority: Strategic Update and Immediate Action Items"
        : "Formal Correspondence: Key Project Deliverables & Operational Overview";
    }
  }

  // Tone Modifiers
  const toneMap = {
    formal: {
      opener: "I am writing to formally bring to your attention the matter regarding",
      transition: "In accordance with institutional standards,",
      closing: "I remain at your disposal should further clarification or supplementary documentation be required.",
    },
    polite: {
      opener: "I hope this communication finds you well. I am writing to kindly present an update concerning",
      transition: "With due consideration of your schedule,",
      closing: "Thank you very much for your time, consideration, and continued support in this matter.",
    },
    firm: {
      opener: "This correspondence serves as a formal notification and directive regarding",
      transition: "Given the time-sensitive nature of these commitments,",
      closing: "I look forward to your prompt confirmation and resolution by the agreed timeline.",
    },
    respectful: {
      opener: "I most humbly submit this formal communication to apprise you of",
      transition: "Subject to your esteemed approval,",
      closing: "I would be deeply obliged for your kind consideration and favorable response.",
    },
  };

  const activeTone = toneMap[tone] || toneMap.formal;

  // Elaborate points into formal prose
  const elaboratedPoints = lines.length > 0
    ? lines.map((pt) => {
        const cleaned = pt.trim().replace(/[.,;]+$/, "");
        const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        if (tone === "firm") {
          return `It is imperative to note that ${capitalized.toLowerCase()}. Immediate adherence to this item is strictly required to avert downstream bottlenecks.`;
        }
        if (tone === "polite") {
          return `Furthermore, kindly note that ${capitalized.toLowerCase()}, which has been coordinated with the respective parties for your convenience.`;
        }
        if (tone === "respectful") {
          return `I most humbly submit that ${capitalized.toLowerCase()}, and request your benevolent consideration regarding this specific circumstance.`;
        }
        return `Regarding key operational requirements: ${capitalized}. Appropriate preparatory steps have been taken to maintain complete fidelity to this schedule.`;
      })
    : [
        "All designated requirements and schedules have been reviewed in detail.",
        "Necessary contingencies have been established to prevent operational disruption.",
      ];

  // Construct Letter/Email Body
  let bodyParagraphs = [];

  if (letterType === "college") {
    // College Official Letter Structure
    bodyParagraphs = [
      `Date: ${today}\n\nTo,\n${targetRecipient}\nInstitution Campus / Academic Division\n\nSubject: ${autoSubject}\n\nRespected Sir/Madam,`,
      `${activeTone.opener} the current academic session and the obligations outlined below.`,
      elaboratedPoints.join("\n\n"),
      length === "long"
        ? `I assure you that I am committed to making up for any missed coursework and will liaise closely with my peers and course instructors to remain current with syllabus requirements. All supporting documents and certificates are enclosed herewith for your review.`
        : `I will ensure all associated assignments and academic requisites remain up to date upon my resumption.`,
      `${activeTone.closing}\n\nYours faithfully,\n\n[Your Full Name]\n[Student ID / Roll Number]\n[Department / Program]`,
    ];
  } else if (letterType === "complaint") {
    // Formal Dispute Structure
    bodyParagraphs = [
      `Date: ${today}\nTo: ${targetRecipient}\nSubject: ${autoSubject}\n\nDear Sir/Madam,`,
      `I am formally filing this notice regarding unsatisfactory circumstances that require your immediate administrative oversight. ${activeTone.opener.toLowerCase()} recent engagements:`,
      elaboratedPoints.map((p, i) => `${i + 1}. ${p}`).join("\n"),
      length === "long"
        ? `Despite prior assurances, these discrepancies have persisted without sufficient remediation, resulting in undue inconvenience and potential contractual breach. Enclosed are transaction records and timestamps substantiating this position.`
        : `This situation requires expedient intervention to avoid further administrative escalation.`,
      `We request written acknowledgment of this correspondence within two business days, accompanied by an actionable remediation schedule.\n\n${activeTone.closing}\n\nSincerely,\n\n[Your Name / Title]\n[Contact Information]`,
    ];
  } else {
    // Business Email Structure
    bodyParagraphs = [
      `Subject: ${autoSubject}\nTo: ${targetRecipient}\nDate: ${today}\n\nDear ${targetRecipient.includes("/") ? "Team" : targetRecipient},`,
      `${activeTone.opener} our ongoing objectives. ${activeTone.transition} I would like to highlight the following core points:`,
      elaboratedPoints.join("\n\n"),
      length === "short"
        ? `Please let me know if any immediate adjustments are needed.`
        : length === "long"
        ? `Our team has evaluated the dependencies surrounding these items and formulated suitable mitigation strategies to ensure full operational alignment. We remain positioned to execute next steps without delay.`
        : `We will proceed according to the stated parameters unless advised otherwise.`,
      `${activeTone.closing}\n\nBest regards,\n\n[Your Name]\n[Your Professional Title]\n[Organization / Department]`,
    ];
  }

  return bodyParagraphs.join("\n\n");
}

/**
 * Real Gemini API Generator
 * Automatically invoked if process.env.GEMINI_API_KEY is configured with a real key.
 */
export async function geminiGenerateFormalDocument({
  bullets,
  tone,
  length,
  letterType,
  recipient,
  subject,
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_API_KEY" || apiKey.trim() === "") {
    throw new Error("GEMINI_API_KEY is not configured. Falling back to local mock engine.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const meta = TYPE_METADATA[letterType] || TYPE_METADATA.business;

  const prompt = `You are a world-class executive communication advisor and formal letter writer.
Task: Write an impeccably worded, professional formal email or letter based strictly on the provided parameters.

Parameters:
- Document Type: ${meta.label} (${meta.description})
- Target Recipient: ${recipient || meta.placeholderRecipient}
- Intended Tone: ${tone} (e.g. formal, polite, firm, respectful)
- Length Target: ${length} (concise, standard, or comprehensive)
- Optional User Subject: ${subject || "Generate a pristine, professional subject line"}

Key User Bullet Points:
${bullets}

Formatting Guidelines:
1. Include Date, Recipient Address Block, Clear Subject Line, Professional Salutation, Structured Body Paragraphs, and Formal Sign-off.
2. Use placeholders like [Your Name], [Your Title], [Date], [Roll No/ID] where specific details are needed.
3. Absolutely no preamble or conversational commentary before or after the document.
4. Output strictly the formal document ready for dispatch.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text;
}

/**
 * Universal Generate Dispatcher
 * Provides seamless fallback to mock generator while allowing immediate Gemini integration.
 */
export async function generateDocument(params) {
  const hasValidKey =
    Boolean(process.env.GEMINI_API_KEY) &&
    process.env.GEMINI_API_KEY !== "YOUR_API_KEY" &&
    process.env.GEMINI_API_KEY.trim().length > 10;

  if (hasValidKey) {
    try {
      const text = await geminiGenerateFormalDocument(params);
      return { text, provider: "gemini" };
    } catch (err) {
      console.warn("Gemini API call failed, safely falling back to mock engine:", err.message);
      const text = mockGenerateFormalDocument(params);
      return { text, provider: "mock-fallback" };
    }
  }

  // Safe Mock Engine
  const text = mockGenerateFormalDocument(params);
  return { text, provider: "mock" };
}
