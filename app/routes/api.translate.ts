import type { Route } from "./+types/api.translate";
type TranslationResponse = {
  translation?: string;
  error?: string;
};

const SUPPORTED_TARGET_LANGS = new Set(["en", "jp"]);

const jsonResponse = (body: TranslationResponse, init?: ResponseInit) => {
  const headers = new Headers(init?.headers ?? {});
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return new Response(JSON.stringify(body), {
    status: init?.status,
    statusText: init?.statusText,
    headers,
  });
};

export const action = async ({request, context}: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return jsonResponse({error: "Method not allowed"}, {status: 405});
  }

  const formData = await request.formData();
  const text = formData.get("text");
  const targetLang = formData.get("targetLang");

  if (typeof text !== "string" || text.trim().length === 0) {
    return jsonResponse({error: "Text is required"}, {status: 400});
  }

  if (typeof targetLang !== "string" || !SUPPORTED_TARGET_LANGS.has(targetLang)) {
    return jsonResponse({error: "Unsupported target language"}, {status: 400});
  }

  const ai = context.cloudflare?.env?.AI;
  if (!ai) {
    return jsonResponse({error: "AI service unavailable"}, {status: 503});
  }

  const normalizedTargetLang = targetLang === "jp" ? "ja" : targetLang;

  try {
    const result = await ai.run("@cf/meta/m2m100-1.2b", {
      text: text.trim(),
      source_lang: "zh",
      target_lang: normalizedTargetLang,
    },
    {
      gateway: { id: "shinano" }
    }
  );

    let translation = "";
    if (typeof result === "string") {
      translation = result;
    } else if (result && typeof result === "object") {
      const candidate = result as {
        response?: unknown;
        result?: unknown;
        output?: unknown;
        translated_text?: unknown;
        outputs?: {output_text?: unknown}[];
      };
      const direct =
          candidate.translated_text ??
          candidate.response ??
          candidate.result ??
          candidate.output ??
          (Array.isArray(candidate.outputs) ? candidate.outputs[0]?.output_text : undefined);
      if (typeof direct === "string") {
        translation = direct;
      }
    }

    if (!translation || translation.trim().length === 0) {
      translation = typeof result === "object" ? JSON.stringify(result) : String(result ?? "");
    }

    return jsonResponse({translation: translation.trim()});
  } catch (error) {
    console.error("Translation error:", error);
    return jsonResponse({error: "Translation failed"}, {status: 500});
  }
};

