package config

var Headers = map[string]string{
	"User-Agent":       "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/109.0",
	"Accept":           "*/*",
	"Accept-Language":  "tr-TR,tr;q=0.8,en-US;q=0.5,en;q=0.3",
	"Accept-Encoding":  "gzip, deflate, br",
	"X-Requested-With": "XMLHttpRequest",
	"DNT":              "1",
	"Connection":       "keep-alive",
	"Referer":          "https://eksisozluk.com/",
	"Cookie":           "iq=ee02adecd29b4f61838ce0611247bb8c; ASP.NET_SessionId=uxyc1kb2uzivvf5oqbnraka5; channel-filter-preference-cookie=W3siSWQiOjEsIlByZWYiOnRydWV9LHsiSWQiOjIsIlByZWYiOnRydWV9LHsiSWQiOjQsIlByZWYiOnRydWV9LHsiSWQiOjUsIlByZWYiOnRydWV9LHsiSWQiOjEwLCJQcmVmIjpmYWxzZX0seyJJZCI6MTEsIlByZWYiOmZhbHNlfSx7IklkIjozOSwiUHJlZiI6ZmFsc2V9XQ==; lastnwcrtid_571={}; __AP_SESSION__=b348954f-6535-498f-bf29-d183be0da0a8; OptanonConsent=isGpcEnabled=0&datestamp=Wed+Feb+01+2023+01%3A32%3A17+GMT%2B0300+(GMT%2B03%3A00)&version=6.34.0&isIABGlobal=false&consentId=cf190a2f-866b-413b-8c2d-255be91ddc6b&interactionCount=2&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1%2CC0004%3A0&hosts=H32%3A0%2CH43%3A0%2CH33%3A0%2CH34%3A0%2CH35%3A0%2CH2%3A0%2CH3%3A0%2CH4%3A0%2CH5%3A0%2CH36%3A0%2CH6%3A0%2CH7%3A0%2CH9%3A0%2CH10%3A0%2CH37%3A0%2CH11%3A0%2CH12%3A0%2CH45%3A0%2CH13%3A0%2CH27%3A0%2CH14%3A0%2CH38%3A0%2CH39%3A0%2CH44%3A0%2CH16%3A0%2CH18%3A0%2CH40%3A0%2CH19%3A0%2CH20%3A0%2CH21%3A0%2CH41%3A0%2CH42%3A0%2CH22%3A0&genVendors=&AwaitingReconsent=false; __RequestVerificationToken=WdEjd5ZMvwGKNbiAhn1Sn2ntovhnXj5PNxjg-lfO5HWKlmlGFgv56C3G3AhcUtXxK0_pOpddbFLg7oZcvOBCMWpnduDym-53y2TrzHo81DM1; OptanonAlertBoxClosed=2023-01-31T22:32:17.118Z",
	"Sec-Fetch-Dest":   "empty",
	"Sec-Fetch-Mode":   "cors",
	"Sec-Fetch-Site":   "same-origin",
	"Pragma":           "no-cache",
	"Cache-Control":    "no-cache",
	"TE":               "trailers",
}

const (
	Port         = "4455"
	TemplatePath = "./web/template"
	StaticPath   = "./web/static"

	TitleFontSize          = 36
	TitleColor             = "81C14B"
	SubtitleAuthorFontSize = 18
	SubtitleAuthorColor    = "000000"
	SubtitleFontSize       = 18
	SubtitleColor          = "81C14B"
	EntryTitleFontSize     = 16
	EntryTitleColor        = "000000"
	EntryFontSize          = 12
	EntryColor             = "000000"
	EntryAuthorFontSize    = 12
	EntryAuthorColor       = "81C14B"
)
