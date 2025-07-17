// Fixed Assistant Controller - backend/src/controllers/assistant.controller.ts
import { Request, Response } from "express";
import { getMongoQueryFromPrompt } from "../services/googleGenai.service";
import { executeAggregation } from "../services/mongoQuery.service";

interface AssistantResponse {
  type: "success" | "clarification" | "unsupported" | "no_data" | "error";
  message: string;
  data?: any;
  query?: any;
  responseType?: "text" | "table" | "chart";
  suggestions?: string[];
  hint?: string;
}

interface FormattedResponse {
  message: string;
  data: any;
  responseType: "text" | "table" | "chart";
}

export async function handleAssistantRequest(req: Request, res: Response) {
  try {
    const { question } = req.body;

    if (
      !question ||
      typeof question !== "string" ||
      question.trim().length < 5
    ) {
      const response: AssistantResponse = {
        type: "clarification",
        message: "Can you please rephrase your question with more detail?",
        responseType: "text",
        suggestions: [
          "What's the average success rate for Deal1 last month?",
          "Compare indexing performance between Deal1 and Deal2.",
          "Show me failed jobs for Deal3.",
          "Create a table of top performing clients",
          "Display a chart of job volumes by country",
        ],
      };
      return res.status(200).json(response);
    }

    console.log("🤖 Processing question:", question);

    const mongoQuery = await getMongoQueryFromPrompt(question);

    if (!mongoQuery.startsWith("[") || !mongoQuery.endsWith("]")) {
      const response: AssistantResponse = {
        type: "unsupported",
        message: "Sorry, I couldn't understand that question.",
        responseType: "text",
        suggestions: [
          "Try asking something like:",
          "• Average TOTAL_JOBS_SENT_TO_INDEX for Deal1",
          "• Success rate by client this week",
          "• Show me top clients in a table",
          "• Create a chart of processing volumes",
        ],
      };
      return res.status(200).json(response);
    }

    console.log("📊 Generated MongoDB query:", mongoQuery);
    const result = await executeAggregation(mongoQuery);

    if (!result || result.length === 0) {
      const response: AssistantResponse = {
        type: "no_data",
        message: "I couldn't find relevant data for your query.",
        responseType: "text",
        hint: "Try changing the date range or choosing a different client.",
      };
      return res.status(200).json(response);
    }

    console.log("📈 Query result length:", result.length);
    console.log("📊 Query result:", JSON.stringify(result, null, 2));

    // Determine response type and format data
    const responseData = determineResponseTypeAndFormat(question, result);

    console.log("📋 Response data:", responseData);

    if (responseData === null) {
      console.error("❌ Failed to format response data");
      const errorResponse: AssistantResponse = {
        type: "error",
        message: "I encountered an issue formatting the response data.",
        responseType: "text",
        hint: "Try rephrasing your question or asking for a different format.",
      };
      return res.status(500).json(errorResponse);
    }

    // Now TypeScript knows responseData is FormattedResponse, not null
    const response: AssistantResponse = {
      type: "success",
      message: responseData.message,
      data: responseData.data,
      query: JSON.parse(mongoQuery),
      responseType: responseData.responseType,
    };

    res.status(200).json(response);
  } catch (err: any) {
    console.error("❌ AI assistant error:", err);

    const response: AssistantResponse = {
      type: "error",
      message: "Something went wrong while analyzing your question.",
      responseType: "text",
      hint: "Try rephrasing or ask about a specific client's performance.",
    };

    res.status(500).json(response);
  }
}

