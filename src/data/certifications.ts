import type { Certification } from "@/types/content";

// Credential pages verified on Credly (issued to Mohammed Ali Abdullah) on 2026-10-23.
// Set credentialUrl to null to hide the action until a link is verified.
export const certifications: Certification[] = [
  {
    id: "aws-saa",
    name: "AWS Certified Solutions Architect – Associate",
    code: "SAA-C03",
    issuer: "Amazon Web Services",
    credentialUrl: "https://www.credly.com/badges/3526bbff-0dc7-4166-949e-27190ba8daf4/public_url",
    discipline: "devops",
  },
  {
    id: "aws-clf",
    name: "AWS Certified Cloud Practitioner",
    code: "CLF-C02",
    issuer: "Amazon Web Services",
    credentialUrl: "https://www.credly.com/badges/2bb44509-e254-435a-8483-e04e2ff7c836/public_url",
    discipline: "devops",
  },
  {
    id: "aws-aif",
    name: "AWS Certified AI Practitioner",
    code: "AIF-C01",
    issuer: "Amazon Web Services",
    credentialUrl: "https://www.credly.com/badges/f0389e01-7139-42da-ac5e-cf76335e5762/public_url",
    discipline: "ai",
  },
];
