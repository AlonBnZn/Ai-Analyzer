// services/googleGenai.service.ts
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

/**
 * Converts a user question into a MongoDB aggregation query using Gemini
 */
export async function getMongoQueryFromPrompt(
  question: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: process.env.GOOGLE_MODEL!,
  });

  const currentDate = new Date().toISOString().slice(0, 10); // e.g. "2025-07-17"

  const prompt = `
You are a MongoDB aggregation assistant specialized in the "JobIndexing" collection.

Your task is to convert natural language questions into valid MongoDB aggregation pipelines.
Respond with **only** a JSON array representing the pipeline (e.g., [ {...}, {...} ]) — no explanations, comments, markdown formatting, or extra text.

---

### RULES:

1. If the question is ambiguous, off-topic, or unsupported, respond exactly with:
UNSUPPORTED

2. If valid, generate a pipeline using only these MongoDB stages:
$match, $group, $project, $sort, $limit

3. Use only operators supported by MongoDB aggregation framework (no JavaScript functions).

4. Each query should focus on a single clear subject.

---

COLLECTION: "job_indexing_logs"

Fields and Types:

- _id: string (required)
- country_code: string (required, uppercase, length 2–3)
- currency_code: string (required, uppercase, length 3, matches /^[A-Z]{3}$/)
- progress: object (required) with fields:
  - SWITCH_INDEX: boolean (default false)
  - TOTAL_RECORDS_IN_FEED: number (required, min 0)
  - TOTAL_JOBS_IN_FEED: number (required, min 0)
  - TOTAL_JOBS_FAIL_INDEXED: number (default 0, min 0)
  - TOTAL_JOBS_SENT_TO_ENRICH: number (default 0, min 0)
  - TOTAL_JOBS_DONT_HAVE_METADATA: number (default 0, min 0)
  - TOTAL_JOBS_DONT_HAVE_METADATA_V2: number (default 0, min 0)
  - TOTAL_JOBS_SENT_TO_INDEX: number (required, min 0)
- status: string (required, one of "completed", "failed", "processing", lowercase)
- timestamp: string (required, ISO 8601 date string)
- transactionSourceName: string (required, trimmed)
- noCoordinatesCount: number (optional, default 0, min 0)
- recordCount: number (optional, default 0, min 0)
- uniqueRefNumberCount: number (optional, default 0, min 0)
- createdAt, updatedAt: timestamps (auto-managed)


---

### IMPORTANT DATE HANDLING INSTRUCTIONS:

- You MUST NOT generate queries with MongoDB dynamic date operators like $dateTrunc, $dateSubtract, or $$NOW.

- All date filters MUST use explicit fixed ISO date strings in the format "YYYY-MM-DDTHH:mm:ss.sssZ".

- The backend will preprocess relative date phrases such as "last month", "this week", and inject the exact ISO date ranges in the question.

- For example, if the user says "last month", the backend will provide:

  timestamp >= "2025-06-01T00:00:00.000Z" AND timestamp < "2025-07-01T00:00:00.000Z"

  - If the question specifies a month without a year (e.g., "June"), assume the current year is ${currentDate.slice(
    0,
    4
  )}.

- If the question specifies relative days like "today" or "last day" without explicit date ranges, assume the date is ${currentDate} (start at "YYYY-MM-DDT00:00:00.000Z" and end at "YYYY-MM-DDT23:59:59.999Z").


- Your returned aggregation pipeline must use these exact date strings in $match filters.

---

### EXAMPLES OF SUPPORTED QUESTIONS:

- What is the average TOTAL_JOBS_SENT_TO_INDEX per client last month?
- Show me FAILED_JOBS_INDEXED counts for Deal1.
- Compare job indexing success rates between Deal1 and Deal2.
- Total jobs sent by country in June.
- Top 5 clients with the most failed jobs this week.

---

### EXAMPLES OF UNSUPPORTED QUESTIONS:

- Who is the best client?
- How do I fix a failed index job?
- What is the stock price of MongoDB?

---

### OUTPUT FORMAT:

Return exactly and only a valid MongoDB aggregation pipeline as a JSON array.

Do NOT include markdown formatting, backticks, explanations, or any other text.

---

User question: """${question}"""
`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  console.log("Gemini response:", response);

  if (response.includes("UNSUPPORTED")) {
    throw new Error("Unsupported query");
  }

  return response.trim();
}
