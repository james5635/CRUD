using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

public class Program
{
    private static readonly HttpClient client = new HttpClient();

    public static async Task Main(string[] args)
    {
        client.BaseAddress = new Uri("http://localhost:5086/items");

        while (true)
        {
            Console.WriteLine();
            Console.WriteLine("1. Get all items");
            Console.WriteLine("2. Get an item by ID");
            Console.WriteLine("3. Create an item");
            Console.WriteLine("4. Update an item");
            Console.WriteLine("5. Delete an item");
            Console.WriteLine("6. Exit");
            Console.WriteLine();
            Console.Write("Enter your choice: ");

            var choice = Console.ReadLine();

            switch (choice)
            {
                case "1":
                    await GetItems();
                    break;
                case "2":
                    await GetItem();
                    break;
                case "3":
                    await CreateItem();
                    break;
                case "4":
                    await UpdateItem();
                    break;
                case "5":
                    await DeleteItem();
                    break;
                case "6":
                    return;
                default:
                    Console.WriteLine("Invalid choice. Please try again.");
                    break;
            }
        }
    }

    private static async Task GetItems()
    {
        var items = await client.GetFromJsonAsync<Item[]>("items");
        foreach (var item in items)
        {
            Console.WriteLine($"ID: {item.Id}, Name: {item.Name}");
        }
    }

    private static async Task GetItem()
    {
        Console.Write("Enter the ID of the item: ");
        var id = Console.ReadLine();
        var item = await client.GetFromJsonAsync<Item>($"items/{id}");
        Console.WriteLine($"ID: {item.Id}, Name: {item.Name}");
    }

    private static async Task CreateItem()
    {
        Console.Write("Enter the name of the item: ");
        var name = Console.ReadLine();
        var item = new Item { Name = name };
        var response = await client.PostAsJsonAsync("items", item);
        var createdItem = await response.Content.ReadFromJsonAsync<Item>();
        Console.WriteLine($"Created item with ID: {createdItem.Id}");
    }

    private static async Task UpdateItem()
    {
        Console.Write("Enter the ID of the item to update: ");
        var id = Console.ReadLine();
        Console.Write("Enter the new name of the item: ");
        var name = Console.ReadLine();
        var item = new Item { Name = name };
        await client.PutAsJsonAsync($"items/{id}", item);
        Console.WriteLine("Item updated successfully.");
    }

    private static async Task DeleteItem()
    {
        Console.Write("Enter the ID of the item to delete: ");
        var id = Console.ReadLine();
        await client.DeleteAsync($"items/{id}");
        Console.WriteLine("Item deleted successfully.");
    }
}