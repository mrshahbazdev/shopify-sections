import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  Button,
  InlineStack,
  Icon,
} from "@shopify/polaris";
import { LockMinor } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
// Hum apne sections ki list abhi bhi istemal kar sakte hain dashboard par dikhane ke liye
import { availableSections } from "../sections";

// LOADER: Yahan hum user ka subscription status check karenge
export const loader = async ({ request }) => {
  await authenticate.admin(request);

  // ABHI KE LIYE: Hum maan lete hain ki user subscribed nahi hai.
  // Baad mein, hum yahan database se check karenge.
  const isSubscribed = false;

  return json({
    isSubscribed,
    sections: availableSections,
  });
};

export default function AppDashboard() {
  const { isSubscribed, sections } = useLoaderData();
  const planName = isSubscribed ? "Pro" : "Free";

  return (
    <Page>
      <ui-title-bar title="Dashboard & Sections" />
      <BlockStack gap={{ xs: "800", sm: "400" }}>
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">
                    Your Current Plan: {planName}
                  </Text>
                  {!isSubscribed && (
                    <Button variant="primary">
                      Upgrade to Pro
                    </Button>
                  )}
                </InlineStack>
                <Text>
                  {isSubscribed
                    ? "Thank you for being a Pro member! All sections are unlocked."
                    : "Upgrade to Pro to unlock all premium sections and blocks."}
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card>
                <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">Available Sections</Text>
                    <Text>To use these sections, go to your Theme Editor ("Customize") and find them under the "Apps" category when you click "Add section".</Text>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {sections.map(section => (
                        <li key={section.id} style={{ borderBottom: '1px solid #E1E3E5', padding: '10px 0' }}>
                           <InlineStack blockAlign="center" align="space-between">
                              <BlockStack gap="100">
                                <Text fontWeight="bold">{section.title}</Text>
                                <Text color="subdued">{section.description}</Text>
                              </BlockStack>

                              {section.type === 'premium' && (
                                <InlineStack gap="100" blockAlign="center">
                                  <Icon source={LockMinor} />
                                  <Text>Pro</Text>
                                </InlineStack>
                              )}
                           </InlineStack>
                        </li>
                      ))}
                    </ul>
                </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
