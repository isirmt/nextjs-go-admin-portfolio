package main

import (
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gen"
	"gorm.io/gen/field"
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

	commonImage := g.GenerateModel("common_images")
	commonTechStack := g.GenerateModel("common_tech_stacks")
	blogTag := g.GenerateModel("blog_tags")
	blogSeries := g.GenerateModel("blog_series")
	blogSeriesArticle := g.GenerateModel(
		"blog_series_articles",

		gen.FieldJSONTag("series_id", "-"),
		gen.FieldJSONTag("article_id", "-"),
	)

	blogArticlePreviewLink := g.GenerateModel(
		"blog_article_preview_links",

		gen.FieldJSONTag("article_id", "-"),
	)
	blogArticleImage := g.GenerateModel(
		"blog_article_images",

		gen.FieldJSONTag("article_id", "-"),

		gen.FieldRelate(
			field.BelongsTo,
			"Image",
			commonImage,
			&field.RelateConfig{
				RelatePointer: true,
				JSONTag:       "-",
				GORMTag: field.GormTag{
					"foreignKey": []string{"ImageID"},
					"references": []string{"ID"},
				},
			},
		),
	)
	blogArticleTag := g.GenerateModel(
		"blog_article_tags",

		gen.FieldJSONTag("article_id", "-"),
		gen.FieldJSONTag("tag_id", "-"),
	)
	blogArticle := g.GenerateModel(
		"blog_articles",

		gen.FieldRelate(
			field.HasMany,
			"PreviewLinks",
			blogArticlePreviewLink,
			&field.RelateConfig{
				RelateSlicePointer: true,
				JSONTag:            "-",
				GORMTag: field.GormTag{
					"foreignKey": []string{"ArticleID"},
					"references": []string{"ID"},
				},
			},
		),

		gen.FieldRelate(
			field.Many2Many,
			"Tags",
			blogTag,
			&field.RelateConfig{
				RelateSlicePointer: true,
				GORMTag: field.GormTag{
					"many2many":      []string{"blog_article_tags"},
					"joinForeignKey": []string{"ArticleID"},
					"joinReferences": []string{"TagID"},
				},
			},
		),

		gen.FieldRelate(
			field.HasMany,
			"BodyImages",
			blogArticleImage,
			&field.RelateConfig{
				RelateSlicePointer: true,
				JSONTag:            "-",
				GORMTag: field.GormTag{
					"foreignKey": []string{"ArticleID"},
					"references": []string{"ID"},
				},
			},
		),

		gen.FieldRelate(
			field.BelongsTo,
			"ThumbnailImage",
			commonImage,
			&field.RelateConfig{
				RelatePointer: true,
				GORMTag: field.GormTag{
					"foreignKey": []string{"ThumbnailImageID"},
					"references": []string{"ID"},
				},
			},
		),
	)
	workTechStack := g.GenerateModel("isirmt_work_tech_stacks")
	workClick := g.GenerateModel("isirmt_work_clicks")

	workURL := g.GenerateModel(
		"isirmt_work_urls",

		gen.FieldJSONTag("work_id", "-"),
	)

	workImage := g.GenerateModel(
		"isirmt_work_images",

		gen.FieldJSONTag("work_id", "-"),

		gen.FieldRelate(
			field.BelongsTo,
			"Image",
			commonImage,
			&field.RelateConfig{
				RelatePointer: true,
				JSONTag:       "-",
				GORMTag: field.GormTag{
					"foreignKey": []string{"ImageID"},
					"references": []string{"ID"},
				},
			},
		),
	)

	work := g.GenerateModel(
		"isirmt_works",

		gen.FieldRelate(
			field.HasMany,
			"WorkImages",
			workImage,
			&field.RelateConfig{
				RelateSlicePointer: true,
				JSONTag:            "images",
				GORMTag: field.GormTag{
					"foreignKey": []string{"WorkID"},
					"references": []string{"ID"},
				},
			},
		),

		gen.FieldRelate(
			field.HasMany,
			"URLs",
			workURL,
			&field.RelateConfig{
				RelateSlicePointer: true,
				GORMTag: field.GormTag{
					"foreignKey": []string{"WorkID"},
					"references": []string{"ID"},
				},
			},
		),

		gen.FieldRelate(
			field.Many2Many,
			"TechStacks",
			commonTechStack,
			&field.RelateConfig{
				RelateSlicePointer: true,
				GORMTag: field.GormTag{
					"many2many":      []string{"isirmt_work_tech_stacks"},
					"joinForeignKey": []string{"WorkID"},
					"joinReferences": []string{"TechStackID"},
				},
			},
		),

		gen.FieldRelate(
			field.BelongsTo,
			"ThumbnailImage",
			commonImage,
			&field.RelateConfig{
				RelatePointer: true,
				GORMTag: field.GormTag{
					"foreignKey": []string{"ThumbnailImageID"},
					"references": []string{"ID"},
				},
			},
		),
	)

	g.ApplyBasic(
		commonImage,
		commonTechStack,
		blogArticle,
		blogArticleImage,
		blogArticleTag,
		blogArticlePreviewLink,
		blogTag,
		blogSeries,
		blogSeriesArticle,
		work,
		workImage,
		workURL,
		workTechStack,
		workClick,
	)

	g.Execute()
}
