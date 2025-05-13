package models

import (
  "go.mongodb.org/mongo-driver/v2/bson"
)

type Book struct {
	ID     bson.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Title  string             `json:"title" bson:"title"`
	Author string             `json:"author" bson:"author"`
	Year   int                `json:"year" bson:"year"`
}

