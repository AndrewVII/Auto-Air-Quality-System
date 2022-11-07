#include <WiFiNINA.h>
#include "secrets.h"

#define URL "auto-air-quality-system.herokuapp.com" // Change to real url

WiFiClient client;

void setup() {
  Serial.begin(9600);
  while (!Serial) {
  }
  Serial.println("Connecting to WiFi...");
  WiFi.begin(WIFI_ID, WIFI_PASS);
  Serial.println("Connected!");
}

void loop() {
  int value = 100;
  String model = "Test2";
  String data = "{\"params\": { \"data\": { \"model\": \"" + model + "\", \"value\": \"" + String(value) + "\"}}}";
  sendData(data);

  // Log response
  while (client.available()) {
    char c = client.read();
    Serial.write(c);
  }
  delay(5000);
}

void sendData(String body) {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }
  if (client.connect(URL, 80)) {
    Serial.println("Sending data to server...");
    client.println("POST /api/user/air-quality-data HTTP/1.0");
    client.println("Host: " + String(URL));
    client.println("Content-Type: application/json");
    client.println("Accept: */*");
    client.println("Accept-Encoding: gzip, deflate, br");
    client.println("Content-Length: " + String(body.length()));
    client.println("Connection: keep-alive");
    client.println();
    client.println(body);
    Serial.println("Sent!");
  }
}