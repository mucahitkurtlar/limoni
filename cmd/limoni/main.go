package main

import (
	"fmt"
	"log"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/session"
	"github.com/gofiber/template/html"
	"github.com/mucahitkurtlar/limoni/pkg/config"
	"github.com/mucahitkurtlar/limoni/pkg/model"
	"github.com/mucahitkurtlar/limoni/pkg/router"
	"github.com/mucahitkurtlar/limoni/pkg/utils"
)

func main() {
	favCollector := model.NewFavCollector()
	favFile := model.NewFavFile()

	store := session.New()

	templatePath := filepath.FromSlash(config.TemplatePath)
	engine := html.New(templatePath, ".html")

	app := fiber.New(fiber.Config{
		Views:                 engine,
		DisableStartupMessage: true,
	})

	staticPath := filepath.FromSlash(config.StaticPath)
	app.Static("/static", staticPath)
	app.Get("/", router.IndexGetHandler())
	app.Post("/", router.IndexPostHandler(store, favCollector, favFile))
	app.Get("/entry", router.EntryGetHandler(store, favCollector))
	app.Post("/entry", router.EntryPostHandler(favCollector, favFile))
	app.Get("/download", router.DownloadGetHandler(favFile))
	app.Get("/exit", router.ExitGetHandler())

	utils.OpenInBrowser(fmt.Sprintf("http://localhost:%v", config.Port))
	log.Fatal(app.Listen(fmt.Sprintf(":%v", config.Port)))
}
