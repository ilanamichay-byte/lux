export default async function TestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main>
      <h1>Test dynamic route</h1>
      <pre>{JSON.stringify({ id }, null, 2)}</pre>
    </main>
  );
}
