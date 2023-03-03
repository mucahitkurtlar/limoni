package utils

import (
	"os/exec"
	"runtime"
)

func OpenInBrowser(url string) error {
	var cmd string
	var args []string

	switch runtime.GOOS {
	case "windows":
		cmd = "cmd"
		args = []string{"/c", "start"}
	case "darwin":
		cmd = "open"
	default:
		cmd = "xdg-open"
	}

	args = append(args, url)

	return exec.Command(cmd, args...).Start()
}

/*
func DownloadImage(url string, path string) (err error) {
	client := &http.Client{}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return
	}

	// set config.Headers as request headers
	for header, value := range config.Headers {
		req.Header.Set(header, value)
	}
	// Get the data
	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != 200 {
		err = fmt.Errorf("error downloading image: %s", url)
		return
	}
	defer resp.Body.Close()

	// Create the file
	out, err := os.Create(path)
	if err != nil {
		err = fmt.Errorf("error creating file: %s", path)
		return
	}
	defer out.Close()

	// Write the body to file
	_, err = io.Copy(out, resp.Body)
	if err != nil {
		err = fmt.Errorf("error writing to file: %s", path)
		return
	}

	return
}
*/
