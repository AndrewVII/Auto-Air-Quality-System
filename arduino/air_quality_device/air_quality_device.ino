// On line 37 of NexConfig.h, must replace line with:
// #include <SoftwareSerial.h>
// extern SoftwareSerial HMISerial;
// #define nexSerial HMISerial

#include <Nextion.h>
#include <WiFiNINA.h>
#include <ArduinoJson.h>
#include "Adafruit_PM25AQI.h"
#include "secrets.h"
#include <DHT.h>

#define URL "auto-air-quality-system.herokuapp.com"
#define MODEL "designdaytest" // The model ID of the Arduino; this is used to know which user to send the data to
#define SENSOR_READ_DELAY 2000
#define NUM_OF_PROGRESS_UPDATES 10

#define MOTOR1_POS 13
#define MOTOR1_NEG 12
#define MOTOR2_POS 11
#define MOTOR2_NEG 10
#define MOTOR_1_DELAY 120
#define MOTOR_2_DELAY 80

#define DHT_PIN 7
#define DHT_TYPE 22

WiFiClient client;

NexText cityDisplay = NexText(0, 5, "city");
NexText usernameDisplay = NexText(0, 4, "username");
NexText outsideAQHIDisplay = NexText(0, 8, "outdoorAQHI");
NexText lastRecordedDisplay = NexText(0, 9, "lastRecorded");
NexText indoorPM25Display = NexText(0, 10, "indoorPM25");
NexText tempDisplay = NexText(0, 10, "temp");
NexText humidityDisplay = NexText(0, 11, "humidity");
NexText filterNumDisplay = NexText(0, 12, "filterNum");
NexProgressBar progressBarDisplay = NexProgressBar(0, 6, "progress");

Adafruit_PM25AQI aqi = Adafruit_PM25AQI();

DHT dht(DHT_PIN, DHT_TYPE);

SoftwareSerial HMISerial(0, 1);
SoftwareSerial pmSerial(2, 3);

bool isMotor1Engaged = false;
bool isMotor2Engaged = false;


void setup() {
  Serial.begin(9600);
  while (!Serial)
  {
  }
  nexInit();
  dht.begin();
  pmSerial.begin(9600);
  if (! aqi.begin_UART(&pmSerial)) {
    Serial.println("Could not find PM 2.5 sensor!");
    while (1) delay(10);
  } else {
    Serial.println("Found PM 2.5 sensor!");
  }
  Serial.println("Connecting to WiFi...");
  WiFi.begin(WIFI_ID, WIFI_PASS);
  Serial.println("Connected!");

  pinMode(MOTOR1_POS, OUTPUT);
  pinMode(MOTOR1_NEG, OUTPUT);
  pinMode(MOTOR2_POS, OUTPUT);
  pinMode(MOTOR2_NEG, OUTPUT);
}

void loop() {
  float airQualityReading = readAirQualitySensor();
  float temp = dht.readTemperature();
  float humidity = dht.readHumidity();

  float aqhiSim = random(101) * 0.1;

  Serial.println("TEMP: " + String(temp) + ", HUMIDITY: " + String(humidity));

  // Create JSON string and send data to server
  String data = "{\"params\": { \"data\": { \"model\": \"" + String(MODEL) + "\", \"value\": \"" + String(airQualityReading) + "\"}}}";
  sendData(data);
  // Parse response
  DynamicJsonDocument response = getResponse();
  char *username = response["username"];
  char *AQHITimeRead = response["timeRead"];
  char *city = response["city"];
  float AQHIValue = response["value"];

  motorEngagement(aqhiSim);

  sendDataToDisplay(city, username, airQualityReading, AQHITimeRead, aqhiSim, temp, humidity, (int) isMotor1Engaged + (int) isMotor2Engaged);

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

void sendDataToDisplay(char *city, char *username, float indoorPM25Reading, char *AQHITimeRead, float outdoorAQHIValue, float temp, float humidity, int filterNum) {
  String indoorPM25Str = String(indoorPM25Reading);
  String outdoorAQHIStr = String(outdoorAQHIValue);
  String tempStr = "temp: " + String(temp) + " C";
  String humidityStr = "h: " + String(humidity) + "\%";
  String filterNumStr = "Filters engaged: " + String(filterNum);

  cityDisplay.setText(city);
  usernameDisplay.setText(username);
  indoorPM25Display.setText(indoorPM25Str.c_str());
  lastRecordedDisplay.setText(AQHITimeRead);
  outsideAQHIDisplay.setText(outdoorAQHIStr.c_str());
  tempDisplay.setText(tempStr.c_str());
  humidityDisplay.setText(humidityStr.c_str());
  filterNumDisplay.setText(filterNumStr.c_str());
}

// TODO: replace code in here with sensor data
float readAirQualitySensor() {
  PM25_AQI_Data data;
  pmSerial.listen();
  while (! aqi.read(&data)) {
    Serial.println("Could not read from AQI! waiting 100 ms...");
    delay(100);
  }
  Serial.print("PM 2.5: ");
  Serial.println(data.pm25_standard);
  return data.pm25_standard;
}

void waitForNextReading() {
  int timePerProgressUpdate = SENSOR_READ_DELAY / NUM_OF_PROGRESS_UPDATES;
  for (int i = 0; i < NUM_OF_PROGRESS_UPDATES; i++) {
    int progress = ((float(i) * timePerProgressUpdate) / SENSOR_READ_DELAY) * 100;
    progressBarDisplay.setValue(progress);
    delay(timePerProgressUpdate);
  }
  progressBarDisplay.setValue(100);
}

void motorEngagement(float AQHI) {
  if (AQHI < 4) {
    isMotor1Engaged = disengageMotor(MOTOR1_POS, MOTOR1_NEG, isMotor1Engaged, (int) MOTOR_1_DELAY);
    isMotor2Engaged = disengageMotor(MOTOR2_POS, MOTOR2_NEG, isMotor2Engaged, (int) MOTOR_2_DELAY);
  } else if (AQHI < 7) {
    isMotor1Engaged = engageMotor(MOTOR1_POS, MOTOR1_NEG, isMotor1Engaged, (int) MOTOR_1_DELAY);
    isMotor2Engaged = disengageMotor(MOTOR2_POS, MOTOR2_NEG, isMotor2Engaged, (int) MOTOR_2_DELAY);
  } else {
    isMotor1Engaged = engageMotor(MOTOR1_POS, MOTOR1_NEG, isMotor1Engaged, (int) MOTOR_1_DELAY);
    isMotor2Engaged = engageMotor(MOTOR2_POS, MOTOR2_NEG, isMotor2Engaged, (int) MOTOR_2_DELAY);
  }
  Serial.println("motor 1 status: " + String(isMotor1Engaged));
  Serial.println("motor 2 status: " + String(isMotor2Engaged));
  Serial.println("AQHI: " + String(AQHI));
}

bool engageMotor(int posPin, int negPin, bool isEngaged, int motorDelay) {
  if (isEngaged) {
    return true;
  }
  digitalWrite(posPin, HIGH);
  digitalWrite(negPin, LOW);
  delay(motorDelay);
  digitalWrite(posPin, LOW);
  digitalWrite(negPin, LOW);
  return true;
 }

bool disengageMotor(int posPin, int negPin, bool isEngaged, int motorDelay) {
  if (!isEngaged) {
    return false;
  }
  digitalWrite(posPin, LOW);
  digitalWrite(negPin, HIGH);
  delay(motorDelay);
  digitalWrite(posPin, LOW);
  digitalWrite(negPin, LOW);
  return false;
}