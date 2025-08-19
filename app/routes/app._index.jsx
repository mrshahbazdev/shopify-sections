import { json } from "@remix-run/node";
import { useLoaderData, Form, useActionData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  Button,
  InlineStack,
  Banner,
} from "@shopify/polaris";
import { authenticate, apiVersion } from "../shopify.server";
import { availableSections } from "../sections.js";
import { useEffect } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";

// ACTION: Yeh function "Add to Main Theme" button click hone par chalega
export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { shop, accessToken } = session;

  const formData = await request.formData();
  const sectionId = formData.get("sectionId");

  // Step 1: Live theme ki ID haasil karein
  let themeId;
  try {
    const themeResponse = await fetch(`https://${shop}/admin/api/${apiVersion}/themes.json`, {
      headers: { 'X-Shopify-Access-Token': accessToken },
    });
    if (!themeResponse.ok) throw new Error("Could not fetch themes");
    const themeData = await themeResponse.json();
    const mainTheme = themeData.themes.find((theme) => theme.role === "main");
    if (!mainTheme) throw new Error("Could not find a main theme");
    themeId = mainTheme.id;
  } catch (e) {
    console.error(e);
    return json({ error: "Could not find your store's main theme." });
  }

  // Step 2: Add kiye jaane wale section ka code haasil karein
  const sectionToAdd = availableSections.find((s) => s.id === sectionId);
  if (!sectionToAdd) {
    return json({ error: "Section not found." });
  }

  // Step 3: API call karein (Yeh wahi call hai jo 404 error de rahi hai)
  const assetKey = `sections/my-app-${sectionId}-${Date.now()}.liquid`;
  const apiUrl = `https://${shop}/admin/api/${apiVersion}/themes/${themeId}/assets.json`;
  const requestBody = JSON.stringify({
    asset: {
      key: assetKey,
      value: sectionToAdd.liquidCode,
    },
  });

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
      return json({ error: `Failed to add section: ${errorBody.errors || 'Unknown error'}` });
    }
  } catch (error) {
    return json({ error: "Failed to add section. Check server logs." });
  }
};

// LOADER: Yeh page load hone par sections ki list layega
export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return json({
    sections: availableSections,
  });
};

export default function APIDashboard() {
  const { sections } = useLoaderData();
  const actionData = useActionData();
  const shopify = useAppBridge();

  // Action se mile response ke basis par notification dikhayein
  useEffect(() => {
    if (actionData?.success) {
      shopify.toast.show(actionData.success);
    } else if (actionData?.error) {
      shopify.toast.show(actionData.error, { isError: true });
    }
  }, [actionData, shopify]);

  return (
    <Page fullWidth title="Section Library">
      <BlockStack gap="500">
        <Banner title="How to use" tone="info">
          <p>
            Choose a section from the library below and click "Add to Main Theme"
            to add it to your store.
          </p>
        </Banner>
        <Card>
          <BlockStack>
            {sections.map((section, index) => (
              <div
                key={section.id}
                style={{
                  borderBottom:
                    index < sections.length - 1
                      ? "1px solid #E1E3E5"
                      : "none",
                  padding: "16px 0",
                }}
              >
                <InlineStack
                  wrap={false}
                  align="space-between"
                  blockAlign="center"
                >
                  <BlockStack gap="100">
                    <Text as="h3" variant="headingMd">
                      {section.title}
                    </Text>
                    <Text color="subdued">{section.description}</Text>
                  </BlockStack>
                  <Form method="post">
                    <input
                      type="hidden"
                      name="sectionId"
                      value={section.id}
                    />
                    <Button submit variant="primary">
                      Add to Main Theme
                    </Button>
                  </Form>
                </InlineStack>
              </div>
            ))}
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
