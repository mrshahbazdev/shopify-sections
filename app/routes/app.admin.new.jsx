import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useNavigate } from "@remix-run/react";
import {
  Page, Card, FormLayout, TextField, Select, Button, BlockStack, Banner
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

// ACTION: Form submit hone par data ko database mein save karega
export const action = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  try {
    await prisma.section.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        type: data.type,
        previewImage: data.previewImage,
        liquidCode: data.liquidCode,
        demoUrl: data.demoUrl || null,
      },
    });
    return redirect("/app/admin");
  } catch (error) {
    console.error("Failed to create section:", error);
    return json({ error: "Failed to save section. Please check your data." });
  }
};

export default function NewSection() {
  const actionData = useActionData();
  const navigate = useNavigate();

  return (
    <Page
      title="Create New Section"
      backAction={{ content: "Back to Sections", onAction: () => navigate("/app/admin") }}
    >
      <Card>
        <Form method="post">
          <FormLayout>
            {actionData?.error && (
              <Banner title="Error" tone="critical">{actionData.error}</Banner>
            )}
            <TextField label="Title" name="title" autoComplete="off" required />
            <TextField label="Description" name="description" autoComplete="off" required />
            <TextField label="Category" name="category" autoComplete="off" required />
            <Select
              label="Type"
              name="type"
              options={[
                { label: "Free", value: "free" },
                { label: "Premium", value: "premium" },
              ]}
              required
            />
            <TextField label="Preview Image URL" name="previewImage" autoComplete="off" required />
            <TextField label="Demo URL (Optional)" name="demoUrl" autoComplete="off" />
            <TextField
              label="Liquid Code (with Schema)"
              name="liquidCode"
              multiline={15}
              autoComplete="off"
              required
            />
            <Button submit primary>Save Section</Button>
          </FormLayout>
        </Form>
      </Card>
    </Page>
  );
}
