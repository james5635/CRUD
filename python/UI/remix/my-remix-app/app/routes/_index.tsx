import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, Link } from "@remix-run/react";
import { createItem, getItems } from "~/utils/api";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const items = await getItems();
    return json({ items });
  } catch (error) {
    console.error("Error loading items:", error);
    return json({ items: [] }, { status: 500 });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const name = formData.get("name");

  if (typeof name !== "string" || name.length === 0) {
    return json({ errors: { name: "Name is required" } }, { status: 400 });
  }

  try {
    await createItem(name);
    return redirect("/"); // Redirect to the home page to refresh the list
  } catch (error) {
    console.error("Error creating item:", error);
    return json({ errors: { form: "Failed to create item." } }, { status: 500 });
  }
};

export default function Index() {
  const { items } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Items List</h1>

      <h2 className="text-xl font-bold mb-2">Create New Item</h2>
      <Form method="post" className="space-y-4 mb-8">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Item Name:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
          {actionData?.errors?.name && (
            <p className="text-red-500 text-xs mt-1">{actionData.errors.name}</p>
          )}
        </div>
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Create Item
        </button>
        {actionData?.errors?.form && (
          <p className="text-red-500 text-xs mt-1">{actionData.errors.form}</p>
        )}
      </Form>

      <h2 className="text-xl font-bold mb-2">Existing Items</h2>
      {
        items.length === 0 ? (
          <p>No items found. Create one above!</p>
        ) : (
          <ul className="list-disc pl-5">
            {items.map((item: { id: number; name: string }) => (
              <li key={item.id} className="mb-2">
                <Link to={`items/${item.id}`} className="text-blue-600 hover:underline">
                  Item {item.id}: {item.name}
                </Link>
              </li>
            ))}
          </ul>
        )
      }
    </div>
  );
}
