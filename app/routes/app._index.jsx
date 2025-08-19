import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  Button,
  InlineStack,
  Icon,
  Banner,
  Grid,
  Badge,
} from "@shopify/polaris";
import { LockIcon, StarFilledIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import { availableSections } from "../sections"; // Is file ki zaroorat padegi

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  const isSubscribed = false; // Hum abhi bhi free plan par hain
  return json({
    isSubscribed,
    sections: availableSections,
  });
};

export default function AppDashboard() {
  const { isSubscribed, sections } = useLoaderData();

  return (
    <Page fullWidth title="Dashboard">
      <BlockStack gap={{ xs: "800", sm: "400" }}>
        {/* --- Welcome Banner --- */}
        <Banner title="Welcome to Shahbaz Sections!" tone="info">
          <p>
            To add a section, go to your Theme Editor ("Customize"), click "Add
            section", and find our sections under the "Apps" category.
          </p>
        </Banner>

        <Layout>
          {/* --- Plan Information --- */}
          <Layout.Section variant="oneThird">
            <BlockStack gap={{ xs: "400", sm: "400" }}>
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    Your Plan
                  </Text>
                  <BlockStack gap="200" inlineAlign="center">
                    <Text variant="headingXl" as="h3">
                      {isSubscribed ? "Pro Plan" : "Free Plan"}
                    </Text>
                    <Text>
                      {isSubscribed
                        ? "All sections are unlocked. Thank you!"
                        : "Upgrade to unlock all premium sections."}
                    </Text>
                    {!isSubscribed && (
                      <Button variant="primary" fullWidth>
                        Upgrade to Pro
                      </Button>
                    )}
                  </BlockStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>

          {/* --- Sections Gallery --- */}
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Available Sections
                </Text>
                <Grid>
                  {sections.map((section) => (
                    <Grid.Cell
                      key={section.id}
                      columnSpan={{ xs: 6, sm: 3, md: 3, lg: 4, xl: 4 }}
                    >
                      <div
                        style={{
                          border: "1px solid #E1E3E5",
                          borderRadius: "8px",
                          padding: "16px",
                          height: "100%",
                        }}
                      >
                        <BlockStack gap="300">
                          <InlineStack
                            align="space-between"
                            blockAlign="start"
                          >
                            <Text as="h3" variant="headingSm">
                              {section.title}
                            </Text>
                            {section.type === "premium" ? (
                              <Badge tone="info">
                                <InlineStack gap="100" blockAlign="center">
                                  <Icon source={LockIcon} />
                                  Pro
                                </InlineStack>
                              </Badge>
                            ) : (
                              <Badge tone="success">Free</Badge>
                            )}
                          </InlineStack>
                          <Text color="subdued" as="p">
                            {section.description}
                          </Text>
                        </BlockStack>
                      </div>
                    </Grid.Cell>
                  ))}
                </Grid>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}