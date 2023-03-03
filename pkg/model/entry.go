package model

type Entry struct {
	Title         string
	Content       string
	ImageURLs     []string
	Author        string
	Date          string
	URL           string
	FavoriteCount string
}

/*
func (e *Entry) DownloadImages() {
	if len(e.ImageURLs) == 0 {
		return
	}

	imgDownloadURLs := []string{}
	collector := colly.NewCollector()

	collector.OnRequest(func(r *colly.Request) {
		for header, value := range config.Headers {
			r.Headers.Set(header, value)
		}
	})

	collector.OnHTML("#download-hidden", func(e *colly.HTMLElement) {
		imgDownloadURL := e.Attr("href")
		imgDownloadURLs = append(imgDownloadURLs, fmt.Sprintf("https://eksisozluk.com%s", imgDownloadURL))
	})

	for _, imageURL := range e.ImageURLs {
		collector.Visit(imageURL)
	}

	for _, imgDownloadURL := range imgDownloadURLs {
		err := utils.DownloadImage(imgDownloadURL, fmt.Sprintf("%s.jpg", strings.Split(imgDownloadURL, "/")[5]))
		if err != nil {
			log.Fatal(err)
		}
	}
}
*/
