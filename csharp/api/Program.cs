using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<ApiDbContext>(options =>
    options.UseInMemoryDatabase("Items"));

// Add CORS services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowGatsby",
        builder =>
        {
            builder.WithOrigins("*") // Gatsby dev server
            // builder.WithOrigins("http://localhost:8000") // Gatsby dev server
                   .AllowAnyHeader()
                   .AllowAnyMethod();
        });
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Use CORS middleware
app.UseCors("AllowGatsby");

app.MapGet("/items", async (ApiDbContext db) =>
    await db.Items.ToListAsync());

app.MapGet("/items/{id}", async (ApiDbContext db, int id) =>
    await db.Items.FindAsync(id)
        is Item item
            ? Results.Ok(item)
            : Results.NotFound());

app.MapPost("/items", async (ApiDbContext db, Item item) =>
{
    db.Items.Add(item);
    await db.SaveChangesAsync();

    return Results.Created($"/items/{item.Id}", item);
});

app.MapPut("/items/{id}", async (ApiDbContext db, int id, Item inputItem) =>
{
    var item = await db.Items.FindAsync(id);

    if (item is null) return Results.NotFound();
    Console.WriteLine(inputItem.Name);
    Console.WriteLine(inputItem.Id);
    item.Name = inputItem.Name;

    await db.SaveChangesAsync();

    return Results.NoContent();
});

app.MapDelete("/items/{id}", async (ApiDbContext db, int id) =>
{
    if (await db.Items.FindAsync(id) is Item item)
    {
        db.Items.Remove(item);
        await db.SaveChangesAsync();
        return Results.Ok(item);
    }

    return Results.NotFound();
});

app.Run();
