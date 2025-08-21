import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form, useActionData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  Button,
  InlineStack,
  Grid,
  Badge,
  Box,
  TextField,
  Tabs,
  Icon,
} from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
import { authenticate, apiVersion } from "../shopify.server";
import { availableSections } from "../sections.js";
import { useState, useMemo, useEffect } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";

// ACTION function: "Install" button click hone par chalta hai
export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  // Error Fix: Agar session nahi hai, to crash hone ki bajaye login page par bhej do
  if (!session) {
    return redirect("/auth/login");
  }

  const { shop, accessToken } = session;
  const formData = await request.formData();
  const sectionId = formData.get("sectionId");

  let themeId;
  try {
    const themeResponse = await fetch(`https://${shop}/admin/api/${apiVersion}/themes.json`,{ headers: { 'X-Shopify-Access-Token': accessToken } });
    if (!themeResponse.ok) throw new Error("Could not fetch themes");
    const themeData = await themeResponse.json();
    let activeTheme = themeData.themes.find((theme) => theme.role === "main");
    if (!activeTheme) activeTheme = themeData.themes[0];
    if (!activeTheme) throw new Error("There are no themes in this store.");
    themeId = activeTheme.id;
  } catch (e) {
    return json({ error: e.message });
  }

  const sectionToAdd = availableSections.find((s) => s.id === sectionId);
  if (!sectionToAdd) return json({ error: "Section not found." });

  const assetKey = `sections/my-app-${sectionId}-${Date.now()}.liquid`;
  const apiUrl = `https://${shop}/admin/api/${apiVersion}/themes/${themeId}/assets.json`;
  const requestBody = JSON.stringify({ asset: { key: assetKey, value: sectionToAdd.liquidCode } });

  try {
    const response = await fetch(apiUrl, { method: 'PUT', headers: { 'X-Shopify-Access-Token': accessToken, 'Content-Type': 'application/json' }, body: requestBody });
    if (response.ok) return json({ success: `Section '${sectionToAdd.title}' added successfully!` });
    const errorBody = await response.json();
    let errorMessage = "Unknown error";
    if (errorBody && errorBody.errors) errorMessage = typeof errorBody.errors === 'string' ? errorBody.errors : JSON.stringify(errorBody.errors);
    return json({ error: `Failed to add section: ${errorMessage}` });
  } catch (error) {
    return json({ error: "Failed to add section. Check server logs." });
  }
};

// LOADER function: Page load hone par chalta hai
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  // Error Fix: Agar session nahi hai, to crash hone ki bajaye login page par bhej do
  if (!session) {
    return redirect("/auth/login");
  }

  return json({ sections: availableSections });
};

// FRONTEND COMPONENT: Naya Dashboard UI
export default function PolishedDashboard() {
  const { sections } = useLoaderData();
  const actionData = useActionData();
  const shopify = useAppBridge();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    if (actionData?.success) shopify.toast.show(actionData.success);
    else if (actionData?.error) shopify.toast.show(actionData.error, { isError: true });
  }, [actionData, shopify]);

  const categories = useMemo(() => {
    const cats = sections.map((s) => s.category);
    return [{ id: "all", title: "All" }, ...[...new Set(cats)].map(c => ({id: c, title: c}))];
  }, [sections]);

  const filteredSections = useMemo(() => {
    const selectedCategory = categories[selectedTab].id;
    return sections.filter((section) => {
      const matchesCategory = selectedCategory === "all" || section.category === selectedCategory;
      const matchesSearch = section.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedTab, sections, categories]);

  return (
    <Page fullWidth>
      <BlockStack gap="400">
        <Text variant="headingXl" as="h1">Section Library</Text>
        <Card>
          <BlockStack gap="400">
            <TextField
              label="Search Sections"
              labelHidden
              value={searchTerm}
              onChange={setSearchTerm}
              prefix={<Icon source={SearchIcon} />}
              placeholder="Search for sections by name"
              autoComplete="off"
            />
            <Tabs
              tabs={categories.map(c => ({id: c.id, content: c.title}))}
              selected={selectedTab}
              onSelect={setSelectedTab}
            />
          </BlockStack>
        </Card>

        <Text>{`${filteredSections.length} of ${sections.length} sections showing`}</Text>

        <Grid>
          {filteredSections.map((section) => (
            <Grid.Cell key={section.id} columnSpan={{ xs: 6, sm: 3, md: 4, lg: 3, xl: 3 }}>
              <Card>
                <BlockStack gap="200">
                  <Box width="100%"
                    aspectRatio="16/9"
                    background="bg-surface-secondary"
                    borderRadius="200"
                    style={{ overflow: 'hidden' }}
                  >
                    <img src={section.previewImage} alt={section.title} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                  </Box>
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h3" variant="headingMd">{section.title}</Text>
                    {section.type === "premium"
                      ? <Badge tone="info">Pro</Badge>
                      : <Badge tone="success">Free</Badge>
                    }
                  </InlineStack>
                  <Text color="subdued" as="p" truncate>{section.description}</Text>
                  <Form method="post">
                    <input type="hidden" name="sectionId" value={section.id} />
                    <Button submit fullWidth variant="primary">Install</Button>
                  </Form>
                </BlockStack>
              </Card>
            </Grid.Cell>
          ))}
        </Grid>
      </BlockStack>
    </Page>
  );
}
