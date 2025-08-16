import { json } from "@remix-run/node";
import { useLoaderData, Form, useActionData } from "@remix-run/react";
import {
  Page, Text, Card, BlockStack, Layout, Grid, Button,
} from "@shopify/polaris";
import { authenticate, apiVersion } from "../shopify.server";
import { availableSections } from "../sections.js";
import { useEffect } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { shop, accessToken } = session;

  const formData = await request.formData();
  const themeId = formData.get("themeId");
  const sectionId = formData.get("sectionId");

  const sectionToAdd = availableSections.find((s) => s.id === sectionId);

  if (!sectionToAdd) {
    return json({ error: "Section not found." }, { status: 404 });
  }

  const assetKey = `sections/my-app-${sectionId}-${Date.now()}.liquid`;

  const apiUrl = `https://${shop}/admin/api/${apiVersion}/themes/${themeId}/assets.json`;

  const requestBody = JSON.stringify({
    asset: {
      key: assetKey,
      value: sectionToAdd.liquidCode,
    },
  });

  // --- Highlight: DEBUGGING LOGS SHURU ---
  console.log("--- Preparing to Add Section ---");
  console.log("Shop Name:", shop);
  console.log("API Version:", apiVersion);
  console.log("Theme ID:", themeId);
  console.log("Access Token (first 10 chars):", accessToken ? accessToken.substring(0, 10) + "..." : "Not found");
  console.log("Final API URL:", apiUrl);
  // --- DEBUGGING LOGS KHATAM ---

  try {
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

    if (response.ok) {
      return json({ success: `Section '${sectionToAdd.title}' added successfully!` });
    } else {
      const errorBody = await response.json();
      console.error("--- Shopify API Error ---");
      console.error("Status:", response.status);
      console.error("Body:", JSON.stringify(errorBody, null, 2));
      return json({ error: `Failed to add section: ${errorBody.errors || 'Unknown error'}` }, { status: response.status });
    }
  } catch (error) {
    console.error("--- A non-API error occurred ---", error);
    return json({ error: "Failed to add section. Check terminal logs." }, { status: 500 });
  }
};

export const loader = async ({ request, params }) => {
  await authenticate.admin(request);
  const { themeId } = params;
  return json({
    themeId: themeId,
    sections: availableSections,
  });
};

export default function ThemeSectionsPage() {
  const { themeId, sections } = useLoaderData();
  const actionData = useActionData();
  const shopify = useAppBridge();

  useEffect(() => {
    if (actionData?.success) {
      shopify.toast.show(actionData.success);
    } else if (actionData?.error) {
      shopify.toast.show(actionData.error, { isError: true });
    }
  }, [actionData, shopify]);

  return (
    <Page
      title={`Add Sections to Theme: ${themeId}`}
      backAction={{ content: "Themes", url: "/app" }}
    >
      <BlockStack gap="500">
        <Grid>
          {sections.map((section) => (
            <Grid.Cell key={section.id} columnSpan={{ xs: 6, sm: 3, md: 3, lg: 4, xl: 4 }}>
              <Card>
                <BlockStack gap="300">
                  <Text as="h3" variant="headingMd">{section.title}</Text>
                  <Text as="p">{section.description}</Text>
                  <Form method="post">
                    <input type="hidden" name="themeId" value={themeId} />
                    <input type="hidden" name="sectionId" value={section.id} />
                    <Button submit variant="primary">Add Section</Button>
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
