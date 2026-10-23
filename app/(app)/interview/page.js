import InterviewSession from "@/components/interview/InterviewSession";

export const metadata = { title: "Mock Interview — InterviewIQ" };

export default function InterviewPage() {
  // Later: read category/difficulty from the interview document (or search params)
  return <InterviewSession category="Frontend Development" difficulty="Medium" />;
}
