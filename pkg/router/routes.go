package router

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/session"
	"github.com/mucahitkurtlar/limoni/pkg/model"
)

func IndexGetHandler() func(c *fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		return c.Render("index", fiber.Map{})
	}
}

func IndexPostHandler(store *session.Store, favCollector *model.FavCollector, favFile *model.FavFile) func(c *fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		sess, _ := store.Get(c)
		if sess.Get("nick") != nil {
			return c.Redirect("/entry")
		}
		nick := strings.Clone(c.FormValue("nick"))
		sess.Set("nick", nick)
		err := sess.Save()
		if err != nil {
			log.Printf("session save error: %v", err)
		}
		favCollector.SetNick(nick)
		favCollector.CollectNext()
		tempdir := os.TempDir()
		slashPath := fmt.Sprintf("%s/%s.docx", tempdir, nick)
		path := filepath.FromSlash(slashPath)
		favFile.SetPath(path)
		favFile.SetNick(nick)
		favFile.AddHeader()
		return c.Redirect("/entry")
	}
}

func EntryGetHandler(store *session.Store, favCollector *model.FavCollector) func(c *fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		sess, _ := store.Get(c)
		if sess.Get("nick") == nil {
			return c.Redirect("/")
		} else if favCollector.EntryCount() <= 0 {
			return c.Redirect("/download")
		}
		return c.Render("entry", fiber.Map{
			"title":         favCollector.GetEntry().Title,
			"content":       favCollector.GetEntry().Content,
			"author":        favCollector.GetEntry().Author,
			"favoriteCount": favCollector.GetEntry().FavoriteCount,
			"date":          favCollector.GetEntry().Date,
			"url":           favCollector.GetEntry().URL,
		})
	}
}

func EntryPostHandler(favCollector *model.FavCollector, favFile *model.FavFile) func(c *fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		action := c.FormValue("action")
		if action == "arşivle" {
			entry := favCollector.PopEntry()
			favFile.AddEntry(&entry)
			favFile.Save()
		} else if action == "boşver" {
			favCollector.PopEntry()
		} else if action == "bitir" {
			favFile.Save()
			return c.Redirect("/download")
		}
		return c.Render("entry", fiber.Map{
			"title":         favCollector.GetEntry().Title,
			"content":       favCollector.GetEntry().Content,
			"author":        favCollector.GetEntry().Author,
			"favoriteCount": favCollector.GetEntry().FavoriteCount,
			"date":          favCollector.GetEntry().Date,
			"url":           favCollector.GetEntry().URL,
		})
	}
}

func DownloadGetHandler(favFile *model.FavFile) func(c *fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		if favFile.GetFilePath() == "" {
			return c.Redirect("/")
		}
		return c.SendFile(favFile.GetFilePath())
	}
}
