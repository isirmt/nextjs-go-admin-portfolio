package main

import (
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gen"
	"gorm.io/gorm"
)

func main() {
	dbUrl := os.Getenv("DATABASE_URL")
	if dbUrl == "" {
		log.Fatalf("dbUrl isn't set.")
	}

	gormDb, err := gorm.Open(postgres.Open(dbUrl), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database for generation: %v", err)
	}

	g := gen.NewGenerator(gen.Config{
		OutPath:           "internal/query",
		ModelPkgPath:      "internal/query/model",
		Mode:              gen.WithDefaultQuery | gen.WithQueryInterface,
		FieldNullable:     true,
		FieldCoverable:    true,
		FieldWithIndexTag: true,
		FieldWithTypeTag:  true,
	})

	g.UseDB(gormDb)

	g.ApplyBasic(
		g.GenerateModel("common_images"),
		g.GenerateModel("common_tech_stacks"),
		g.GenerateModel("isirmt_works"),
		g.GenerateModel("isirmt_work_images"),
		g.GenerateModel("isirmt_work_urls"),
		g.GenerateModel("isirmt_work_tech_stacks"),
		g.GenerateModel("isirmt_work_clicks"),
	)

	g.Execute()
}