function determineResponseTypeAndFormat(
  question: string,
  data: any[]
): FormattedResponse | null {
  try {
    console.log("🔍 Starting format determination with data:", data);

    const questionLower = question.toLowerCase();

    // Determine if user wants a specific format
    const wantsTable =
      questionLower.includes("table") ||
      questionLower.includes("list") ||
      questionLower.includes("show me") ||
      questionLower.includes("display");

    const wantsChart =
      questionLower.includes("chart") ||
      questionLower.includes("graph") ||
      questionLower.includes("plot") ||
      questionLower.includes("visualize") ||
      questionLower.includes("trends") ||
      questionLower.includes("compare");

    // Auto-determine based on data structure and size
    const isAggregateResult =
      data.length === 1 &&
      (data[0].hasOwnProperty("total") ||
        data[0].hasOwnProperty("average") ||
        data[0].hasOwnProperty("count") ||
        data[0].hasOwnProperty("sum") ||
        data[0].hasOwnProperty("totalJobs") || // Handle your specific case
        // Check for any field containing common aggregate patterns
        Object.keys(data[0]).some(
          (key) =>
            key.toLowerCase().includes("total") ||
            key.toLowerCase().includes("count") ||
            key.toLowerCase().includes("average") ||
            key.toLowerCase().includes("sum") ||
            key.toLowerCase().includes("jobs")
        ));

    const isListResult = data.length > 1 && data.length <= 50;
    const isLargeDataset = data.length > 50;

    console.log("🔍 Analysis:", {
      isAggregateResult,
      isListResult,
      isLargeDataset,
      wantsTable,
      wantsChart,
      dataLength: data.length,
      firstItem: data[0],
      firstItemKeys: Object.keys(data[0] || {}),
    });

    // Single aggregate values should be text
    if (isAggregateResult) {
      console.log("📝 Formatting as text (aggregate result)");
      return formatAsText(question, data);
    }

    // User explicitly requested a format
    if (wantsChart && isListResult) {
      console.log("📊 Formatting as chart (user requested)");
      return formatAsChart(question, data);
    }

    if (wantsTable && isListResult) {
      console.log("📋 Formatting as table (user requested)");
      return formatAsTable(question, data);
    }

    // Auto-determine based on data characteristics
    if (isListResult) {
      // If data has numeric values that could be charted
      const hasNumericData = data.some((item) =>
        Object.values(item).some(
          (value) => typeof value === "number" && value > 0
        )
      );

      // If asking for comparisons or trends, prefer chart
      if (
        hasNumericData &&
        (questionLower.includes("compare") ||
          questionLower.includes("top") ||
          questionLower.includes("best") ||
          questionLower.includes("most") ||
          questionLower.includes("highest") ||
          questionLower.includes("lowest"))
      ) {
        console.log("📊 Formatting as chart (comparison detected)");
        return formatAsChart(question, data);
      }

      // Otherwise default to table for list data
      console.log("📋 Formatting as table (list result)");
      return formatAsTable(question, data);
    }

    // Large datasets should be summarized as text
    if (isLargeDataset) {
      console.log("📝 Formatting as text (large dataset)");
      return formatAsText(question, data.slice(0, 5)); // Show summary of first 5
    }

    // Default to text
    console.log("📝 Formatting as text (default)");
    return formatAsText(question, data);
  } catch (error) {
    console.error("❌ Error in determineResponseTypeAndFormat:", error);
    return null;
  }
}

