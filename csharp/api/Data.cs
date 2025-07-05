using Microsoft.EntityFrameworkCore;

public class Item
{
    public int? Id { get; set; }
    public string? Name { get; set; }
}

public class ApiDbContext : DbContext
{
    public DbSet<Item> Items { get; set; }

    public ApiDbContext(DbContextOptions<ApiDbContext> options) : base(options)
    {
    }
}
