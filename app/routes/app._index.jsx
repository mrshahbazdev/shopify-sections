// Sirf `Index` function ko replace karein, upar ka loader code waisa hi rahega.
// Imports mein Button, InlineStack, Link add karna na bhoolein.

import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react"; // Link ko import karein
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  List,
  EmptyState,
  Button, // Button ko import karein
  InlineStack, // InlineStack ko import karein
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

// ... aapka loader function yahan waisa hi rahega ...
export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const response = await admin.rest.get({
    path: "themes.json",
  });
  const responseJson = await response.json();
  return json({
    themes: responseJson.themes,
  });
};


export default function Index() {
  const { themes = [] } = useLoaderData() || {};

  return (
    <Page>
      <ui-title-bar title="Section Library" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Store Themes
                  </Text>
                  <Text variant="bodyMd" as="p">
                    Neeche aapke store ke sabhi available themes ki list hai.
                  </Text>
                </BlockStack>

                {themes.length > 0 ? (
                  <List>
                    {themes.map((theme) => (
                      <List.Item key={theme.id}>
                        <InlineStack align="space-between" blockAlign="center">
                          <Text as="span">
                            {theme.name}{" "}
                            {theme.role === "main" && "(Live Theme)"}
                          </Text>
                          <Link to={`themes/${theme.id}`}>
                            <Button variant="primary">Manage Sections</Button>
                          </Link>
                        </InlineStack>
                      </List.Item>
                    ))}
                  </List>
                ) : (
                  <EmptyState
                    heading="No themes found"
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  >
                    <p>We couldn't find any themes in your store.</p>
                  </EmptyState>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}