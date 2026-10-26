import { notFound } from "next/navigation";
import { MotorcycleEditor } from "@/components/motorcycle-editor";
import { deleteMotorcycle } from "@/lib/actions/admin";
import { prisma } from "@/lib/db";
import { ensureDbSynced } from "@/lib/shared-store";

export const dynamic = "force-dynamic";

export default async function EditMotorcyclePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await ensureDbSynced();
  const { id } = await params;
  const query = await searchParams;
  const bike = await prisma.motorcycle.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } }, specifications: true },
  });
  if (!bike) notFound();
  const specs = bike.specifications.map((spec) => `${spec.label}: ${spec.value}`).join("\n");
  return (
    <div className="grid gap-8">
      {query.saved ? (
        <p className="rounded-[10px] border border-emerald-600/30 bg-emerald-50 p-3 text-sm font-semibold text-emerald-950" role="status">
          Motor je bil uspešno shranjen.
        </p>
      ) : null}
      {query.error ? (
        <p className="border border-accent/40 bg-white p-3 text-sm text-accent" role="alert">
          {query.error}
        </p>
      ) : null}
      <MotorcycleEditor
        bike={{
          ...bike,
          sourceCheckedAt: bike.sourceCheckedAt ? bike.sourceCheckedAt.toISOString().slice(0, 10) : "",
          specs,
          images: bike.images.map((image) => ({
            id: image.id,
            url: image.url,
            alt: image.alt,
            isCover: image.isCover,
            sortOrder: image.sortOrder,
          })),
        }}
      />
      <div className="rounded-[12px] border border-black/10 bg-white p-4">
        <form action={deleteMotorcycle} className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink/70">
            Želiš ta motor odstraniti s spletne strani?
          </p>
          <input type="hidden" name="id" value={bike.id} />
          <button className="btn btn-secondary border-accent/40 text-accent hover:border-accent hover:bg-accent/5">
            Odstrani oglas
          </button>
        </form>
      </div>
    </div>
  );
}
