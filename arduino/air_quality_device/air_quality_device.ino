#include <WiFiNINA.h>
#include <ArduinoJson.h>
#include "secrets.h"

#define URL "auto-air-quality-system.herokuapp.com"
#define MODEL "nov20" // The model ID of the Arduino; this is used to know which user to send the data to
#define SENSOR_READ_DELAY 5000

WiFiClient client;

void setup()
{
  Serial.begin(9600);
  while (!Serial)
  {
  }
  Serial.println("Connecting to WiFi...");
  WiFi.begin(WIFI_ID, WIFI_PASS);
  Serial.println("Connected!");
}

void loop()
{
  float airQualityReading = readAirQualitySensor();

  // Create JSON string and send data to server
  String data = "{\"params\": { \"data\": { \"model\": \"" + String(MODEL) + "\", \"value\": \"" + String(airQualityReading) + "\"}}}";
  sendData(data);
  DynamicJsonDocument response = getResponse();
  String username = response["username"];
  String AQHITimeRead = response["timeRead"];
  float AQHIValue = response["value"];

  Serial.println(username);
  Serial.println(AQHITimeRead);
  Serial.println(AQHIValue);

  // TODO: Display user and current air quality reading on LCD. If no user from response, then display "Model is not connected to a user."

  delay(SENSOR_READ_DELAY);
}

void sendData(String body)
{
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

DynamicJsonDocument getResponse()
{
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

// TODO: replace code in here with sensor data
float readAirQualitySensor()
{
  return random(11);
}