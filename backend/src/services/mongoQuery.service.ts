import JobIndexing from "../models/Jobindexing.model";

export async function executeAggregation(rawQuery: string) {
  const parsedQuery = JSON.parse(rawQuery);
  console.log("parsedQuery: ", parsedQuery);
  const result = await JobIndexing.aggregate(parsedQuery).exec();
  console.log("result: ", result);
  return result;
}
