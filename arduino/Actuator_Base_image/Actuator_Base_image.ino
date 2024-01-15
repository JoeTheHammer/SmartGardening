#include <WiFiNINA.h>
#include <ArduinoHttpClient.h>
#include <ArduinoJson.h>

#define NO_OTA_NETWORK
#include <ArduinoOTA.h> // only for InternalStorage

#include "config.h"

int status = WL_IDLE_STATUS;
int FAILURE_COUNT = 0;
int relay = 6;
/**
Connection to backend server to get new image
**/

void handleSketchDownload(String server_ip) {
  const char* SERVER = server_ip.c_str();     // Set hostname
  const char* PATH = UPDATE_PATH;            // Set the URI for device


  // Time interval check
  static unsigned long previousMillis;
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis < UPDATE_CHECK_INTERVAL)
    return;
  previousMillis = currentMillis;

  WiFiClient wifiClient; 
  HttpClient client(wifiClient, SERVER, API_SERVER_PORT);

  char buff[32];
  snprintf(buff, sizeof(buff), PATH, 1);

  Serial.print("Check for update file ");
  Serial.println(buff);

  // Make the GET request
  client.get(buff);

  int statusCode = client.responseStatusCode();
  Serial.print("Update status code: ");
  Serial.println(statusCode);
  if (statusCode != 200) {
    client.stop();
    return;
  }

  long length = client.contentLength();
  if (length == HttpClient::kNoContentLengthHeader) {
    client.stop();
    Serial.println("Server didn't provide Content-length header. Can't continue with update.");
    return;
  }
  Serial.print("Server returned update file of size ");
  Serial.print(length);
  Serial.println(" bytes");

  if (!InternalStorage.open(length)) {
    client.stop();
    Serial.println("There is not enough space to store the update. Can't continue with update.");
    return;
  }
  byte b;
  while (length > 0) {
    if (!client.readBytes(&b, 1)) // reading a byte with timeout
      break;
    InternalStorage.write(b);
    length--;
  }
  InternalStorage.close();
  client.stop();
  if (length > 0) {
    Serial.print("Timeout downloading update file at ");
    Serial.print(length);
    Serial.println(" bytes. Can't continue with update.");
    return;
  }

  Serial.println("Sketch update apply and reset.");
  Serial.flush();
  InternalStorage.apply(); // this doesn't return
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
  return macString;
}


String getJsonDataRegister(String macString){
  String jsonPayload;
  DynamicJsonDocument doc(200);
  doc["id"] = macString;
  serializeJson(doc, jsonPayload);
  return jsonPayload;
}

void sendGetRequest(String path, String* response, int* status_code){
  WiFiClient httpClient;

  if (httpClient.connect(API_SERVER_IP, API_SERVER_PORT)){
    Serial.print("[+]OK: Connected to http//");
    Serial.print(API_SERVER_IP);
    Serial.print(":");
    Serial.print(API_SERVER_PORT);
    Serial.println(path);
    httpClient.print("GET " + path + getMacString() + " HTTP/1.1\n");
    httpClient.println();
  }
  else {
    Serial.print("[!]Error: Failed to send get to http//");
    Serial.print(API_SERVER_IP);
    Serial.print(":");
    Serial.print(API_SERVER_PORT);
    Serial.println(path);
  }
  
  //wait for data from server
  while(httpClient.available()==0){;}
  while(httpClient.available()){
    *response +=  httpClient.readString();
  }
  *status_code = getHttpResponse(*response);
}

void sendJsonPost(String path, String postData, String* response, int* status_code){
  WiFiClient httpClient;

  if (httpClient.connect(API_SERVER_IP, API_SERVER_PORT)){
    Serial.print("[+]OK: Connected to http//");
    Serial.print(API_SERVER_IP);
    Serial.print(":");
    Serial.print(API_SERVER_PORT);
    Serial.println(path);
    httpClient.print
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
    Serial.print(API_SERVER_IP);
    Serial.print(":");
    Serial.print(API_SERVER_PORT);
    Serial.println(path);
  }
  
  //wait for data from server
  while(httpClient.available()==0){;}
  while(httpClient.available()){
    *response +=  httpClient.readString();
  }
  *status_code = getHttpResponse(*response);
}

int getHttpResponse(String response){
  String status = response.substring(9, 13);
  status.trim();
  return status.toInt();
}

String getResponse(String response, String key){
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


void sendRegisterDevicePost(const char* server, const int port, String macString){
  String result = "";
  int status_code = 0;
  sendJsonPost(REGISTER_PATH, getJsonDataRegister(macString), &result, &status_code);
  Serial.println(result);
}

void connectToWifi(){
  status = WL_IDLE_STATUS;

  if (WiFi.status() == WL_NO_MODULE) {
    Serial.println("Communication with WiFi module failed");
    return;
  }

  while (status != WL_CONNECTED) {
    Serial.print("Attempt to connect to SSID: ");
    Serial.println(SSID);
    status = WiFi.begin(SSID, PASS);
  }
  Serial.println("WiFi connected");
}

/**
Code below has to be modified for each iot device img
**/
String generatePostJsonData(String macString, String measurementString){
  String jsonPayload;
  DynamicJsonDocument doc(200);
  doc["id"] = macString;
  doc["value"] = measurementString;
  serializeJson(doc, jsonPayload);
  return jsonPayload;
}

void switchStateActuator(int value){
  Serial.println(value);
  if(value == 1){
    digitalWrite(relay, HIGH);
    return;
  }

  digitalWrite(relay, LOW);
}

void setup() {
  Serial.begin(9600);
  while(!Serial);
  pinMode(relay, OUTPUT);
  
  connectToWifi();
  String result = "";
  int status_code = 0;
  sendJsonPost(REGISTER_PATH, getJsonDataRegister(getMacString()), &result, &status_code);
  Serial.print("Server response is ");
  Serial.println(result);
}

void loop() {
  String result = "";
  int status_code = 0;
  String postData = "";

  //Change string postData to include the mac of the device using getMac() and the value(s) that got collected by the sensor
  //postData = generatePostJsonData()

  sendGetRequest(TASK_PATH, &result, &status_code);

  if(status_code == 404){
    FAILURE_COUNT += 1;
    if(FAILURE_COUNT >= 3) {
      handleSketchDownload(API_SERVER_IP);
    }
    delay(DEFAULT_DELAY);
  }

  if(status_code >= 200 && status_code <= 300){
    Serial.println(getResponse(result, "message"));
    //TODO: Add actuator on/off logic based on response of the server
    int value = getResponse(result, "message").toInt();
    switchStateActuator(value);
    
    int sleep_value = getResponse(result, "sleep").toInt();
    Serial.println(sleep_value);
    WiFi.disconnect();
    WiFi.end();
    delay(sleep_value);
    connectToWifi();
  }
}