#include <WiFiNINA.h>
#include "secrets.h"

#define URL "auto-air-quality-system.herokuapp.com"
#define MODEL "new_test" // The model ID of the Arduino; this is used to know which user to send the data to
#define SENSOR_READ_DELAY 5000

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
  int value = readAirQualitySensor();

  // Create JSON string and send data to server
  String data = "{\"params\": { \"data\": { \"model\": \"" + String(MODEL) + "\", \"value\": \"" + String(value) + "\"}}}";
  sendData(data);
  
  delay(SENSOR_READ_DELAY);
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
  printResponse();
}

void printResponse() {
  while (client.available()) {
    char c = client.read();
    Serial.write(c);
  }
}

// TODO: replace code in here with sensor data
float readAirQualitySensor() {
  return random(11);
}