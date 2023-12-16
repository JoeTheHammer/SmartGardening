#include <WiFiNINA.h>
#include <dht.h>
#include <ArduinoJson.h>

dht DHT;
#define DHT22_pin 8
int measure;


const char* ssid = "WiFi-LabIoT";
const char* password = "s1jzsjkw5b";
byte mac[6];
String macString = "";

// REST API endpoint
const char* server = "192.168.1.134";
const int port = 5000; // Change this to the appropriate port

WiFiClient wifiClient;

void setup() {
  Serial.begin(9600);
  Serial.println("Begin Setup ...");

  WiFi.begin(ssid, password);

  if (WiFi.status() == WL_NO_MODULE) {
    Serial.println("Communication with WiFi module failed");
  }

  Serial.println("Connecting to WiFi...");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n");
  Serial.println("Connected to WiFi network");

  WiFi.macAddress(mac);

  macString += String(mac[5], HEX);
  macString += String(mac[4], HEX);
  macString += String(mac[3], HEX);
  macString += String(mac[2], HEX);
  macString += String(mac[1], HEX);
  macString += String(mac[0], HEX);

  Serial.println("MAC Address: " + macString);

}

void loop() {
  String result = "";
  measure = DHT.read22(DHT22_pin);
  String measurementString = getMeasurementString();
  sendJsonPost(server, port, "/api/report", getJsonDataForTemperatureHumidity(macString, getMeasurementString()), &result);
  Serial.println("RESULT:");
  Serial.println(result);
  delay(20000);
}

String getMeasurementString() {
  String measurementString = "";
  measurementString += DHT.temperature;
  measurementString += "-";
  measurementString += DHT.humidity;

  return measurementString;
}

String getJsonDataForTemperatureHumidity(String macString, String measurementString){
  String jsonPayload;
  DynamicJsonDocument doc(200);
  doc["mac"] = macString;
  doc["value"] = measurementString;
  serializeJson(doc, jsonPayload);
  return jsonPayload;

}

void sendJsonPost(const char* server, const int port, String path, String postData, String* response){
  WiFiClient myClient;
  if (myClient.connect(server, port)){
    Serial.print("[+]OK: Connected to http//");
    Serial.print(server);
    Serial.print(":");
    Serial.print(port);
    Serial.println(path);
    myClient.print
    (
      String("POST ") + "/api/report" + " HTTP/1.1\r\n" +
      "Content-Type: application/json\r\n" +
      "Content-Length: " + postData.length() + "\r\n" +
      "\r\n" +
      postData
    );
  }
  else {
    Serial.print("[!]Error: Failed to send post to http//");
    Serial.print(server);
    Serial.print(":");
    Serial.print(port);
    Serial.println(path);
  }
  
  //wait for data from server
  while(myClient.available()==0){;}
  while(myClient.available()){
    *response +=  myClient.readString();
  }
}


