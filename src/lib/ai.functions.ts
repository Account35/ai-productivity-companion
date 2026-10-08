import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const emailSchema = z.object({
  mode: z.literal("email"),
  tone: z.enum(["formal", "friendly", "persuasive"]),
  context: z.string().min(3).max(4000),
});

const researchSchema = z.object({
  mode: z.literal("research"),
  topic: z.string().min(3).max(6000),
});

const chatSchema = z.object({
  mode: z.literal("chat"),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(40),
});

const inputSchema = z.discriminatedUnion("mode", [
  emailSchema,
  researchSchema,
  chatSchema,
]);

export const generateAi = createServerFn({ method: "POST" })
  .inputValidator(inputSchema)
  .handler(async ({ data }) => {
    const { generateAiText } = await import("./ai.server");

    if (data.mode === "email") {
      const toneGuide: Record<string, string> = {
        formal:
          "Use a formal, polished business register: proper salutations, precise language, no contractions or slang.",
        friendly:
          "Use a warm, approachable register: conversational but still professional, light contractions allowed.",
        persuasive:
          "Use a persuasive register: highlight benefits, address objections, and end with a clear, motivating call to action.",
      };
      const text = await generateAiText(
        [
          {
            role: "user",
            content: `Write a professional workplace email based on this request:\n\n${data.context}`,
          },
        ],
        `You are an expert workplace communication assistant. Write a complete, ready-to-send email with a subject line (prefix it with "Subject:"), greeting, body, and sign-off. ${toneGuide[data.tone]} Keep it concise and skimmable. Output the email only.`,
      );
      return { text };
    }

    if (data.mode === "research") {
      const text = await generateAiText(
        [
          {
            role: "user",
            content: `Research and analyse the following topic, article text, or URL:\n\n${data.topic}`,
          },
        ],
        `You are an AI research assistant for workplace professionals. Analyse the input and respond in markdown with these sections: "## Summary" (3-5 sentences), "## Key Insights" (bulleted, 3-6 items), and "## Recommendations" (bulleted, 3-5 actionable items). If a URL is given, use your knowledge of it and note any uncertainty. Be specific and genuinely useful.`,
      );
      return { text };
    }

    const text = await generateAiText(
      data.messages.map((m) => ({ role: m.role, content: m.content })),
      `You are a helpful AI workplace productivity assistant. Answer questions about work, productivity, communication, planning, and professional tasks. Be concise, practical, and specific. Use markdown formatting when it helps readability.`,
    );
    return { text };
  });
