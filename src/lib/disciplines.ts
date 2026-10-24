import type { Discipline } from "@/types/content";

/** Accent dot per discipline (fills only; never used for text). */
export const disciplineDot: Record<Discipline, string> = {
  "full-stack": "bg-blue",
  devops: "bg-sage",
  ai: "bg-lavender",
};

/** Short discipline names for compact labels. */
export const disciplineLabel: Record<Discipline, string> = {
  "full-stack": "Full-Stack",
  devops: "DevOps & Cloud",
  ai: "AI Engineering",
};
