package main

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	dbClient     *mongo.Client
	dbName       = "fileRecordsDB"
	dbCollection = "fileRecords"
)

// InitializeDatabase connects to the MongoDB instance
func InitializeDatabase(uri string) error {
	var err error
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	dbClient, err = mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return fmt.Errorf("failed to connect to MongoDB: %w", err)
	}

	// Check connection
	if err := dbClient.Ping(ctx, nil); err != nil {
		return fmt.Errorf("failed to ping MongoDB: %w", err)
	}

	fmt.Println("Connected to MongoDB!")

	collectionNames, err := dbClient.Database(dbName).ListCollectionNames(ctx, bson.M{})
	if err != nil {
		return fmt.Errorf("failed to list collections: %w", err)
	}

	collectionExists := false
	for _, name := range collectionNames {
		if name == dbCollection {
			collectionExists = true
			break
		}
	}

	if !collectionExists {
		err = dbClient.Database(dbName).CreateCollection(ctx, dbCollection)
		if err != nil {
			return fmt.Errorf("failed to create collection: %w", err)
		}
		fmt.Printf("Collection '%s' created successfully.\n", dbCollection)
	} else {
		fmt.Printf("Collection '%s' already exists.\n", dbCollection)
	}

	proxyCollectionExists := false
	for _, name := range collectionNames {
		if name == "proxies" {
			proxyCollectionExists = true
			break
		}
	}

	if !proxyCollectionExists {
		err = dbClient.Database(dbName).CreateCollection(ctx, "proxies")
		if err != nil {
			return fmt.Errorf("failed to create proxies collection: %w", err)
		}
		fmt.Printf("Collection 'proxies' created successfully.\n")
	} else {
		fmt.Printf("Collection 'proxies' already exists.\n")
	}

	return nil
}

// StoreFileRecord saves the file hash and path to the database
func StoreFileRecord(hash string, filename string, cost float64) error {
	collection := dbClient.Database(dbName).Collection(dbCollection)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	record := bson.M{
		"hash":      hash,
		"filename":  filename,
		"timestamp": time.Now(),
		"cost":      cost,
	}

	_, err := collection.InsertOne(ctx, record)
	if err != nil {
		return fmt.Errorf("failed to insert record: %w", err)
	}
	return nil
}

// GetFileRecord retrieves a file record by hash
func GetFileRecord(hash string) (map[string]interface{}, error) {
	collection := dbClient.Database(dbName).Collection(dbCollection)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var result map[string]interface{}
	err := collection.FindOne(ctx, bson.M{"hash": hash}).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to retrieve record: %w", err)
	}
	return result, nil
}

// DisconnectDatabase closes the MongoDB connection
func DisconnectDatabase() error {
	if dbClient == nil {
		return nil
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := dbClient.Disconnect(ctx); err != nil {
		return fmt.Errorf("failed to disconnect from MongoDB: %w", err)
	}
	return nil
}

func FetchAllFileRecords() ([]map[string]interface{}, error) {
	collection := dbClient.Database(dbName).Collection(dbCollection)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, fmt.Errorf("failed to fetch records: %w", err)
	}
	defer cursor.Close(ctx)

	var records []map[string]interface{}
	for cursor.Next(ctx) {
		var record map[string]interface{}
		if err := cursor.Decode(&record); err != nil {
			return nil, fmt.Errorf("failed to decode record: %w", err)
		}
		records = append(records, record)
	}

	return records, nil
}

func StoreProxy(peerID string) error {
	collection := dbClient.Database(dbName).Collection("proxies")
	ctx, cancel := context.WithTimeout(context.Background(), 5 * time.Second)
	defer cancel()

	record := bson.M {
		"peerID": peerID,
	}

	_, err := collection.InsertOne(ctx, record)
	if err != nil {
		return fmt.Errorf("Failed to insert proxy: %w", err)
	}
	return nil
}
// DeleteFileRecord deletes a file record by hash
func DeleteFileRecord(hash string) error {
	collection := dbClient.Database(dbName).Collection(dbCollection)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"hash": hash}

	result, err := collection.DeleteOne(ctx, filter)
	if err != nil {
		return fmt.Errorf("failed to delete record: %w", err)
	}

	if result.DeletedCount == 0 {
		return fmt.Errorf("no record found with hash: %s", hash)
	}

	return nil
}
