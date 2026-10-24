// Types for the unit tests (tests/contactLambda.test.ts); the Lambda itself is plain ESM.
export declare const LIMITS: Record<string, number>;
export declare function validate(input: unknown): {
  fields: { name: string; email: string; subject: string; message: string };
  errors: Record<string, string>;
};
export declare function buildEmail(input: {
  fields: { name: string; email: string; subject: string; message: string };
  from: string;
  to: string;
  ip: string;
}): { from: string; to: string; replyTo: string; subject: string; text: string };
export declare function handleContact(
  event: unknown,
  deps: unknown,
): Promise<{ statusCode: number; headers: Record<string, string>; body: string }>;
