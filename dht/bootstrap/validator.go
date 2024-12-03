package main

type CustomValidator struct{}

func (v *CustomValidator) Validate(key string, value []byte) error {
	// Perform custom validation on the key and value
	// Here, we are just accepting any value as valid
	return nil
}

func (v *CustomValidator) Select(key string, values [][]byte) (int, error) {
	// In case of multiple values, return the index of the best value
	return 0, nil
}
