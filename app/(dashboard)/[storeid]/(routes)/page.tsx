
import prismadb from "@/lib/prismadb";

interface DashboardPageProps {
  params: Promise<{ storeid: string }>;
}

const DashboardPage = async ({ params }: DashboardPageProps) => {
  const { storeid } = await params;
  const store = await prismadb.store.findFirst({
    where: {
      id: storeid,
    },
  });

  return (
    <div>
      Active Store: {store?.name}
    </div>
  );
};

export default DashboardPage;