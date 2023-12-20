#include <WiFiNINA.h>
#include <ArduinoJson.h>

//const char* ssid = "Vodafone-C02030120";
//const char* password = "pEyK4khRrLGC6NZr";

const char* ssid = "WiFi";
const char* password = "s1jzsjkw5b";

// REST API endpoint
const char* server = "192.168.1.7";
const int port = 5000; // Change this to the appropriate port

const int moistureSensorPin = A1;	

WiFiClient wifiClient;

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
      String("POST ") + path + " HTTP/1.1\r\n" +
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

void sendJsonGet(const char* server, const int port, String path, String getData, String* response){
  WiFiClient myClient;
  if (myClient.connect(server, port)){
    Serial.print("[+]OK: Connected to http//");
    Serial.print(server);
    Serial.print(":");
    Serial.print(port);
    Serial.println(path);
    myClient.print
    (
      String("GET ") + path + " HTTP/1.1\r\n" +
      "Content-Type: application/json\r\n" +
      "Content-Length: " + getData.length() + "\r\n" +
      "\r\n" +
      getData
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


void sendRegisterDevicePost(String macString){
  String result = "";
  sendJsonPost(server, port, "/api/device/register", getJsonDataRegister(macString), &result);
  Serial.println(result);
}

String getJsonDataRegister(String macString){
  String jsonPayload;
  DynamicJsonDocument doc(200);
  doc["id"] = macString;
  serializeJson(doc, jsonPayload);
  return jsonPayload;
}

void connectToWifi(){
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

}

String getMacString(){

  byte mac[6];
  String macString = "";

  WiFi.macAddress(mac);

  macString += String(mac[5], HEX);
  macString += String(mac[4], HEX);
  macString += String(mac[3], HEX);
  macString += String(mac[2], HEX);
  macString += String(mac[1], HEX);
  macString += String(mac[0], HEX);

  Serial.println("MAC Address: " + macString);

  return macString;

}

void connectToWifiAndRegister(){
  connectToWifi();
  sendRegisterDevicePost(getMacString());
}

String extractResponse(String response, String key){
  int jsonStart = response.indexOf('{');

  // Extract the JSON content
  String jsonString = response.substring(jsonStart);

  // Parse the JSON content
  StaticJsonDocument<200> jsonDocument;
  DeserializationError error = deserializeJson(jsonDocument, jsonString);


  // Extract the value of the "message" field
  String message = jsonDocument[key];

  // Print or store the message
  return message;
}

void setup() {
  Serial.begin(9600);
  Serial.println("Begin Setup ...");
  //connectToWifiAndRegister();
  
}

void loop() {
  float moisture_percentage;
  int sensorValue;
  sensorValue = analogRead(moistureSensorPin);
  Serial.println(sensorValue);
  moisture_percentage = ( 100 - ( (sensorValue/1023.00) * 100 ) );
  Serial.print("Moisture Percentage = ");
  Serial.print(moisture_percentage);
  Serial.print("%\n\n");
  delay(1000);
}
 

