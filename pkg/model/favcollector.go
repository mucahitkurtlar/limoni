package model

import (
	"fmt"
	"strings"

	"github.com/gocolly/colly"
	"github.com/mucahitkurtlar/limoni/pkg/config"
)

type FavCollector struct {
	entries   []*Entry
	collector *colly.Collector
	page      int
	nick      string
}

func NewFavCollector() *FavCollector {
	collector := colly.NewCollector()
	favCollector := &FavCollector{
		entries:   make([]*Entry, 0),
		collector: collector,
		page:      1,
	}

	collector.OnRequest(func(r *colly.Request) {
		for header, value := range config.Headers {
			r.Headers.Set(header, value)
		}
	})

	collector.OnHTML("div.topic-item", func(e *colly.HTMLElement) {
		title := e.ChildAttr("#title", "data-title")
		content := e.ChildText("div.content")
		imageURLs := []string{}
		urls := e.ChildAttrs("a", "href")
		for _, url := range urls {
			if strings.HasPrefix(url, "https://soz.lk/i/") {
				imageURLs = append(imageURLs, url)
			}
		}
		author := e.ChildText("a.entry-author")
		date := e.ChildText("a.entry-date.permalink")
		url := fmt.Sprintf("%s%s", "https://eksisozluk.com", e.ChildAttr("a.entry-date.permalink", "href"))
		favoriteCount := e.ChildAttr("li", "data-favorite-count")

		entry := &Entry{
			Title:         title,
			Content:       content,
			ImageURLs:     imageURLs,
			Author:        author,
			Date:          date,
			URL:           url,
			FavoriteCount: favoriteCount,
		}

		favCollector.entries = append(favCollector.entries, entry)
	})

	return favCollector
}

func (f *FavCollector) Size() int {
	return len(f.entries)
}

func (f *FavCollector) SetNick(nick string) {
	f.nick = nick
}

func (f *FavCollector) CollectNext() {
	f.collector.Visit(fmt.Sprintf("https://eksisozluk.com/favori-entryleri?_=1675204334068&p=%d&nick=%s", f.page, f.nick))
	f.page++
}

func (f *FavCollector) EntryCount() int {
	return len(f.entries)
}

func (f *FavCollector) GetEntry() Entry {
	return *f.entries[0]
}

func (f *FavCollector) PopEntry() Entry {
	entry := f.GetEntry()
	f.entries = f.entries[1:]
	f.CheckEntries()
	return entry
}

func (f *FavCollector) CheckEntries() {
	if len(f.entries) <= 1 {
		f.CollectNext()
	}
}
