import { Request, Response } from "express";
import { getMongoQueryFromPrompt } from "../services/googleGenai.service";
import { executeAggregation } from "../services/mongoQuery.service";

export async function handleAssistantRequest(req: Request, res: Response) {
  try {
    const { question } = req.body;

    if (
      !question ||
      typeof question !== "string" ||
      question.trim().length < 5
    ) {
      return res.status(400).json({
        type: "clarification",
        message: "Can you please rephrase your question with more detail?",
        suggestions: [
          "What’s the average success rate for Deal1 last month?",
          "Compare indexing performance between Deal1 and Deal2.",
          "Show me failed jobs for Deal3.",
        ],
      });
    }

    const mongoQuery = await getMongoQueryFromPrompt(question);

    if (!mongoQuery.startsWith("[") || !mongoQuery.endsWith("]")) {
      return res.status(400).json({
        type: "unsupported",
        message: "Sorry, I couldn’t understand that question.",
        suggestions: [
          "Try asking something like:",
          "• Average TOTAL_JOBS_SENT_TO_INDEX for Deal1",
          "• Success rate by client this week",
        ],
      });
    }

    const result = await executeAggregation(mongoQuery);

    if (!result || result.length === 0) {
      return res.status(200).json({
        type: "no_data",
        message: "I couldn't find relevant data for your query.",
        hint: "Try changing the date range or choosing a different client.",
      });
    }

    res.status(200).json({
      type: "success",
      query: JSON.parse(mongoQuery),
      result,
    });
  } catch (err: any) {
    console.error("AI assistant error:", err);
    res.status(500).json({
      type: "error",
      message: "Something went wrong while analyzing your question.",
      hint: "Try rephrasing or ask about a specific client’s performance.",
      error: err.message,
    });
  }
}
