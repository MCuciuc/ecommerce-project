
import prismadb from "@/lib/prismadb";

interface DashboardPageProps {
  params: { storeid: string };
}

const DashboardPage = async ({ params }: DashboardPageProps) => {
  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeid,
    },
  });

  return (
    <div>
      Active Store: {store?.name}
    </div>
  );
};

export default DashboardPage;