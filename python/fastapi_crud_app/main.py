from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

# Pydantic models
class ItemBase(BaseModel):
    name: str

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: int

    class Config:
        from_attributes = True

# In-memory database (list of items)
items_db = []
next_id = 1

@app.post("/items/", response_model=Item)
def create_item(item: ItemCreate):
    global next_id
    new_item = Item(id=next_id, name=item.name)
    items_db.append(new_item)
    next_id += 1
    return new_item

@app.get("/items/", response_model=List[Item])
def read_items():
    return items_db

@app.get("/items/{item_id}", response_model=Item)
def read_item(item_id: int):
    for item in items_db:
        if item.id == item_id:
            return item
    raise HTTPException(status_code=404, detail="Item not found")

@app.put("/items/{item_id}", response_model=Item)
def update_item(item_id: int, item: ItemCreate):
    for idx, existing_item in enumerate(items_db):
        if existing_item.id == item_id:
            items_db[idx].name = item.name
            return items_db[idx]
    raise HTTPException(status_code=404, detail="Item not found")

@app.delete("/items/{item_id}")
def delete_item(item_id: int):
    global items_db
    initial_len = len(items_db)
    items_db = [item for item in items_db if item.id != item_id]
    if len(items_db) == initial_len:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted successfully"}

