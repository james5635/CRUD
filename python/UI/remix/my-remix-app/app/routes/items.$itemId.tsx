import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, Link } from "@remix-run/react";
import { deleteItem, getItem, updateItem } from "~/utils/api";
import { useState } from "react";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const itemId = params.itemId;
  if (!itemId) {
    throw new Response("Item ID not found", { status: 400 });
  }
  try {
    const item = await getItem(Number(itemId));
    return json({ item });
  } catch (error) {
    console.error(`Error loading item ${itemId}:`, error);
    throw new Response("Item Not Found", { status: 404 });
  }
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const itemId = params.itemId;
  if (!itemId) {
    return json({ errors: { form: "Item ID not found" } }, { status: 400 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    try {
      await deleteItem(Number(itemId));
      return redirect("/");
    } catch (error) {
      console.error("Error deleting item:", error);
      return json({ errors: { form: "Failed to delete item." } }, { status: 500 });
    }
  } else if (intent === "update") {
    const name = formData.get("name");
    if (typeof name !== "string" || name.length === 0) {
      return json({ errors: { name: "Name is required" } }, { status: 400 });
    }
    try {
      await updateItem(Number(itemId), name);
      return redirect(`/items/${itemId}`);
    } catch (error) {
      console.error("Error updating item:", error);
      return json({ errors: { form: "Failed to update item." } }, { status: 500 });
    }
  }

  return json({ message: "Invalid intent" }, { status: 400 });
};

export default function ItemDetail() {
  const { item } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Item Detail</h1>

      {!isEditing ? (
        <>
          <p className="mb-2"><strong>ID:</strong> {item.id}</p>
          <p className="mb-4"><strong>Name:</strong> {item.name}</p>
          <div className="flex space-x-4">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
            >
              Edit
            </button>
            <Form method="post" onSubmit={(e) => {
              if (!confirm("Are you sure you want to delete this item?")) {
                e.preventDefault();
              }
            }}>
              <input type="hidden" name="intent" value="delete" />
              <button
                type="submit"
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Delete
              </button>
            </Form>
          </div>
        </>
      ) : (
        <Form method="post" className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Item Name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={item.name}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
            {actionData?.errors?.name && (
              <p className="text-red-500 text-xs mt-1">{actionData.errors.name}</p>
            )}
          </div>
          <input type="hidden" name="intent" value="update" />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Update Item
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-2"
          >
            Cancel
          </button>
          {actionData?.errors?.form && (
            <p className="text-red-500 text-xs mt-1">{actionData.errors.form}</p>
          )}
        </Form>
      )}

      <p className="mt-4">
        <Link to="/" className="text-blue-600 hover:underline">Back to Items List</Link>
      </p>
    </div>
  );
}
