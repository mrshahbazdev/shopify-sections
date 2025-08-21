import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form, useActionData } from "@remix-run/react";
import {
  Page, Layout, Text, Card, BlockStack, Button, InlineStack, Grid, Badge, Box, TextField, Tabs, Icon, Banner,
} from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
import { authenticate, apiVersion } from "../shopify.server";
import prisma from "../db.server"; // sections.js ki jagah ab prisma istemal hoga
import { useState, useMemo, useEffect } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";

// Helper Function: Theme mein install kiye gaye sections ki list haasil karne ke liye
async function getInstalledSections(session) {
  const { shop, accessToken } = session;
  let themeId;
  try {
    const themeResponse = await fetch(`https://${shop}/admin/api/${apiVersion}/themes.json`, { headers: { 'X-Shopify-Access-Token': accessToken } });
    if (!themeResponse.ok) throw new Error("Could not fetch themes");
    const themeData = await themeResponse.json();
    let activeTheme = themeData.themes.find((theme) => theme.role === "main") || themeData.themes[0];
    if (!activeTheme) throw new Error("No themes found");
    themeId = activeTheme.id;
  } catch (e) {
    console.error(e);
    throw e;
  }

  const assetsResponse = await fetch(`https://${shop}/admin/api/${apiVersion}/themes/${themeId}/assets.json?asset[key]=sections/`, { headers: { 'X-Shopify-Access-Token': accessToken } });
  if (!assetsResponse.ok) throw new Error("Could not fetch theme assets");
  const assetsData = await assetsResponse.json();

  const installedSections = assetsData.assets
    .filter(asset => asset.key.startsWith("sections/my-app-"))
    .map(asset => {
      const parts = asset.key.split("-");
      // Filename format: sections/my-app-SECTIONID-TIMESTAMP.liquid
      // Section ID yahan string hoga, database se aane wala ID number hai. Isliye compare karte waqt dhyan rakhna hoga.
      return parts[2];
    });

  return { installedSections: [...new Set(installedSections)], themeId };
}

// LOADER: Ab yeh database se sections aur theme se installed sections laayega
export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  if (!session) return redirect("/auth/login");

  try {
    const [sections, { installedSections }] = await Promise.all([
      prisma.section.findMany({ orderBy: { createdAt: 'desc' } }),
      getInstalledSections(session)
    ]);

    return json({
      sections,
      installedSections,
    });
  } catch (e) {
    console.error("Loader Error:", e.message);
    const sections = await prisma.section.findMany({ orderBy: { createdAt: 'desc' } });
    return json({ sections, installedSections: [], error: e.message });
  }
};

// ACTION: Ab yeh limit check karega aur database se section ka code lega
export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  if (!session) return redirect("/auth/login");

  const isSubscribed = false;

  try {
    const { installedSections, themeId } = await getInstalledSections(session);

    if (!isSubscribed && installedSections.length >= 2) {
      return json({ error: "You have reached your limit of 2 free sections. Please upgrade to Pro." });
    }

    const formData = await request.formData();
    const sectionId = formData.get("sectionId");

    const sectionToAdd = await prisma.section.findUnique({ where: { id: parseInt(sectionId) } });
    if (!sectionToAdd) return json({ error: "Section not found." });

    // Filename mein ab hum database wala ID istemal karenge
    const assetKey = `sections/my-app-${sectionToAdd.id}-${Date.now()}.liquid`;
    const apiUrl = `https://${session.shop}/admin/api/${apiVersion}/themes/${themeId}/assets.json`;
    const requestBody = JSON.stringify({ asset: { key: assetKey, value: sectionToAdd.liquidCode } });
    const response = await fetch(apiUrl, { method: 'PUT', headers: { 'X-Shopify-Access-Token': session.accessToken, 'Content-Type': 'application/json' }, body: requestBody });

    if (response.ok) return json({ success: `Section '${sectionToAdd.title}' added successfully!` });

    const errorBody = await response.json();
    let errorMessage = typeof errorBody.errors === 'string' ? errorBody.errors : JSON.stringify(errorBody.errors);
    return json({ error: `Failed to add section: ${errorMessage}` });
  } catch (e) {
    console.error("Action Error:", e.message);
    return json({ error: e.message });
  }
};

// FRONTEND COMPONENT
export default function PolishedDashboard() {
  const { sections, installedSections, error } = useLoaderData();
  const actionData = useActionData();
  const shopify = useAppBridge();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    if (actionData?.success) shopify.toast.show(actionData.success);
    else if (actionData?.error) shopify.toast.show(actionData.error, { isError: true });
    else if (error) shopify.toast.show(error, { isError: true });
  }, [actionData, error, shopify]);

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

  const isSubscribed = false;
  const limitReached = !isSubscribed && installedSections.length >= 2;

  return (
    <Page fullWidth>
      <BlockStack gap="400">
        <Text variant="headingXl" as="h1">Section Library</Text>
        <Card>
          <BlockStack gap="400">
            <TextField label="Search Sections" labelHidden value={searchTerm} onChange={setSearchTerm} prefix={<Icon source={SearchIcon} />} placeholder="Search for sections by name" autoComplete="off" />
            <Tabs tabs={categories.map(c => ({id: c.id, content: c.title}))} selected={selectedTab} onSelect={setSelectedTab}/>
          </BlockStack>
        </Card>

        {limitReached && (
          <Banner title="Free Limit Reached" tone="warning">
            <p>You have installed {installedSections.length} of 2 free sections. Please upgrade to Pro to install unlimited sections.</p>
          </Banner>
        )}

        <Grid>
          {filteredSections.map((section) => {
            // Hum section ID ko string mein convert karke check karenge
            const isInstalled = installedSections.includes(String(section.id));
            return (
              <Grid.Cell key={section.id} columnSpan={{ xs: 6, sm: 3, md: 4, lg: 3, xl: 3 }}>
                <Card>
                  <BlockStack gap="200">
                    <Box width="100%" aspectRatio="16/9" background="bg-surface-secondary" borderRadius="200" style={{ overflow: 'hidden' }}>
                      <img src={section.previewImage} alt={section.title} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                    </Box>
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="h3" variant="headingMd">{section.title}</Text>
                      {section.type === "premium" ? <Badge tone="info">Pro</Badge> : <Badge tone="success">Free</Badge>}
                    </InlineStack>
                    <Text color="subdued" as="p" truncate>{section.description}</Text>

                    {isInstalled ? (
                      <Button disabled fullWidth>Installed</Button>
                    ) : (
                      <Form method="post">
                        <input type="hidden" name="sectionId" value={section.id} />
                        <Button submit fullWidth variant="primary" disabled={limitReached && section.type === 'free'}>
                          Install
                        </Button>
                      </Form>
                    )}

                  </BlockStack>
                </Card>
              </Grid.Cell>
            )
          })}
        </Grid>
      </BlockStack>
    </Page>
  );
}
