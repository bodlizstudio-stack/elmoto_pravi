import { notFound } from "next/navigation";
import { MotorcycleEditor } from "@/components/motorcycle-editor";
import { deleteMotorcycle } from "@/lib/actions/admin";
import { prisma } from "@/lib/db";
import { displayName } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditMotorcyclePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const bike = await prisma.motorcycle.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } }, specifications: true },
  });
  if (!bike) notFound();
  const name = displayName(bike);
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
      <details className="rounded-[12px] border border-black/10 bg-white p-4">
        <summary className="cursor-pointer font-semibold">Trajni izbris</summary>
        <form action={deleteMotorcycle} className="mt-4 grid max-w-xl gap-3">
          <p className="text-sm leading-6 text-ink/70">
            Običajna odstranitev je arhiviranje, ki zapis ohrani in ga lahko obnoviš. Trajni izbris pobriše ta motor. Fotografija se iz shrambe odstrani samo, če je ne uporablja drug zapis.
          </p>
          <input type="hidden" name="id" value={bike.id} />
          <label className="field">
            <span>Za potrditev vpiši naziv: {name}</span>
            <input name="confirm" autoComplete="off" />
          </label>
          <button className="btn btn-secondary w-full sm:w-auto">Trajno izbriši</button>
        </form>
      </details>
    </div>
  );
}