function formatAsText(question: string, data: any[]): FormattedResponse {
  try {
    console.log("📝 Starting text formatting with data:", data);

    let message = "";

    if (data.length === 1) {
      // Single result - likely an aggregate
      const result = data[0];
      const keys = Object.keys(result);

      console.log("📝 Formatting single result:", result);
      console.log("📝 Available keys:", keys);

      // Check for common aggregate field patterns
      const totalField = keys.find(
        (key) =>
          key.toLowerCase().includes("total") ||
          key.toLowerCase().includes("jobs")
      );
      const countField = keys.find((key) =>
        key.toLowerCase().includes("count")
      );
      const sumField = keys.find((key) => key.toLowerCase().includes("sum"));
      const averageField = keys.find(
        (key) =>
          key.toLowerCase().includes("average") ||
          key.toLowerCase().includes("avg")
      );

      console.log("📝 Found fields:", {
        totalField,
        countField,
        sumField,
        averageField,
      });

      if (totalField) {
        const value = result[totalField];
        const fieldName = totalField
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());
        message = `Based on your query "${question}", the **${fieldName}** is **${value.toLocaleString()}**.`;
        console.log("📝 Using total field:", totalField, "with value:", value);
      } else if (countField) {
        const value = result[countField];
        const fieldName = countField
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());
        message = `Based on your query "${question}", the **${fieldName}** is **${value.toLocaleString()}**.`;
        console.log("📝 Using count field:", countField, "with value:", value);
      } else if (sumField) {
        const value = result[sumField];
        const fieldName = sumField
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());
        message = `Based on your query "${question}", the **${fieldName}** is **${value.toLocaleString()}**.`;
        console.log("📝 Using sum field:", sumField, "with value:", value);
      } else if (averageField) {
        const value = result[averageField];
        const fieldName = averageField
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());
        message = `Based on your query "${question}", the **${fieldName}** is **${value.toFixed(
          2
        )}**.`;
        console.log(
          "📝 Using average field:",
          averageField,
          "with value:",
          value
        );
      } else {
        // Generic single result - use first meaningful field (not _id)
        const meaningfulKeys = keys.filter((key) => key !== "_id");
        if (meaningfulKeys.length > 0) {
          const firstKey = meaningfulKeys[0];
          const value = result[firstKey];
          const fieldName = firstKey
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase());

          if (typeof value === "number") {
            message = `Based on your query "${question}", the **${fieldName}** is **${value.toLocaleString()}**.`;
          } else {
            message = `Based on your query "${question}", the **${fieldName}** is **${String(
              value
            )}**.`;
          }
          console.log(
            "📝 Using first meaningful field:",
            firstKey,
            "with value:",
            value
          );
        } else {
          // Fallback - show all fields
          message = `Here's what I found for "${question}":\n\n`;
          Object.entries(result).forEach(([key, value]) => {
            if (key !== "_id") {
              // Skip MongoDB _id field
              const formattedKey = key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())
                .replace(/_/g, " ");
              const formattedValue =
                typeof value === "number"
                  ? value.toLocaleString()
                  : String(value);
              message += `• **${formattedKey}**: ${formattedValue}\n`;
            }
          });
          console.log("📝 Using fallback formatting for all fields");
        }
      }
    } else {
      // Multiple results - provide summary
      message = `I found **${data.length}** results for "${question}":\n\n`;

      data.slice(0, 5).forEach((item, index) => {
        const keys = Object.keys(item).filter((key) => key !== "_id");
        if (keys.length > 0) {
          const firstKey = keys[0];
          const firstValue = item[firstKey];
          const secondKey = keys[1];
          const secondValue = item[secondKey];

          message += `${index + 1}. **${firstValue}**`;
          if (secondKey && secondValue !== undefined) {
            const formattedSecond =
              typeof secondValue === "number"
                ? secondValue.toLocaleString()
                : String(secondValue);
            message += ` - ${formattedSecond}`;
          }
          message += "\n";
        }
      });

      if (data.length > 5) {
        message += `\n... and ${
          data.length - 5
        } more results. Ask for a table to see more!`;
      }
    }

    const result = {
      message,
      data: data,
      responseType: "text" as const,
    };

    console.log("📝 Text formatting completed:", {
      messageLength: message.length,
    });
    return result;
  } catch (error) {
    console.error("❌ Error in formatAsText:", error);
    throw error;
  }
}

function formatAsTable(question: string, data: any[]): FormattedResponse {
  const message = `Here's a table showing the results for "${question}":`;

  // Clean up the data for better display
  const cleanedData = data.map((item) => {
    const cleaned: any = {};
    Object.entries(item).forEach(([key, value]) => {
      if (key !== "_id") {
        // Skip MongoDB _id field
        // Format keys to be more readable
        const cleanKey = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .replace(/_/g, " ")
          .replace("Id", "ID");
        cleaned[cleanKey] = value;
      }
    });
    return cleaned;
  });

  return {
    message,
    data: cleanedData,
    responseType: "table" as const,
  };
}

function formatAsChart(question: string, data: any[]): FormattedResponse {
  const message = `Here's a chart visualization for "${question}":`;

  // Prepare data for chart rendering
  const chartData = data.map((item) => {
    const formatted: any = {};
    Object.entries(item).forEach(([key, value]) => {
      if (key !== "_id") {
        // Skip MongoDB _id field
        // Keep keys simpler for chart labels
        const cleanKey = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());
        formatted[cleanKey] = value;
      }
    });
    return formatted;
  });

  return {
    message,
    data: chartData,
    responseType: "chart" as const,
  };
}
