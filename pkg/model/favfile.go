package model

import (
	"github.com/gingfrederik/docx"
	"github.com/mucahitkurtlar/limoni/pkg/config"
)

type FavFile struct {
	filePath string
	docxFile *docx.File
	nick     string
}

func NewFavFile() *FavFile {
	limoniFile := &FavFile{
		docxFile: docx.NewFile(),
	}

	return limoniFile
}

func (l *FavFile) GetFilePath() string {
	return l.filePath
}

func (l *FavFile) SetNick(nick string) {
	l.nick = nick
}

func (l *FavFile) SetPath(path string) {
	l.filePath = path
}

func (l *FavFile) AddHeader() {
	para := l.docxFile.AddParagraph()
	para.AddText("limoni").Size(config.TitleFontSize).Color(config.TitleColor)
	para = l.docxFile.AddParagraph()
	para.AddText(l.nick).Size(config.SubtitleAuthorFontSize).Color(config.SubtitleAuthorColor)
	para = l.docxFile.AddParagraph()
	para.AddText("favori arşiv dosyası").Size(config.SubtitleFontSize).Color(config.SubtitleColor)
	l.docxFile.AddParagraph()
	l.docxFile.AddParagraph()
}

func (l *FavFile) AddEntry(entry *Entry) {
	para := l.docxFile.AddParagraph()
	para.AddText(entry.Title).Size(config.EntryTitleFontSize).Color(config.EntryTitleColor)
	para = l.docxFile.AddParagraph()
	para.AddText(entry.Content).Size(config.EntryFontSize).Color(config.EntryColor)
	para = l.docxFile.AddParagraph()
	para.AddText(entry.Author).Size(config.EntryAuthorFontSize).Color(config.EntryAuthorColor)
	para = l.docxFile.AddParagraph()
	para.AddLink(entry.Date, entry.URL)
	l.docxFile.AddParagraph()
	l.docxFile.AddParagraph()
}

func (l *FavFile) Save() error {
	return l.docxFile.Save(l.filePath)
}
