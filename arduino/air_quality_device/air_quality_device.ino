#include <Nextion.h>
#include <WiFiNINA.h>
#include <ArduinoJson.h>
#include "secrets.h"

#define URL "auto-air-quality-system.herokuapp.com"
#define MODEL "funmodel1234" // The model ID of the Arduino; this is used to know which user to send the data to
#define SENSOR_READ_DELAY 5000
#define NUM_OF_PROGRESS_UPDATES 10

WiFiClient client;

NexText cityDisplay = NexText(0, 5, "city");
NexText usernameDisplay = NexText(0, 4, "username");
NexText outsideAQHIDisplay = NexText(0, 8, "outdoorAQHI");
NexText lastRecordedDisplay = NexText(0, 9, "lastRecorded");
NexText indoorPM25Display = NexText(0, 10, "indoorPM25");
NexProgressBar progressBarDisplay = NexProgressBar(0, 6, "progress");

SoftwareSerial HMISerial(0, 1);  

void setup() {
  Serial.begin(9600);
  while (!Serial)
  {
  }
  nexInit();
  Serial.println("Connecting to WiFi...");
  WiFi.begin(WIFI_ID, WIFI_PASS);
  Serial.println("Connected!");
}

void loop() {
  float airQualityReading = readAirQualitySensor();

  // Create JSON string and send data to server
  String data = "{\"params\": { \"data\": { \"model\": \"" + String(MODEL) + "\", \"value\": \"" + String(airQualityReading) + "\"}}}";
  sendData(data);
  // Parse response
  DynamicJsonDocument response = getResponse();
  char *username = response["username"];
  char *AQHITimeRead = response["timeRead"];
  char *city = response["city"];
  float AQHIValue = response["value"];

  Serial.println(username);
  Serial.println(AQHITimeRead);
  Serial.println(AQHIValue);

  sendDataToDisplay(city, username, airQualityReading, AQHITimeRead, AQHIValue);

  waitForNextReading();
}

void sendData(String body) {
  if (WiFi.status() != WL_CONNECTED)
  {
    return;
  }
  if (client.connect(URL, 80))
  {
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
  else
  {
    Serial.println("Could not connect to server.");
  }
}

DynamicJsonDocument getResponse() {
  String responseJsonStr = "";
  bool beginParsing = false;

  while (!client.available())
    ; // This will wait for the response
  while (client.available())
  {
    char c = client.read();
    if (c == '{' || beginParsing)
    {
      beginParsing = true;
      responseJsonStr = responseJsonStr + c;
    }
  }
  Serial.println(responseJsonStr);
  DynamicJsonDocument responseJson(1000);
  DeserializationError error = deserializeJson(responseJson, responseJsonStr);
  if (error)
  {
    Serial.println("Failed to deserialize JSON.");
    Serial.println(error.f_str());
  }
  return responseJson;
}

void sendDataToDisplay(char *city, char *username, float indoorPM25Reading, char *AQHITimeRead, float outdoorAQHIValue) {
  String indoorPM25Str = String(indoorPM25Reading);
  String outdoorAQHIStr = String(outdoorAQHIValue);

  cityDisplay.setText(city);
  usernameDisplay.setText(username);
  indoorPM25Display.setText(indoorPM25Str.c_str());
  lastRecordedDisplay.setText(AQHITimeRead);
  outsideAQHIDisplay.setText(outdoorAQHIStr.c_str());
}

// TODO: replace code in here with sensor data
float readAirQualitySensor() {
  return random(1001) * 0.001;
}

void waitForNextReading() {
  int timePerProgressUpdate = SENSOR_READ_DELAY / NUM_OF_PROGRESS_UPDATES;
  for (int i = 0; i < NUM_OF_PROGRESS_UPDATES; i++) {
    int progress = ((float(i) * timePerProgressUpdate) / SENSOR_READ_DELAY) * 100;
    Serial.println(progress);
    progressBarDisplay.setValue(progress);
    delay(timePerProgressUpdate);
  }
  progressBarDisplay.setValue(100);
}