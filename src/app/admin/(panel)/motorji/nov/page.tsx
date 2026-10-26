import { MotorcycleEditor } from "@/components/motorcycle-editor";

export default async function NewMotorcyclePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const query = await searchParams;
  const initialMode = query.mode === "manual" ? "manual" : "avtonet";
  return <MotorcycleEditor initialMode={initialMode} />;
}
