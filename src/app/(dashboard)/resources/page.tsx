import { auth } from "@/lib/auth";
import { getCategoriesAction } from "@/actions/categories";
import { getResourcesAction } from "@/actions/resources";
import { ResourcesContainer } from "@/components/resources/resources-container";

export const metadata = {
  title: "Resources & Notes — Lock In",
  description:
    "Manage articles, books, papers, courses, documentation and structured notes organized into your knowledge tree.",
};

export default async function ResourcesPage() {
  const session = await auth();
  const [categoriesRes, myResourcesRes, publicResourcesRes] = await Promise.all([
    getCategoriesAction(),
    getResourcesAction({ scope: "all" }),
    getResourcesAction({ scope: "public" }),
  ]);

  const categories = categoriesRes.ok && categoriesRes.data ? categoriesRes.data : [];
  const myResources = myResourcesRes.ok && myResourcesRes.data ? myResourcesRes.data : [];
  const publicResources = publicResourcesRes.ok && publicResourcesRes.data ? publicResourcesRes.data : [];

  return (
    <ResourcesContainer
      initialMyResources={myResources}
      initialPublicResources={publicResources}
      categories={categories}
      currentUserId={session?.user?.id || ""}
    />
  );
}
