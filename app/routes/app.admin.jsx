import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Page, Card, IndexTable, Text } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

// LOADER: Database se saare sections fetch karega
export const loader = async ({ request }) => {
  await authenticate.admin(request);
  const sections = await prisma.section.findMany({
    orderBy: { createdAt: "desc" },
  });
  return json({ sections });
};

export default function AdminIndex() {
  const { sections } = useLoaderData();

  const rowMarkup = sections.map(
    ({ id, title, type, category }, index) => (
      <IndexTable.Row id={id} key={id} position={index}>
        <IndexTable.Cell>
          <Link to={`new?id=${id}`}>{title}</Link>
        </IndexTable.Cell>
        <IndexTable.Cell>{category}</IndexTable.Cell>
        <IndexTable.Cell>{type}</IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <Page
      title="Admin: Manage Sections"
      primaryAction={{ content: "Create new section", url: "/app/admin/new" }}
    >
      <Card>
        {sections.length === 0 ? (
          <Text alignment="center" as="p">No sections created yet. Click "Create new section" to begin.</Text>
        ) : (
          <IndexTable
            itemCount={sections.length}
            headings={[
              { title: "Title" },
              { title: "Category" },
              { title: "Type (Free/Premium)" },
            ]}
            selectable={false}
          >
            {rowMarkup}
          </IndexTable>
        )}
      </Card>
    </Page>
  );
}
