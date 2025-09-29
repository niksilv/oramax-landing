// Χωρίς iframe: ανακατεύθυνση στο /detector
import { redirect } from "next/navigation";
export default function Page() {
  redirect("/detector");
}
